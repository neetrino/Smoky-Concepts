import { NextRequest, NextResponse } from 'next/server';
import { authenticateToken, requireAdmin } from '@/lib/middleware/auth';
import { adminListCoupons, adminCreateCoupon } from '@/lib/services/admin/admin-coupons.service';

export async function GET(req: NextRequest) {
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
    const coupons = await adminListCoupons();
    return NextResponse.json({ data: coupons });
  } catch (error: unknown) {
    const err = error as { status?: number; type?: string; title?: string; detail?: string };
    return NextResponse.json(
      {
        type: err.type || 'https://api.shop.am/problems/internal-error',
        title: err.title || 'Internal Server Error',
        status: err.status || 500,
        detail: err.detail || 'Failed to list coupons',
        instance: req.url,
      },
      { status: err.status || 500 },
    );
  }
}

export async function POST(req: NextRequest) {
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
    const body = (await req.json()) as {
      code: string;
      discountType: string;
      discountValue: number;
      quantity?: number | null;
      allowedUserIds?: unknown;
      active?: boolean;
      expiresAt?: string | null;
    };
    const created = await adminCreateCoupon(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error: unknown) {
    const err = error as { status?: number; type?: string; title?: string; detail?: string };
    return NextResponse.json(
      {
        type: err.type || 'https://api.shop.am/problems/internal-error',
        title: err.title || 'Internal Server Error',
        status: err.status || 500,
        detail: err.detail || 'Failed to create coupon',
        instance: req.url,
      },
      { status: err.status || 500 },
    );
  }
}
