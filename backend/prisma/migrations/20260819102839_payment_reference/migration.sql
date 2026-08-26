-- CreateTable
CREATE TABLE "payment_references" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "reference" TEXT NOT NULL,
    "productId" TEXT,
    "amountMinor" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'MNT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_references_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "payment_references_orgId_createdAt_idx" ON "payment_references"("orgId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "payment_references_orgId_reference_key" ON "payment_references"("orgId", "reference");

-- AddForeignKey
ALTER TABLE "payment_references" ADD CONSTRAINT "payment_references_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
