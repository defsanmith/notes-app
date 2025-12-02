import { ADMIN_EMAIL, ADMIN_PASSWORD } from "@/constants/env";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/db";

async function main() {
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    console.log("Admin user already exists:", ADMIN_EMAIL);
    return;
  }

  // Hash the admin password
  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: "Admin",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created successfully:", {
    id: admin.id,
    email: admin.email,
    role: admin.role,
  });
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Don't disconnect as we're using the shared prisma instance
  });
