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
    { status: problem.status || 500 },
  );
}

async function ensureAdmin(req: NextRequest) {
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
      { status: 403 },
    );
  }

  return null;
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const adminError = await ensureAdmin(req);

  if (adminError) {
    return adminError;
  }

  try {
    const { categoryId } = await params;
    const body = (await req.json()) as {
      title?: string;
      published?: boolean;
    };

    const result = await adminService.updateVotingCategory(categoryId, body);
    if (!result) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/not-found",
          title: "Category not found",
          status: 404,
          detail: `Voting category with id '${categoryId}' does not exist`,
          instance: req.url,
        },
        { status: 404 },
      );
    }
    return NextResponse.json(result);
  } catch (error: unknown) {
    return createErrorResponse(error, req.url);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ categoryId: string }> },
) {
  const adminError = await ensureAdmin(req);

  if (adminError) {
    return adminError;
  }

  try {
    const { categoryId } = await params;
    const result = await adminService.deleteVotingCategory(categoryId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return createErrorResponse(error, req.url);
  }
}
