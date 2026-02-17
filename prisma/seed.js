require("dotenv").config();
const bcrypt = require("bcrypt");

const prisma = require("../src/prisma");

async function main() {
  console.log("🌱 Seed started");
  console.log("DATABASE_URL =", process.env.DATABASE_URL);

  const email = "teacher@academy.com";
  const password = "teacher123";
  const passwordHash = await bcrypt.hash(password, 10);

  const teacher = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Main Teacher",
      role: "TEACHER",
      passwordHash,
      active: true,
    },
    select: { id: true, email: true, role: true },
  });

  console.log("✅ Seeded teacher:", teacher, "| password:", password);
  console.log("🌱 Seed finished");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
