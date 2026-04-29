import { NextRequest, NextResponse } from "next/server";
import { authenticateToken, requireAdmin } from "@/lib/middleware/auth";
import { adminService } from "@/lib/services/admin.service";

export async function GET(req: NextRequest) {
  try {
    const user = await authenticateToken(req);
    if (!user || !requireAdmin(user)) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/forbidden",
          title: "Forbidden",
          status: 403,
          detail: "Admin access required",
          instance: req.url,
        },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") ?? undefined;
    const roleRaw = searchParams.get("role");
    const role =
      roleRaw === "admin" || roleRaw === "customer" || roleRaw === "all" ? roleRaw : undefined;
    const takeRaw = searchParams.get("take");
    const takeParsed = takeRaw != null ? Number.parseInt(takeRaw, 10) : Number.NaN;
    const take = Number.isFinite(takeParsed) ? takeParsed : undefined;

    const result = await adminService.getUsers({
      ...(search != null && search !== "" ? { search } : {}),
      ...(role != null ? { role } : {}),
      ...(take != null ? { take } : {}),
    });
    return NextResponse.json(result);
  } catch (error: unknown) {
    console.error("❌ [ADMIN] Error:", error);
    const err = error as { status?: number; type?: string; title?: string; detail?: string; message?: string };
    return NextResponse.json(
      {
        type: err.type || "https://api.shop.am/problems/internal-error",
        title: err.title || "Internal Server Error",
        status: err.status || 500,
        detail: err.detail || err.message || "An error occurred",
        instance: req.url,
      },
      { status: err.status || 500 }
    );
  }
}

