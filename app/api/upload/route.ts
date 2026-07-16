import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { extname } from "node:path";
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

type UploadConfig = {
  bucket: string;
  publicBaseUrl: string;
  prefix: string;
  client: S3Client;
};

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

function env(name: string) {
  const value = process.env[name]?.trim();
  return value ? value : undefined;
}

function boolEnv(name: string, fallback: boolean) {
  const value = env(name)?.toLowerCase();
  if (value === "true" || value === "1" || value === "yes") return true;
  if (value === "false" || value === "0" || value === "no") return false;
  return fallback;
}

function trimSlashes(value: string) {
  return value.replace(/^\/+|\/+$/g, "");
}

function getUploadConfig(): UploadConfig {
  const bucket = env("S3_BUCKET");
  const accessKeyId = env("S3_ACCESS_KEY_ID") ?? env("AWS_ACCESS_KEY_ID");
  const secretAccessKey = env("S3_SECRET_ACCESS_KEY") ?? env("AWS_SECRET_ACCESS_KEY");

  if (!bucket || !accessKeyId || !secretAccessKey) {
    throw new Error("S3 upload storage is not configured.");
  }

  const region = env("S3_REGION") ?? env("AWS_REGION") ?? "us-east-1";
  const endpoint = env("S3_ENDPOINT");
  const forcePathStyle = boolEnv("S3_FORCE_PATH_STYLE", Boolean(endpoint));
  const prefix = trimSlashes(env("S3_UPLOAD_PREFIX") ?? "uploads");
  const publicBaseUrl =
    env("S3_PUBLIC_BASE_URL") ??
    (endpoint
      ? `${endpoint.replace(/\/+$/g, "")}/${bucket}`
      : `https://${bucket}.s3.${region}.amazonaws.com`);

  return {
    bucket,
    prefix,
    publicBaseUrl: publicBaseUrl.replace(/\/+$/g, ""),
    client: new S3Client({
      region,
      endpoint,
      forcePathStyle,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    }),
  };
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
  try {
    const config = getUploadConfig();
    const key = [config.prefix, `${randomUUID()}${ext}`].filter(Boolean).join("/");
    const bytes = Buffer.from(await file.arrayBuffer());

    await config.client.send(
      new PutObjectCommand({
        Bucket: config.bucket,
        Key: key,
        Body: bytes,
        ContentLength: file.size,
        ContentType: file.type,
        CacheControl: "public, max-age=31536000, immutable",
      }),
    );

    return Response.json({ url: `${config.publicBaseUrl}/${key}` });
  } catch (error) {
    const isConfigError =
      error instanceof Error && error.message === "S3 upload storage is not configured.";
    if (!isConfigError) console.error("Image upload failed", error);
    const message = isConfigError ? error.message : "Could not upload image to storage.";
    return bad(message, 500);
  }
}
