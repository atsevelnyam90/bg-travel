-- CreateTable
CREATE TABLE "document_sequences" (
    "name" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "counter" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "document_sequences_pkey" PRIMARY KEY ("name","period")
);
