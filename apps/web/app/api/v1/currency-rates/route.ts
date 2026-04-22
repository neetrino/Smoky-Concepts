import { NextResponse } from "next/server";
import { adminService } from "@/lib/services/admin.service";

/**
 * Get currency exchange rates (public endpoint)
 */
export async function GET() {
  try {
    const settings = await adminService.getSettings();
    const rates = settings.currencyRates || {
      AMD: 1,
      USD: 1 / 400,
      RUB: 0.2,
    };
    
    return NextResponse.json(rates);
  } catch (error: any) {
    console.error("❌ [CURRENCY RATES] Error:", error);
    // Return default rates on error
    return NextResponse.json({
      AMD: 1,
      USD: 1 / 400,
      RUB: 0.2,
    });
  }
}

