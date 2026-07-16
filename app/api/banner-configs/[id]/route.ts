import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

// Loads a config and reports whether it exists and is owned by `userId`,
// so callers can return 404 vs 403 appropriately without leaking existence
// of another user's record beyond a bare "not found"/"forbidden" split.
async function findOwned(id: string, userId: string) {
  const config = await prisma.bannerConfig.findUnique({ where: { id } });
  if (!config) return { status: 404 as const, config: null };
  if (config.userId !== userId) return { status: 403 as const, config: null };
  return { status: 200 as const, config };
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await params;
  const owned = await findOwned(id, session.user.id);
  if (owned.status === 404) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }
  if (owned.status === 403) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return Response.json({ error: "Request body must be a JSON object." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return Response.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const data: { name?: string; config?: object } = {};
  if (typeof body.name === "string" && body.name.trim()) {
    data.name = body.name.trim().slice(0, 200);
  }
  if (
    body.config !== undefined &&
    body.config !== null &&
    typeof body.config === "object" &&
    !Array.isArray(body.config)
  ) {
    data.config = body.config as object;
  }
  if (!data.name && !data.config) {
    return Response.json({ error: "Nothing to update." }, { status: 400 });
  }

  const updated = await prisma.bannerConfig.update({ where: { id }, data });
  return Response.json({ config: updated });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const { id } = await params;
  const owned = await findOwned(id, session.user.id);
  if (owned.status === 404) {
    return Response.json({ error: "Not found." }, { status: 404 });
  }
  if (owned.status === 403) {
    return Response.json({ error: "Forbidden." }, { status: 403 });
  }

  await prisma.bannerConfig.delete({ where: { id } });
  return new Response(null, { status: 204 });
}
