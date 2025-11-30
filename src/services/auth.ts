import { prisma } from "@/lib/db";

/**
 * Find a user by email
 */
export async function findUserByEmail(email: string) {
  return prisma.user.findUnique({
    where: { email },
  });
}

/**
 * Create a new user
 */
export async function createUser(data: {
  name: string;
  email: string;
  password: string;
}) {
  return prisma.user.create({
    data,
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });
}

/**
 * Find a user by email with password (for authentication)
 */
export async function findUserForAuth(email: string) {
  return prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      password: true,
      image: true,
    },
  });
}

