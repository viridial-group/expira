-- CreateTable
CREATE TABLE "email_campaigns" (
    "id" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "recipientEmails" JSONB,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sentCount" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "totalRecipients" INTEGER NOT NULL DEFAULT 0,
    "scheduledAt" TIMESTAMP(3),
    "sentAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "email_campaigns_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "email_campaigns" ADD CONSTRAINT "email_campaigns_createdBy_fkey" FOREIGN KEY ("createdBy") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
