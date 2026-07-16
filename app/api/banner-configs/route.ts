import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

function unauthorized() {
  return Response.json({ error: "Unauthorized" }, { status: 401 });
}

// List only the authenticated user's own configs.
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

  const configs = await prisma.bannerConfig.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });
  return Response.json({ configs });
}

// Create a new config owned by the authenticated user.
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return unauthorized();

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

  const name = typeof body.name === "string" ? body.name.trim().slice(0, 200) : "";
  const config = body.config;
  if (!name) {
    return Response.json({ error: "name is required." }, { status: 400 });
  }
  if (config === undefined || config === null || typeof config !== "object" || Array.isArray(config)) {
    return Response.json({ error: "config must be an object." }, { status: 400 });
  }

  const created = await prisma.bannerConfig.create({
    data: {
      userId: session.user.id,
      name,
      config: config as object,
    },
  });

  return Response.json({ config: created }, { status: 201 });
}
