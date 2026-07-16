import type { DefaultSession } from "next-auth";

// Extend the session's user with the internal database id so server code
// (API routes, server components) can scope queries by `session.user.id`.
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
    } & DefaultSession["user"];
  }
}
