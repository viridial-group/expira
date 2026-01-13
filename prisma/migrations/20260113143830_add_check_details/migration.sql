-- AlterTable
ALTER TABLE "checks" ADD COLUMN     "errorCode" TEXT,
ADD COLUMN     "errorDetails" JSONB,
ADD COLUMN     "responseTime" INTEGER,
ADD COLUMN     "statusCode" INTEGER;
