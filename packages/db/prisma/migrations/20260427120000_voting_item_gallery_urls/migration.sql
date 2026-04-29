-- AlterTable
ALTER TABLE "voting_items" ADD COLUMN "galleryUrls" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];

UPDATE "voting_items" SET "galleryUrls" = ARRAY["imageUrl"];
