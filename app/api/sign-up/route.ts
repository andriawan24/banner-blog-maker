import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 8;

function bad(message: string, status = 400) {
  return Response.json({ error: message }, { status });
}

export async function POST(req: Request) {
  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      return bad("Request body must be a JSON object.");
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return bad("Invalid JSON body.");
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";

  if (!EMAIL_RE.test(email)) {
    return bad("Enter a valid email address.");
  }
  if (password.length < MIN_PASSWORD_LENGTH) {
    return bad(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Deliberately vague: confirms uniqueness without leaking other account
    // details, but sign-up (unlike sign-in) explicitly needs to tell the
    // visitor the email is taken so they can try signing in instead.
    return bad("An account with that email already exists.", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: { email, passwordHash },
      select: { id: true, email: true },
    });
    return Response.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (error) {
    console.error("Sign-up failed", error);
    return bad("Could not create account.", 500);
  }
}
