-- Link culture voting choices to catalog products (storefront slug).
ALTER TABLE "voting_items" ADD COLUMN "productSlug" TEXT;

-- Mark line items purchased via home Culture early-access checkout.
ALTER TABLE "order_items" ADD COLUMN "earlyAccess" BOOLEAN NOT NULL DEFAULT false;

CREATE INDEX "order_items_earlyAccess_idx" ON "order_items"("earlyAccess");
