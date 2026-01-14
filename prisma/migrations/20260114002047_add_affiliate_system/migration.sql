-- AlterTable
ALTER TABLE "users" ADD COLUMN     "referredByAffiliateCode" TEXT;

-- CreateTable
CREATE TABLE "affiliate_codes" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "totalReferrals" INTEGER NOT NULL DEFAULT 0,
    "totalEarnings" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "affiliate_codes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_referrals" (
    "id" TEXT NOT NULL,
    "affiliateCodeId" TEXT NOT NULL,
    "affiliateUserId" TEXT NOT NULL,
    "referredUserId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "hasConverted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "convertedAt" TIMESTAMP(3),

    CONSTRAINT "affiliate_referrals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "affiliate_commissions" (
    "id" TEXT NOT NULL,
    "affiliateCodeId" TEXT NOT NULL,
    "affiliateUserId" TEXT NOT NULL,
    "referralId" TEXT NOT NULL,
    "paymentId" TEXT,
    "amount" INTEGER NOT NULL,
    "commissionType" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "commissionRate" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "affiliate_commissions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_codes_userId_key" ON "affiliate_codes"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_codes_code_key" ON "affiliate_codes"("code");

-- CreateIndex
CREATE INDEX "affiliate_codes_code_idx" ON "affiliate_codes"("code");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_referrals_referredUserId_key" ON "affiliate_referrals"("referredUserId");

-- CreateIndex
CREATE INDEX "affiliate_referrals_affiliateCodeId_idx" ON "affiliate_referrals"("affiliateCodeId");

-- CreateIndex
CREATE INDEX "affiliate_referrals_affiliateUserId_idx" ON "affiliate_referrals"("affiliateUserId");

-- CreateIndex
CREATE INDEX "affiliate_referrals_referredUserId_idx" ON "affiliate_referrals"("referredUserId");

-- CreateIndex
CREATE INDEX "affiliate_referrals_status_idx" ON "affiliate_referrals"("status");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_commissions_referralId_key" ON "affiliate_commissions"("referralId");

-- CreateIndex
CREATE UNIQUE INDEX "affiliate_commissions_paymentId_key" ON "affiliate_commissions"("paymentId");

-- CreateIndex
CREATE INDEX "affiliate_commissions_affiliateCodeId_idx" ON "affiliate_commissions"("affiliateCodeId");

-- CreateIndex
CREATE INDEX "affiliate_commissions_affiliateUserId_idx" ON "affiliate_commissions"("affiliateUserId");

-- CreateIndex
CREATE INDEX "affiliate_commissions_status_idx" ON "affiliate_commissions"("status");

-- CreateIndex
CREATE INDEX "affiliate_commissions_createdAt_idx" ON "affiliate_commissions"("createdAt");

-- AddForeignKey
ALTER TABLE "affiliate_codes" ADD CONSTRAINT "affiliate_codes_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_affiliateCodeId_fkey" FOREIGN KEY ("affiliateCodeId") REFERENCES "affiliate_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_affiliateUserId_fkey" FOREIGN KEY ("affiliateUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_referrals" ADD CONSTRAINT "affiliate_referrals_referredUserId_fkey" FOREIGN KEY ("referredUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_affiliateCodeId_fkey" FOREIGN KEY ("affiliateCodeId") REFERENCES "affiliate_codes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_affiliateUserId_fkey" FOREIGN KEY ("affiliateUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_referralId_fkey" FOREIGN KEY ("referralId") REFERENCES "affiliate_referrals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "affiliate_commissions" ADD CONSTRAINT "affiliate_commissions_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "payments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
