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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const adminError = await ensureAdmin(req);

  if (adminError) {
    return adminError;
  }

  try {
    const { itemId } = await params;
    const item = await adminService.getVotingItemById(itemId);

    if (!item) {
      return NextResponse.json(
        {
          type: "https://api.shop.am/problems/not-found",
          title: "Voting item not found",
          status: 404,
          detail: `Voting item with id '${itemId}' does not exist`,
          instance: req.url,
        },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: item });
  } catch (error: unknown) {
    return createErrorResponse(error, req.url);
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const adminError = await ensureAdmin(req);

  if (adminError) {
    return adminError;
  }

  try {
    const { itemId } = await params;
    const body = (await req.json()) as {
      title?: string;
      imageUrl?: string;
      imageUrls?: string[];
      productSlug?: string | null;
    };

    const result = await adminService.updateVotingItem(itemId, body);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return createErrorResponse(error, req.url);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ itemId: string }> },
) {
  const adminError = await ensureAdmin(req);

  if (adminError) {
    return adminError;
  }

  try {
    const { itemId } = await params;
    const result = await adminService.deleteVotingItem(itemId);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return createErrorResponse(error, req.url);
  }
}
