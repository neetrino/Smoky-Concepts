import { NextRequest, NextResponse } from "next/server";

import { authenticateToken, requireAdmin } from "@/lib/middleware/auth";
import { adminService } from "@/lib/services/admin.service";

function createErrorResponse(error: unknown, url: string) {
  const problem = error as Partial<{
    type: string;
    title: string;
    status: number;
    detail: string;
    message: string;
  }>;

  return NextResponse.json(
    {
      type: problem.type || "https://api.shop.am/problems/internal-error",
      title: problem.title || "Internal Server Error",
      status: problem.status || 500,
      detail: problem.detail || problem.message || "An error occurred",
      instance: url,
    },
    { status: problem.status || 500 }
  );
}

interface RouteContext {
  params: Promise<{ categoryId: string }>;
}

/**
 * POST /api/v1/admin/size-catalog/categories/[categoryId]/items
 */
export async function POST(req: NextRequest, context: RouteContext) {
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

    const { categoryId } = await context.params;
    const body = (await req.json()) as { title?: string; imageUrl?: string; version?: string | null; published?: boolean };
    const result = await adminService.createSizeCatalogItem(categoryId, {
      title: body.title ?? "",
      imageUrl: body.imageUrl ?? "",
      version: body.version,
      published: body.published,
    });
    return NextResponse.json(result, { status: 201 });
  } catch (error: unknown) {
    return createErrorResponse(error, req.url);
  }
}
