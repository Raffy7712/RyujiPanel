import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  const existing = await db.user.findUnique({ where: { username: "admin" } });
  if (existing) {
    console.log("Admin user already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash("admin123", 10);
  const user = await db.user.create({
    data: {
      username: "admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log(`Admin user created: ${user.username} (${user.id})`);
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
