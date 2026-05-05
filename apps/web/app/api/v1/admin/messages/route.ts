import { NextRequest, NextResponse } from "next/server";
import { db } from "@white-shop/db";
import { authenticateToken, requireAdmin } from "@/lib/middleware/auth";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;

function parsePositiveInt(rawValue: string | null, fallback: number): number {
  const parsedValue = Number.parseInt(rawValue ?? "", 10);
  if (!Number.isFinite(parsedValue) || parsedValue <= 0) {
    return fallback;
  }
  return parsedValue;
}

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

    const searchParams = req.nextUrl.searchParams;
    const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
    const requestedLimit = parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT);
    const limit = Math.min(requestedLimit, MAX_LIMIT);
    const skip = (page - 1) * limit;
    const search = (searchParams.get("search") ?? "").trim();

    const whereClause =
      search.length > 0
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" as const } },
              { email: { contains: search, mode: "insensitive" as const } },
              { subject: { contains: search, mode: "insensitive" as const } },
              { message: { contains: search, mode: "insensitive" as const } },
            ],
          }
        : {};

    const [messages, total] = await Promise.all([
      db.contactMessage.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
      }),
      db.contactMessage.count({ where: whereClause }),
    ]);

    const totalPages = total === 0 ? 1 : Math.ceil(total / limit);

    return NextResponse.json({
      data: messages,
      meta: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "An unexpected error occurred";
    return NextResponse.json(
      {
        type: "https://api.shop.am/problems/internal-error",
        title: "Internal Server Error",
        status: 500,
        detail: message,
        instance: req.url,
      },
      { status: 500 }
    );
  }
}
