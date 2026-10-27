"use client";

import type { Path } from "react-hook-form";
import {
  CheckboxField,
  CurrencyField,
  NumberField,
  SelectField,
  TextField,
} from "@/components/form";
import type { TravelFormValues } from "../travelFormValues";

const path = (index: number, field: string) =>
  `departures.${index}.${field}` as Path<TravelFormValues>;

export function DepartureFields({ index }: { index: number }) {
  return (
    <div className="grid gap-4 md:grid-cols-12">
      <div className="md:col-span-6">
        <TextField<TravelFormValues>
          name={path(index, "departureDate")}
          label="Гарах огноо"
          type="date"
        />
      </div>
      <div className="md:col-span-6">
        <TextField<TravelFormValues>
          name={path(index, "returnDate")}
          label="Буцах огноо"
          type="date"
        />
      </div>
      <div className="md:col-span-6">
        <SelectField<TravelFormValues>
          name={path(index, "transportType")}
          label="Тээврийн төрөл"
          options={[
            { label: "Газар", value: "GROUND" },
            { label: "Шууд нислэг", value: "DIRECT_FLIGHT" },
          ]}
        />
      </div>
      <div className="md:col-span-6">
        <CurrencyField<TravelFormValues>
          name={path(index, "unitPriceMinor")}
          label="Нэг хүний үнэ"
          minorUnits
        />
      </div>
      <div className="md:col-span-6">
        <NumberField<TravelFormValues> name={path(index, "capacity")} label="Нийт суудал" min={1} />
      </div>
      <div className="md:col-span-6">
        <CheckboxField<TravelFormValues>
          name={path(index, "isBookingOpen")}
          label="Захиалга авах"
        />
      </div>
    </div>
  );
}
