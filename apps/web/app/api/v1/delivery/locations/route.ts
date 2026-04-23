import { NextResponse } from "next/server";
import { adminDeliveryService } from "@/lib/services/admin/admin-delivery.service";

/**
 * GET /api/v1/delivery/locations
 * Public list of delivery zones (from admin delivery settings) for checkout.
 */
export async function GET() {
  try {
    const { locations } = await adminDeliveryService.getDeliverySettings();
    const publicLocations = (locations || []).map((loc, index) => ({
      id:
        typeof loc.id === "string" && loc.id.length > 0
          ? loc.id
          : `loc-${index}-${loc.city}-${loc.country}`,
      city: loc.city,
      country: loc.country,
    }));

    return NextResponse.json({ locations: publicLocations });
  } catch (error: unknown) {
    const err = error as { status?: number; detail?: string; message?: string };
    return NextResponse.json(
      {
        type: "https://api.shop.am/problems/internal-error",
        title: "Internal Server Error",
        status: err.status || 500,
        detail: err.detail || err.message || "An error occurred",
      },
      { status: err.status || 500 },
    );
  }
}
