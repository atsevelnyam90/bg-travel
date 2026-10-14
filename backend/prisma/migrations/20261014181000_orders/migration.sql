-- CreateEnum
CREATE TYPE "order_status" AS ENUM ('AWAITING_PAYMENT', 'PAID');

-- CreateEnum
CREATE TYPE "transport_type" AS ENUM ('GROUND', 'DIRECT_FLIGHT');

-- CreateTable
CREATE TABLE "orders" (
    "id" TEXT NOT NULL,
    "public_order_id" VARCHAR(20) NOT NULL,
    "first_name" VARCHAR(100) NOT NULL,
    "last_name" VARCHAR(100) NOT NULL,
    "address" TEXT NOT NULL,
    "phone" VARCHAR(30) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "service_code" VARCHAR(50) NOT NULL,
    "transport_type" "transport_type",
    "travel_date" DATE NOT NULL,
    "traveler_count" INTEGER NOT NULL,
    "service_name_snapshot" VARCHAR(255) NOT NULL,
    "transport_name_snapshot" VARCHAR(100),
    "unit_price_mnt" BIGINT NOT NULL,
    "total_price_mnt" BIGINT NOT NULL,
    "status" "order_status" NOT NULL DEFAULT 'AWAITING_PAYMENT',
    "confirmed_by_user_id" TEXT,
    "confirmed_at" TIMESTAMPTZ,
    "idempotency_key" VARCHAR(64) NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "deletedAt" TIMESTAMPTZ,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "orders_traveler_count_check" CHECK ("traveler_count" > 0),
    CONSTRAINT "chk_paid_confirmation" CHECK (
      (
        "status" = 'AWAITING_PAYMENT'
        AND "confirmed_by_user_id" IS NULL
        AND "confirmed_at" IS NULL
      )
      OR
      (
        "status" = 'PAID'
        AND "confirmed_by_user_id" IS NOT NULL
        AND "confirmed_at" IS NOT NULL
      )
    )
);

-- CreateIndex
CREATE UNIQUE INDEX "orders_public_order_id_key" ON "orders"("public_order_id");

-- CreateIndex
CREATE UNIQUE INDEX "orders_idempotency_key_key" ON "orders"("idempotency_key");

-- CreateIndex
CREATE INDEX "idx_orders_status_created" ON "orders"("status", "created_at");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_confirmed_by_user_id_fkey"
  FOREIGN KEY ("confirmed_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

