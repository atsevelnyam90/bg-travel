-- DropForeignKey
ALTER TABLE "audit_logs" DROP CONSTRAINT "audit_logs_orgId_fkey";

-- DropForeignKey
ALTER TABLE "invitations" DROP CONSTRAINT "invitations_orgId_fkey";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_orgId_fkey";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_roleId_fkey";

-- DropForeignKey
ALTER TABLE "memberships" DROP CONSTRAINT "memberships_userId_fkey";

-- DropForeignKey
ALTER TABLE "payment_references" DROP CONSTRAINT "payment_references_orgId_fkey";

-- DropForeignKey
ALTER TABLE "products" DROP CONSTRAINT "products_orgId_fkey";

-- DropForeignKey
ALTER TABLE "roles" DROP CONSTRAINT "roles_orgId_fkey";

-- DropIndex
DROP INDEX "audit_logs_orgId_createdAt_idx";

-- DropIndex
DROP INDEX "invitations_orgId_idx";

-- DropIndex
DROP INDEX "payment_references_orgId_createdAt_idx";

-- DropIndex
DROP INDEX "payment_references_orgId_reference_key";

-- DropIndex
DROP INDEX "products_orgId_slug_key";

-- DropIndex
DROP INDEX "products_orgId_status_idx";

-- DropIndex
DROP INDEX "roles_orgId_name_key";

-- AlterTable
ALTER TABLE "audit_logs" DROP COLUMN "orgId";

-- AlterTable
ALTER TABLE "invitations" DROP COLUMN "orgId";

-- AlterTable
ALTER TABLE "payment_references" DROP COLUMN "orgId";

-- AlterTable
ALTER TABLE "products" DROP COLUMN "orgId";

-- AlterTable
ALTER TABLE "roles" DROP COLUMN "orgId";

-- AlterTable
ALTER TABLE "sessions" DROP COLUMN "orgId";

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "roleId" TEXT;

-- DropTable
DROP TABLE "memberships";

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payment_references_reference_key" ON "payment_references"("reference");

-- CreateIndex
CREATE INDEX "payment_references_createdAt_idx" ON "payment_references"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "products_slug_key" ON "products"("slug");

-- CreateIndex
CREATE INDEX "products_status_idx" ON "products"("status");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;
