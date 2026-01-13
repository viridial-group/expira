-- AlterTable
ALTER TABLE "checks" ADD COLUMN     "apiResponse" JSONB,
ADD COLUMN     "contentInfo" JSONB,
ADD COLUMN     "dnsInfo" JSONB,
ADD COLUMN     "httpHeaders" JSONB,
ADD COLUMN     "networkInfo" JSONB,
ADD COLUMN     "performance" JSONB,
ADD COLUMN     "sslInfo" JSONB;
