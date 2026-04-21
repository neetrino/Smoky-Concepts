import { db } from "@white-shop/db";

import { isR2Configured, uploadVotingImageToR2 } from "@/lib/services/r2.service";
import { parseDataImageUrl } from "@/lib/services/utils/data-url-image";

interface VotingProblem {
  status: number;
  type: string;
  title: string;
  detail: string;
}

interface VotingItemRecord {
  id: string;
  votingId: string;
  title: string;
  imageUrl: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    likes: number;
  };
}

interface VotingItemInput {
  title?: string;
  imageUrl?: string;
}

interface VotingCampaignInput {
  title?: string;
  published?: boolean;
}

function buildProblem(status: number, title: string, detail: string): VotingProblem {
  return {
    status,
    type: `https://api.shop.am/problems/${status === 404 ? "not-found" : "bad-request"}`,
    title,
    detail,
  };
}

function requireTrimmedValue(value: string | undefined, fieldName: string): string {
  const trimmedValue = value?.trim();

  if (!trimmedValue) {
    throw buildProblem(400, `${fieldName} is required`, `Please provide a valid ${fieldName.toLowerCase()}.`);
  }

  return trimmedValue;
}

/**
 * Inline data URLs are uploaded to R2 (voting/…); HTTPS URLs are stored as-is.
 */
async function resolveVotingImageUrl(imageUrl: string): Promise<string> {
  if (!imageUrl.startsWith("data:image/")) {
    return imageUrl;
  }

  if (!isR2Configured()) {
    throw buildProblem(
      503,
      "Image storage unavailable",
      "R2 is not configured; cannot save inline images. Upload a file or configure R2.",
    );
  }

  const parsed = parseDataImageUrl(imageUrl);
  if (!parsed) {
    throw buildProblem(
      400,
      "Invalid image",
      "Image must be a valid data URL or a public image URL.",
    );
  }

  return uploadVotingImageToR2(parsed.buffer, parsed.contentType);
}

function getTopLikedId(items: VotingItemRecord[]): string | null {
  let topLikedId: string | null = null;
  let maxLikes = 0;

  for (const item of items) {
    if (item._count.likes > maxLikes) {
      maxLikes = item._count.likes;
      topLikedId = item.id;
    }
  }

  return maxLikes > 0 ? topLikedId : null;
}

