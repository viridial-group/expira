-- CreateTable
CREATE TABLE "campaign_opens" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "openedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "campaign_opens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_clicks" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "clickedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ipAddress" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "campaign_clicks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaign_opens_campaignId_idx" ON "campaign_opens"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_opens_email_idx" ON "campaign_opens"("email");

-- CreateIndex
CREATE INDEX "campaign_opens_openedAt_idx" ON "campaign_opens"("openedAt");

-- CreateIndex
CREATE INDEX "campaign_clicks_campaignId_idx" ON "campaign_clicks"("campaignId");

-- CreateIndex
CREATE INDEX "campaign_clicks_email_idx" ON "campaign_clicks"("email");

-- CreateIndex
CREATE INDEX "campaign_clicks_clickedAt_idx" ON "campaign_clicks"("clickedAt");

-- AddForeignKey
ALTER TABLE "campaign_opens" ADD CONSTRAINT "campaign_opens_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "email_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_clicks" ADD CONSTRAINT "campaign_clicks_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "email_campaigns"("id") ON DELETE CASCADE ON UPDATE CASCADE;
