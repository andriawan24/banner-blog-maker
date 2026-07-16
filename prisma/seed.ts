import "dotenv/config";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";

const SEED_USERS = [
  { email: "demo@example.com", name: "Demo User" },
];

async function main() {
  const password = process.env.SEEDER_USER_PASSWORD;
  if (!password) {
    throw new Error("SEEDER_USER_PASSWORD is not set (see .env.example).");
  }

  const passwordHash = await bcrypt.hash(password, 12);

  for (const { email, name } of SEED_USERS) {
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash },
      create: { email, name, passwordHash },
    });
    console.log(`Seeded user: ${user.email}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