function mapVotingItem(item: VotingItemRecord, topLikedId: string | null) {
  return {
    id: item.id,
    votingId: item.votingId,
    title: item.title,
    imageUrl: item.imageUrl,
    likeCount: item._count.likes,
    topLiked: item.id === topLikedId,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
}

class AdminVotingService {
  async listVotings() {
    const rows = await db.voting.findMany({
      where: { deletedAt: null },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
        updatedAt: true,
        items: {
          where: { deletedAt: null },
          select: {
            _count: {
              select: { likes: true },
            },
          },
        },
      },
    });

    const data = rows.map((row: (typeof rows)[number]) => {
      const itemCount = row.items.length;
      const totalLikes = row.items.reduce(
        (sum: number, it: { _count: { likes: number } }) => sum + it._count.likes,
        0,
      );

      return {
        id: row.id,
        title: row.title,
        published: row.published,
        itemCount,
        totalLikes,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    });

    return { data };
  }

  async getVotingWithItems(votingId: string) {
    const voting = await db.voting.findFirst({
      where: { id: votingId, deletedAt: null },
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!voting) {
      return null;
    }

    const rawItems = await db.votingItem.findMany({
      where: {
        votingId,
        deletedAt: null,
      },
      select: {
        id: true,
        votingId: true,
        title: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const items: VotingItemRecord[] = rawItems as VotingItemRecord[];
    const topLikedId = getTopLikedId(items);
    const totalLikes = items.reduce((sum, item) => sum + item._count.likes, 0);

    return {
      data: {
        voting: {
          id: voting.id,
          title: voting.title,
          published: voting.published,
          createdAt: voting.createdAt.toISOString(),
          updatedAt: voting.updatedAt.toISOString(),
        },
        items: items.map((item) => mapVotingItem(item, topLikedId)),
      },
      meta: {
        totalItems: items.length,
        totalLikes,
        topLikedId,
      },
    };
  }

  async createVoting(data: VotingCampaignInput) {
    const title = requireTrimmedValue(data.title, "Title");

    const voting = await db.voting.create({
      data: {
        title,
        published: false,
      },
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      data: {
        id: voting.id,
        title: voting.title,
        published: voting.published,
        createdAt: voting.createdAt.toISOString(),
        updatedAt: voting.updatedAt.toISOString(),
      },
    };
  }

  async updateVoting(votingId: string, data: VotingCampaignInput) {
    const existing = await db.voting.findFirst({
      where: { id: votingId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw buildProblem(404, "Voting not found", `Voting with id '${votingId}' does not exist.`);
    }

    if (data.published === true) {
      await db.voting.updateMany({
        where: {
          deletedAt: null,
          id: { not: votingId },
        },
        data: { published: false },
      });
    }

    const patch: { title?: string; published?: boolean } = {};

    if (typeof data.title === "string") {
      patch.title = requireTrimmedValue(data.title, "Title");
    }

    if (typeof data.published === "boolean") {
      patch.published = data.published;
    }

    if (Object.keys(patch).length === 0) {
      const current = await db.voting.findFirst({
        where: { id: votingId },
        select: {
          id: true,
          title: true,
          published: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      if (!current) {
        throw buildProblem(404, "Voting not found", `Voting with id '${votingId}' does not exist.`);
      }
      return {
        data: {
          id: current.id,
          title: current.title,
          published: current.published,
          createdAt: current.createdAt.toISOString(),
          updatedAt: current.updatedAt.toISOString(),
        },
      };
    }

    const voting = await db.voting.update({
      where: { id: votingId },
      data: patch,
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      data: {
        id: voting.id,
        title: voting.title,
        published: voting.published,
        createdAt: voting.createdAt.toISOString(),
        updatedAt: voting.updatedAt.toISOString(),
      },
    };
  }

  async deleteVoting(votingId: string) {
    const existing = await db.voting.findFirst({
      where: { id: votingId, deletedAt: null },
      select: { id: true },
    });

    if (!existing) {
      throw buildProblem(404, "Voting not found", `Voting with id '${votingId}' does not exist.`);
    }

    const now = new Date();

    await db.$transaction([
      db.votingItem.updateMany({
        where: { votingId, deletedAt: null },
        data: { deletedAt: now },
      }),
      db.voting.update({
        where: { id: votingId },
        data: { deletedAt: now, published: false },
      }),
    ]);

    return { success: true };
  }

  async createVotingItem(votingId: string, data: VotingItemInput) {
    const voting = await db.voting.findFirst({
      where: { id: votingId, deletedAt: null },
      select: { id: true },
    });

    if (!voting) {
      throw buildProblem(404, "Voting not found", `Voting with id '${votingId}' does not exist.`);
    }

    const title = requireTrimmedValue(data.title, "Title");
    const rawImageUrl = requireTrimmedValue(data.imageUrl, "Image");
    const imageUrl = await resolveVotingImageUrl(rawImageUrl);

    const item = await db.votingItem.create({
      data: {
        votingId,
        title,
        imageUrl,
      },
      select: {
        id: true,
        votingId: true,
        title: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return {
      data: mapVotingItem(item, null),
    };
  }

  async getVotingItemById(itemId: string) {
    const item = await db.votingItem.findFirst({
      where: {
        id: itemId,
        deletedAt: null,
      },
      select: {
        id: true,
        votingId: true,
        title: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    if (!item) {
      return null;
    }

    return mapVotingItem(item, null);
  }

  async updateVotingItem(itemId: string, data: VotingItemInput) {
    const existingItem = await db.votingItem.findFirst({
      where: {
        id: itemId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!existingItem) {
      throw buildProblem(404, "Voting item not found", `Voting item with id '${itemId}' does not exist.`);
    }

    const title = requireTrimmedValue(data.title, "Title");
    const rawImageUrl = requireTrimmedValue(data.imageUrl, "Image");
    const imageUrl = await resolveVotingImageUrl(rawImageUrl);

    const item = await db.votingItem.update({
      where: {
        id: itemId,
      },
      data: {
        title,
        imageUrl,
      },
      select: {
        id: true,
        votingId: true,
        title: true,
        imageUrl: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            likes: true,
          },
        },
      },
    });

    return {
      data: mapVotingItem(item, null),
    };
  }

  async deleteVotingItem(itemId: string) {
    const existingItem = await db.votingItem.findFirst({
      where: {
        id: itemId,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!existingItem) {
      throw buildProblem(404, "Voting item not found", `Voting item with id '${itemId}' does not exist.`);
    }

    await db.votingItem.update({
      where: {
        id: itemId,
      },
      data: {
        deletedAt: new Date(),
      },
    });

    return {
      success: true,
    };
  }
}

export const adminVotingService = new AdminVotingService();
