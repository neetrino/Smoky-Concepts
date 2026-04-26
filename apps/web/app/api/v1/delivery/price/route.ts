import { NextRequest, NextResponse } from "next/server";
import { adminService } from "@/lib/services/admin.service";

/**
 * GET /api/v1/delivery/price
 * Get delivery price for a specific city
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const city = searchParams.get('city');
    const country = searchParams.get('country') || 'Armenia';
    const subtotalUsdRaw = searchParams.get('subtotalUsd');
    let orderSubtotalUsd: number | undefined;
    if (subtotalUsdRaw !== null && subtotalUsdRaw !== '') {
      const parsed = Number(subtotalUsdRaw);
      if (Number.isFinite(parsed) && parsed >= 0) {
        orderSubtotalUsd = parsed;
      }
    }

    if (!city) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/validation-error",
          title: "Validation Error",
          status: 400,
          detail: "City parameter is required",
          instance: req.url,
        },
        { status: 400 }
      );
    }

    const price = await adminService.getDeliveryPrice(city, country, orderSubtotalUsd);

    return NextResponse.json({ price });
  } catch (error: any) {
    console.error("❌ [DELIVERY PRICE] GET Error:", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      code: error?.code,
      meta: error?.meta,
      type: error?.type,
      title: error?.title,
      status: error?.status,
      detail: error?.detail,
      fullError: error,
    });
    return NextResponse.json(
      {
        type: error.type || "https://api.shop.am/problems/internal-error",
        title: error.title || "Internal Server Error",
        status: error.status || 500,
        detail: error.detail || error.message || "An error occurred",
        instance: req.url,
      },
      { status: error.status || 500 }
    );
  }
}

