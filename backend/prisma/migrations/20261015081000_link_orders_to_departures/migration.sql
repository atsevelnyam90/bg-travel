-- Existing order мөнгийг minor unit нэршилтэй болгож, аяллын гаралттай холбоно.
ALTER TABLE "orders" RENAME COLUMN "unit_price_mnt" TO "unit_price_minor";
ALTER TABLE "orders" RENAME COLUMN "total_price_mnt" TO "total_price_minor";

ALTER TABLE "orders" ADD COLUMN "travel_departure_id" TEXT;

CREATE INDEX "idx_orders_travel_departure" ON "orders"("travel_departure_id");

ALTER TABLE "orders" ADD CONSTRAINT "orders_travel_departure_id_fkey"
  FOREIGN KEY ("travel_departure_id") REFERENCES "travel_departures"("id")
  ON DELETE RESTRICT ON UPDATE CASCADE;
