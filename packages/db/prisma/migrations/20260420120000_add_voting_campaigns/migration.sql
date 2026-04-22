-- CreateTable
CREATE TABLE "votings" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "votings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "votings_deletedAt_idx" ON "votings"("deletedAt");

-- CreateIndex
CREATE INDEX "votings_published_idx" ON "votings"("published");

-- Backfill: one voting for existing items
INSERT INTO "votings" ("id", "title", "published", "deletedAt", "createdAt", "updatedAt")
VALUES (
    'clvotingmigration001',
    'Default',
    true,
    NULL,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
);

-- Add votingId (nullable first)
ALTER TABLE "voting_items" ADD COLUMN "votingId" TEXT;

UPDATE "voting_items" SET "votingId" = 'clvotingmigration001' WHERE "votingId" IS NULL;

ALTER TABLE "voting_items" ALTER COLUMN "votingId" SET NOT NULL;

CREATE INDEX "voting_items_votingId_idx" ON "voting_items"("votingId");

ALTER TABLE "voting_items" ADD CONSTRAINT "voting_items_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "votings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
