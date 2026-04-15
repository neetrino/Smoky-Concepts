-- CreateTable
CREATE TABLE "size_catalog_categories" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "size_catalog_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "size_catalog_items" (
    "id" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "size_catalog_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "size_catalog_categories_position_idx" ON "size_catalog_categories"("position");

-- CreateIndex
CREATE INDEX "size_catalog_items_categoryId_idx" ON "size_catalog_items"("categoryId");

-- CreateIndex
CREATE INDEX "size_catalog_items_categoryId_position_idx" ON "size_catalog_items"("categoryId", "position");

-- AddForeignKey
ALTER TABLE "size_catalog_items" ADD CONSTRAINT "size_catalog_items_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "size_catalog_categories"("id") ON DELETE CASCADE ON UPDATE CASCADE;
