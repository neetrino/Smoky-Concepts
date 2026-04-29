import type { Prisma } from '@prisma/client';
import { db } from '@white-shop/db';
import {
  COUPON_DISCOUNT_FIXED_USD,
  COUPON_DISCOUNT_PERCENT,
  COUPON_CODE_MAX_LENGTH,
  normalizeCouponCode,
} from '@/lib/services/coupon.service';

const COUPON_MAX_USAGE_MIN = 1;

const couponListSelect = {
  id: true,
  code: true,
  discountType: true,
  discountValue: true,
  quantity: true,
  active: true,
  expiresAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

function isValidDiscountType(value: unknown): value is typeof COUPON_DISCOUNT_PERCENT | typeof COUPON_DISCOUNT_FIXED_USD {
  return value === COUPON_DISCOUNT_PERCENT || value === COUPON_DISCOUNT_FIXED_USD;
}

async function assertAllowedUserIdsExist(
  userIds: string[],
  client: Pick<typeof db, 'user'>,
): Promise<void> {
  if (userIds.length === 0) {
    return;
  }

  const count = await client.user.count({
    where: {
      id: { in: userIds },
      deletedAt: null,
    },
  });

  if (count !== userIds.length) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: 'One or more selected users are invalid or deleted',
    };
  }
}

function normalizeAllowedUserIdsInput(raw: unknown): string[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const ids = raw
    .filter((id): id is string => typeof id === 'string' && id.trim().length > 0)
    .map((id) => id.trim());

  return [...new Set(ids)];
}

function parseCouponQuantity(raw: unknown): number | null | undefined {
  if (raw === undefined) {
    return undefined;
  }
  if (raw === null || raw === '') {
    return null;
  }

  const quantity = Number(raw);
  if (!Number.isInteger(quantity) || quantity < COUPON_MAX_USAGE_MIN) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: 'quantity must be an integer greater than 0',
    };
  }

  return quantity;
}

export async function adminListCoupons() {
  return db.coupon.findMany({
    orderBy: { createdAt: 'desc' },
    select: couponListSelect,
  });
}

export async function adminGetCouponById(id: string) {
  const row = await db.coupon.findUnique({
    where: { id },
    select: {
      ...couponListSelect,
      allowedUsers: { select: { userId: true } },
    },
  });
  if (!row) {
    throw {
      status: 404,
      type: 'https://api.shop.am/problems/not-found',
      title: 'Not Found',
      detail: 'Coupon not found',
    };
  }
  const { allowedUsers, ...rest } = row;
  return {
    ...rest,
    allowedUserIds: allowedUsers.map((row: { userId: string }) => row.userId),
  };
}

export async function adminCreateCoupon(body: {
  code: string;
  discountType: string;
  discountValue: number;
  quantity?: number | null;
  allowedUserIds?: unknown;
  active?: boolean;
  expiresAt?: string | null;
}) {
  const code = normalizeCouponCode(body.code);
  if (!code || code.length < 2) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: 'Coupon code must be at least 2 characters',
    };
  }
  if (!isValidDiscountType(body.discountType)) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: `discountType must be "${COUPON_DISCOUNT_PERCENT}" or "${COUPON_DISCOUNT_FIXED_USD}"`,
    };
  }
  const discountValue = Number(body.discountValue);
  if (!Number.isFinite(discountValue)) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: 'discountValue must be a number',
    };
  }
  if (body.discountType === COUPON_DISCOUNT_PERCENT && (discountValue < 0 || discountValue > 100)) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: 'Percent discount must be between 0 and 100',
    };
  }
  if (body.discountType === COUPON_DISCOUNT_FIXED_USD && discountValue < 0) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: 'Fixed discount must be >= 0',
    };
  }

  let expiresAt: Date | null = null;
  if (body.expiresAt != null && body.expiresAt !== '') {
    const d = new Date(body.expiresAt);
    if (Number.isNaN(d.getTime())) {
      throw {
        status: 400,
        type: 'https://api.shop.am/problems/validation-error',
        title: 'Validation Error',
        detail: 'expiresAt must be a valid ISO date string',
      };
    }
    expiresAt = d;
  }
  const quantity = parseCouponQuantity(body.quantity) ?? null;
  const allowedUserIds = normalizeAllowedUserIdsInput(body.allowedUserIds);
  await assertAllowedUserIdsExist(allowedUserIds, db);

  try {
    return await db.$transaction(async (tx: Prisma.TransactionClient) => {
      const created = await tx.coupon.create({
        data: {
          code,
          discountType: body.discountType,
          discountValue,
          quantity,
          active: body.active !== false,
          expiresAt,
        },
        select: { id: true },
      });

      if (allowedUserIds.length > 0) {
        await tx.couponAllowedUser.createMany({
          data: allowedUserIds.map((userId) => ({
            couponId: created.id,
            userId,
          })),
          skipDuplicates: true,
        });
      }

      const row = await tx.coupon.findUnique({
        where: { id: created.id },
        select: couponListSelect,
      });

      if (!row) {
        throw new Error('Coupon row missing after create');
      }

      return row;
    });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2002') {
      throw {
        status: 409,
        type: 'https://api.shop.am/problems/conflict',
        title: 'Conflict',
        detail: 'A coupon with this code already exists',
      };
    }
    throw e;
  }
}

