/*
  Warnings:

  - You are about to drop the column `destination` on the `travels` table. All the data in the column will be lost.
  - You are about to drop the column `durationDays` on the `travels` table. All the data in the column will be lost.
  - You are about to drop the column `durationNights` on the `travels` table. All the data in the column will be lost.
  - You are about to drop the column `excludedServices` on the `travels` table. All the data in the column will be lost.
  - You are about to drop the column `galleryImageUrls` on the `travels` table. All the data in the column will be lost.
  - You are about to drop the column `imageUrl` on the `travels` table. All the data in the column will be lost.
  - You are about to drop the column `includedServices` on the `travels` table. All the data in the column will be lost.
  - You are about to drop the column `slug` on the `travels` table. All the data in the column will be lost.
  - You are about to drop the column `sortOrder` on the `travels` table. All the data in the column will be lost.
  - You are about to drop the column `status` on the `travels` table. All the data in the column will be lost.
  - You are about to drop the column `summary` on the `travels` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "travels_slug_key";

-- DropIndex
DROP INDEX "travels_status_sortOrder_idx";

-- AlterTable
ALTER TABLE "travels" DROP COLUMN "destination",
DROP COLUMN "durationDays",
DROP COLUMN "durationNights",
DROP COLUMN "excludedServices",
DROP COLUMN "galleryImageUrls",
DROP COLUMN "imageUrl",
DROP COLUMN "includedServices",
DROP COLUMN "slug",
DROP COLUMN "sortOrder",
DROP COLUMN "status",
DROP COLUMN "summary";

-- DropEnum
DROP TYPE "TravelStatus";

-- CreateIndex
CREATE INDEX "travels_name_idx" ON "travels"("name");
