import { db } from "@white-shop/db";
import type { Prisma } from "@prisma/client";

import type { AdminUserListFilters } from "./admin-users.types";

const ADMIN_USER_LIST_MAX_TAKE = 500;

class AdminUsersService {
  /**
   * Get users
   */
  async getUsers(filters: AdminUserListFilters = {}) {
    const take = Math.min(
      typeof filters.take === "number" && Number.isFinite(filters.take)
        ? Math.max(1, Math.floor(filters.take))
        : 200,
      ADMIN_USER_LIST_MAX_TAKE,
    );
    const search = typeof filters.search === "string" ? filters.search.trim() : "";
    const role = filters.role ?? "all";

    const where: Prisma.UserWhereInput = {
      deletedAt: null,
      ...(search !== ""
        ? {
            OR: [
              { email: { contains: search, mode: "insensitive" } },
              { phone: { contains: search, mode: "insensitive" } },
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
      ...(role === "admin" ? { roles: { has: "admin" } } : {}),
      ...(role === "customer" ? { NOT: { roles: { has: "admin" } } } : {}),
    };

    const users = await db.user.findMany({
      where,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        roles: true,
        blocked: true,
        createdAt: true,
        _count: {
          select: {
            orders: true,
          },
        },
      },
    });

    return {
      data: users.map((user: { id: string; email: string | null; phone: string | null; firstName: string | null; lastName: string | null; roles: string[] | null; blocked: boolean; createdAt: Date; _count?: { orders?: number } }) => ({
        id: user.id,
        email: user.email,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles,
        blocked: user.blocked,
        createdAt: user.createdAt,
        ordersCount: user._count?.orders ?? 0,
      })),
    };
  }

  /**
   * Update user
   */
  async updateUser(userId: string, data: any) {
    return await db.user.update({
      where: { id: userId },
      data: {
        blocked: data.blocked,
        roles: data.roles,
      },
      select: {
        id: true,
        email: true,
        phone: true,
        firstName: true,
        lastName: true,
        roles: true,
        blocked: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string) {
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true },
    });

    if (!user) {
      throw {
        status: 404,
        type: "https://api.shop.am/problems/not-found",
        title: "User not found",
        detail: `User with id '${userId}' does not exist`,
      };
    }

    await db.user.update({
      where: { id: userId },
      data: {
        deletedAt: new Date(),
        blocked: true,
      },
      select: { id: true },
    });

    return { success: true };
  }
}

export const adminUsersService = new AdminUsersService();



