import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, requireAdmin } from '@/lib/middleware/auth';
import {
  adminGetCouponById,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from '@/lib/services/admin/admin-coupons.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      return NextResponse.json(
        {
          type: 'https://api.shop.am/problems/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'Admin access required',
          instance: req.url,
        },
        { status: 403 },
      );
    }
    const { id } = await params;
    const coupon = await adminGetCouponById(id);
    return NextResponse.json(coupon);
  } catch (error: unknown) {
    const err = error as { status?: number; type?: string; title?: string; detail?: string };
    return NextResponse.json(
      {
        type: err.type || 'https://api.shop.am/problems/internal-error',
        title: err.title || 'Internal Server Error',
        status: err.status || 500,
        detail: err.detail || 'Failed to load coupon',
        instance: req.url,
      },
      { status: err.status || 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      return NextResponse.json(
        {
          type: 'https://api.shop.am/problems/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'Admin access required',
          instance: req.url,
        },
        { status: 403 },
      );
    }
    const { id } = await params;
    const body = (await req.json()) as Record<string, unknown>;
    const updated = await adminUpdateCoupon(id, {
      ...(typeof body.code === 'string' ? { code: body.code } : {}),
      ...(typeof body.discountType === 'string' ? { discountType: body.discountType } : {}),
      ...(typeof body.discountValue === 'number' ? { discountValue: body.discountValue } : {}),
      ...(typeof body.quantity === 'number'
        ? { quantity: body.quantity }
        : body.quantity === null
          ? { quantity: null }
          : {}),
      ...(Array.isArray(body.allowedUserIds)
        ? {
            allowedUserIds: body.allowedUserIds.filter(
              (uid): uid is string => typeof uid === 'string',
            ),
          }
        : {}),
      ...(typeof body.active === 'boolean' ? { active: body.active } : {}),
      ...(body.expiresAt === null
        ? { expiresAt: null }
        : typeof body.expiresAt === 'string'
          ? { expiresAt: body.expiresAt }
          : {}),
    });
    return NextResponse.json(updated);
  } catch (error: unknown) {
    const err = error as { status?: number; type?: string; title?: string; detail?: string };
    return NextResponse.json(
      {
        type: err.type || 'https://api.shop.am/problems/internal-error',
        title: err.title || 'Internal Server Error',
        status: err.status || 500,
        detail: err.detail || 'Failed to update coupon',
        instance: req.url,
      },
      { status: err.status || 500 },
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      return NextResponse.json(
        {
          type: 'https://api.shop.am/problems/forbidden',
          title: 'Forbidden',
          status: 403,
          detail: 'Admin access required',
          instance: req.url,
        },
        { status: 403 },
      );
    }
    const { id } = await params;
    try {
      await adminDeleteCoupon(id);
    } catch (error: unknown) {
      const prismaErr = error as { code?: string };
      if (prismaErr.code === 'P2025') {
        return NextResponse.json(
          {
            type: 'https://api.shop.am/problems/not-found',
            title: 'Not Found',
            status: 404,
            detail: 'Coupon not found',
            instance: req.url,
          },
          { status: 404 },
        );
      }
      throw error;
    }
    return NextResponse.json({ ok: true });
  } catch (error: unknown) {
    const err = error as { status?: number; type?: string; title?: string; detail?: string };
    return NextResponse.json(
      {
        type: err.type || 'https://api.shop.am/problems/internal-error',
        title: err.title || 'Internal Server Error',
        status: err.status || 500,
        detail: err.detail || 'Failed to delete coupon',
        instance: req.url,
      },
      { status: err.status || 500 },
    );
  }
}
