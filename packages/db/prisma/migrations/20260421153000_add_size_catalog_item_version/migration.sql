-- Add version to size catalog items for admin selection
ALTER TABLE "size_catalog_items"
ADD COLUMN "version" TEXT NOT NULL DEFAULT 'v1';
