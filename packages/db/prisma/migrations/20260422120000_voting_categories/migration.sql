-- CreateTable
CREATE TABLE "voting_categories" (
    "id" TEXT NOT NULL,
    "votingId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "position" INTEGER NOT NULL DEFAULT 0,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voting_categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "voting_categories_votingId_idx" ON "voting_categories"("votingId");

-- CreateIndex
CREATE INDEX "voting_categories_deletedAt_idx" ON "voting_categories"("deletedAt");

-- CreateIndex
CREATE INDEX "voting_categories_position_idx" ON "voting_categories"("position");

-- CreateIndex
CREATE INDEX "voting_categories_published_idx" ON "voting_categories"("published");

-- AddForeignKey
ALTER TABLE "voting_categories" ADD CONSTRAINT "voting_categories_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "votings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- One default category per non-deleted voting
INSERT INTO "voting_categories" ("id", "votingId", "title", "published", "position", "deletedAt", "createdAt", "updatedAt")
SELECT
    'vcat_' || v."id",
    v."id",
    'Default',
    v."published",
    0,
    NULL,
    v."createdAt",
    v."updatedAt"
FROM "votings" v
WHERE v."deletedAt" IS NULL;

-- Link items to the synthetic category
ALTER TABLE "voting_items" ADD COLUMN "categoryId" TEXT;

UPDATE "voting_items" vi
SET "categoryId" = 'vcat_' || vi."votingId"
WHERE vi."categoryId" IS NULL;

-- Drop old voting relation on items
ALTER TABLE "voting_items" DROP CONSTRAINT IF EXISTS "voting_items_votingId_fkey";
DROP INDEX IF EXISTS "voting_items_votingId_idx";
ALTER TABLE "voting_items" DROP COLUMN "votingId";

ALTER TABLE "voting_items" ALTER COLUMN "categoryId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "voting_items_categoryId_idx" ON "voting_items"("categoryId");

-- AddForeignKey
ALTER TABLE "voting_items" ADD CONSTRAINT "voting_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "voting_categories"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
