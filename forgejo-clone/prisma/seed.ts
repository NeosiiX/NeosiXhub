import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Admin user
  const adminHash = await bcrypt.hash("admin1234", 12);
  const admin = await prisma.user.upsert({
    where: { username: "admin" },
    update: {},
    create: {
      username: "admin",
      email: "admin@devhub.local",
      passwordHash: adminHash,
      displayName: "Administrateur",
      bio: "Compte administrateur de DevHub",
      role: "ADMIN",
    },
  });

  // Demo user
  const demoHash = await bcrypt.hash("demo1234", 12);
  const demo = await prisma.user.upsert({
    where: { username: "demo" },
    update: {},
    create: {
      username: "demo",
      email: "demo@devhub.local",
      passwordHash: demoHash,
      displayName: "Utilisateur Demo",
      bio: "Compte de démonstration",
    },
  });

  // Demo org
  const org = await prisma.organization.upsert({
    where: { name: "devhub-org" },
    update: {},
    create: {
      name: "devhub-org",
      displayName: "DevHub Organisation",
      description: "Organisation de démonstration",
      isPublic: true,
      members: {
        create: [
          { userId: admin.id, role: "OWNER" },
          { userId: demo.id, role: "MEMBER" },
        ],
      },
    },
  });

  console.log("✅ Seed terminé !");
  console.log("   Admin : admin / admin1234");
  console.log("   Demo  : demo / demo1234");
}

main().catch(console.error).finally(() => prisma.$disconnect());
