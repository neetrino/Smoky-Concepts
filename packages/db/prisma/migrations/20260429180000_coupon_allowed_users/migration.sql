-- CreateTable
CREATE TABLE "coupon_allowed_users" (
    "id" TEXT NOT NULL,
    "couponId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "coupon_allowed_users_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coupon_allowed_users_couponId_userId_key" ON "coupon_allowed_users"("couponId", "userId");

-- CreateIndex
CREATE INDEX "coupon_allowed_users_userId_idx" ON "coupon_allowed_users"("userId");

-- AddForeignKey
ALTER TABLE "coupon_allowed_users" ADD CONSTRAINT "coupon_allowed_users_couponId_fkey" FOREIGN KEY ("couponId") REFERENCES "coupons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coupon_allowed_users" ADD CONSTRAINT "coupon_allowed_users_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
