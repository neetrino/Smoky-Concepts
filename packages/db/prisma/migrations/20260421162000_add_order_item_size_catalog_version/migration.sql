-- Persist selected size-catalog version on order items
ALTER TABLE "order_items"
ADD COLUMN "sizeCatalogVersion" TEXT;