export async function adminUpdateCoupon(
  id: string,
  body: Partial<{
    code: string;
    discountType: string;
    discountValue: number;
    quantity: number | null;
    allowedUserIds: string[];
    active: boolean;
    expiresAt: string | null;
  }>,
) {
  const existing = await db.coupon.findUnique({
    where: { id },
    select: couponListSelect,
  });
  if (!existing) {
    throw {
      status: 404,
      type: 'https://api.shop.am/problems/not-found',
      title: 'Not Found',
      detail: 'Coupon not found',
    };
  }

  const code =
    typeof body.code === 'string' ? normalizeCouponCode(body.code) : undefined;
  if (code !== undefined && (code.length < 2 || code.length > COUPON_CODE_MAX_LENGTH)) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: 'Coupon code must be 2–64 characters',
    };
  }

  if (body.discountType !== undefined && !isValidDiscountType(body.discountType)) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: `discountType must be "${COUPON_DISCOUNT_PERCENT}" or "${COUPON_DISCOUNT_FIXED_USD}"`,
    };
  }

  const discountType = body.discountType ?? existing.discountType;
  let discountValue = existing.discountValue;
  if (body.discountValue !== undefined) {
    discountValue = Number(body.discountValue);
    if (!Number.isFinite(discountValue)) {
      throw {
        status: 400,
        type: 'https://api.shop.am/problems/validation-error',
        title: 'Validation Error',
        detail: 'discountValue must be a number',
      };
    }
  }
  if (discountType === COUPON_DISCOUNT_PERCENT && (discountValue < 0 || discountValue > 100)) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: 'Percent discount must be between 0 and 100',
    };
  }
  if (discountType === COUPON_DISCOUNT_FIXED_USD && discountValue < 0) {
    throw {
      status: 400,
      type: 'https://api.shop.am/problems/validation-error',
      title: 'Validation Error',
      detail: 'Fixed discount must be >= 0',
    };
  }

  let expiresAt: Date | null | undefined = undefined;
  if (body.expiresAt === null) {
    expiresAt = null;
  } else if (typeof body.expiresAt === 'string' && body.expiresAt !== '') {
    const d = new Date(body.expiresAt);
    if (Number.isNaN(d.getTime())) {
      throw {
        status: 400,
        type: 'https://api.shop.am/problems/validation-error',
        title: 'Validation Error',
        detail: 'expiresAt must be a valid ISO date string',
      };
    }
    expiresAt = d;
  }
  const quantity = parseCouponQuantity(body.quantity);

  const bodyRecord = body as Record<string, unknown>;
  const shouldReplaceAllowedUsers = 'allowedUserIds' in bodyRecord;
  const nextAllowedUserIds = shouldReplaceAllowedUsers
    ? normalizeAllowedUserIdsInput(bodyRecord.allowedUserIds)
    : null;

  if (shouldReplaceAllowedUsers && nextAllowedUserIds !== null) {
    await assertAllowedUserIdsExist(nextAllowedUserIds, db);
  }

  try {
    return await db.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.coupon.update({
        where: { id },
        data: {
          ...(code !== undefined ? { code } : {}),
          ...(body.discountType !== undefined ? { discountType: body.discountType } : {}),
          discountValue,
          ...(quantity !== undefined ? { quantity } : {}),
          ...(body.active !== undefined ? { active: body.active } : {}),
          ...(expiresAt !== undefined ? { expiresAt } : {}),
        },
      });

      if (shouldReplaceAllowedUsers && nextAllowedUserIds !== null) {
        await tx.couponAllowedUser.deleteMany({ where: { couponId: id } });
        if (nextAllowedUserIds.length > 0) {
          await tx.couponAllowedUser.createMany({
            data: nextAllowedUserIds.map((userId) => ({
              couponId: id,
              userId,
            })),
            skipDuplicates: true,
          });
        }
      }

      const row = await tx.coupon.findUnique({
        where: { id },
        select: couponListSelect,
      });

      if (!row) {
        throw {
          status: 404,
          type: 'https://api.shop.am/problems/not-found',
          title: 'Not Found',
          detail: 'Coupon not found',
        };
      }

      return row;
    });
  } catch (e: unknown) {
    const err = e as { code?: string };
    if (err.code === 'P2002') {
      throw {
        status: 409,
        type: 'https://api.shop.am/problems/conflict',
        title: 'Conflict',
        detail: 'A coupon with this code already exists',
      };
    }
    throw e;
  }
}

export async function adminDeleteCoupon(id: string) {
  await db.coupon.delete({
    where: { id },
  });
}
