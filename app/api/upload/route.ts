import { writeFile, mkdir } from "node:fs/promises";
import { join, extname } from "node:path";
import { randomUUID } from "node:crypto";

export const runtime = "nodejs";

const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const ALLOWED = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "image/svg+xml",
]);
const EXT_BY_TYPE: Record<string, string> = {
  "image/png": ".png",
  "image/jpeg": ".jpg",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/svg+xml": ".svg",
};

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const form = await req.formData().catch(() => null);
  if (!form) return bad("Expected multipart/form-data.");

  const file = form.get("file");
  if (!(file instanceof File)) return bad("Missing 'file' field.");
  if (file.size === 0) return bad("Empty file.");
  if (file.size > MAX_BYTES) return bad("File exceeds 8 MB limit.", 413);
  if (!ALLOWED.has(file.type)) {
    return bad(`Unsupported type: ${file.type || "unknown"}.`, 415);
  }

  const ext = EXT_BY_TYPE[file.type] ?? extname(file.name) ?? "";
  const name = `${randomUUID()}${ext}`;
  const dir = join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(join(dir, name), bytes);

  return Response.json({ url: `/uploads/${name}` });
}
