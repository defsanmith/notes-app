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
      role: true,
    },
  });
}

/**
 * Find all users with pagination (for admin)
 */
export async function findAllUsersWithPagination(params: {
  search?: string;
  page: number;
  limit: number;
}) {
  const skip = (params.page - 1) * params.limit;

  const where = params.search
    ? {
        role: { not: "ADMIN" },
        OR: [
          { name: { contains: params.search, mode: "insensitive" as const } },
          { email: { contains: params.search, mode: "insensitive" as const } },
        ],
      }
    : { role: { not: "ADMIN" } };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: params.limit,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { users, total };
}
