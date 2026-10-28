"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef } from "react";
import { FormProvider, useForm, useWatch } from "react-hook-form";
import type { orders } from "@/api/generated/contracts";
import { orders as orderSchemas } from "@/api/generated/contracts";
import { multiplyMinor } from "@/api/generated/contracts/money";
import {
  CurrencyField,
  NumberField,
  SelectField,
  TextareaField,
  TextField,
} from "@/components/form";
import { EditorSheet } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { orderStatusOptions } from "../labels";

type Values = orders.UpdateAdminOrderInput;

const emptyValues = (): Values => ({
  publicOrderId: "",
  firstName: "",
  lastName: "",
  address: "",
  phone: "",
  email: "",
  serviceCode: "",
  travelDepartureId: null,
  transportType: null,
  travelDate: "",
  travelerCount: 1,
  serviceNameSnapshot: "",
  transportNameSnapshot: null,
  unitPriceMinor: 0,
  totalPriceMinor: 0,
  status: "AWAITING_PAYMENT",
  idempotencyKey: "",
  version: 0,
});

export function OrderEditor({
  open,
  order,
  departureOptions,
  departureOptionsLoading,
  isSaving,
  onClose,
  onSave,
}: {
  open: boolean;
  order: orders.AdminOrder | null;
  departureOptions: orders.AdminOrderDepartureOption[];
  departureOptionsLoading: boolean;
  isSaving: boolean;
  onClose(): void;
  onSave(input: orders.CreateAdminOrderInput | orders.UpdateAdminOrderInput): Promise<void>;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(orderSchemas.updateAdminOrderSchema),
    defaultValues: emptyValues(),
  });
  const previousDepartureId = useRef<string | null>(null);
  const selectedDepartureId = useWatch({ control: form.control, name: "travelDepartureId" });
  useEffect(() => {
    if (!open) return;
    previousDepartureId.current = order?.travelDepartureId ?? null;
    form.reset(
      order
        ? {
            ...order,
            address: order.address ?? "",
            transportNameSnapshot: order.transportNameSnapshot ?? null,
          }
        : emptyValues(),
    );
  }, [form, order, open]);

  useEffect(() => {
    if (!open || selectedDepartureId === previousDepartureId.current) return;
    previousDepartureId.current = selectedDepartureId ?? null;
    if (!selectedDepartureId) return;
    const departure = departureOptions.find((option) => option.id === selectedDepartureId);
    if (!departure) return;
    const travelerCount = form.getValues("travelerCount");
    form.setValue("serviceCode", "TRAVEL", { shouldDirty: true });
    form.setValue("transportType", departure.transportType, { shouldDirty: true });
    form.setValue("travelDate", departure.departureDate, { shouldDirty: true });
    form.setValue("serviceNameSnapshot", departure.travelName, { shouldDirty: true });
    form.setValue("unitPriceMinor", departure.unitPriceMinor, { shouldDirty: true });
    form.setValue("totalPriceMinor", multiplyMinor(departure.unitPriceMinor, travelerCount), {
      shouldDirty: true,
    });
  }, [departureOptions, form, open, selectedDepartureId]);

  const close = () => {
    if (!isSaving) onClose();
  };

  return (
    <EditorSheet
      open={open}
      title={order ? "Захиалга засах" : "Захиалга нэмэх"}
      description={order?.publicOrderId ?? "Захиалгын мэдээлэл"}
      onClose={close}
    >
      <FormProvider {...form}>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit(async (values) => {
            if (isSaving) return;
            const input = {
              ...values,
              transportNameSnapshot: values.transportNameSnapshot || null,
            };
            if (order) await onSave(input);
            else {
              const {
                version: _version,
                publicOrderId: _publicOrderId,
                idempotencyKey: _idempotencyKey,
                ...createInput
              } = input;
              await onSave(createInput);
            }
          })}
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-3">
                {order ? (
                  <TextField<Values> name="publicOrderId" label="Захиалгын дугаар" disabled />
                ) : null}
                <TextField<Values> name="firstName" label="Нэр" />
                <TextField<Values> name="lastName" label="Овог" />
              </div>
              <TextareaField<Values> name="address" label="Хаяг" />
              <div className="grid gap-4 md:grid-cols-2">
                <TextField<Values> name="phone" label="Утас" />
                <TextField<Values> name="email" label="И-мэйл" type="email" />
              </div>
            </FieldGroup>
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="md:col-span-3">
                  <SelectField<Values>
                    name="travelDepartureId"
                    label="Аяллын гаралт"
                    placeholder={
                      departureOptionsLoading ? "Гаралт ачаалж байна…" : "Гаралт сонгоно уу"
                    }
                    options={departureOptions.map((departure) => ({
                      value: departure.id,
                      label: `${departure.travelName} · ${departure.departureDate} · ${departure.remainingSeats} суудал${departure.isBookingOpen ? "" : " · хаалттай"}`,
                    }))}
                    clearable
                    disabled={departureOptionsLoading}
                  />
                </div>
                <TextField<Values> name="serviceCode" label="Үйлчилгээний код" />
                <SelectField<Values>
                  name="transportType"
                  label="Тээврийн төрөл"
                  options={[
                    { label: "Газар", value: "GROUND" },
                    { label: "Шууд нислэг", value: "DIRECT_FLIGHT" },
                  ]}
                  clearable
                />
                <TextField<Values> name="travelDate" label="Аяллын огноо" type="date" />
                <NumberField<Values> name="travelerCount" label="Зорчигчийн тоо" min={1} />
                <TextField<Values> name="serviceNameSnapshot" label="Үйлчилгээний нэр" />
                <TextField<Values> name="transportNameSnapshot" label="Тээврийн нэр" />
              </div>
            </FieldGroup>
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-3">
                <CurrencyField<Values> name="unitPriceMinor" label="Нэгж үнэ" minorUnits />
                <CurrencyField<Values> name="totalPriceMinor" label="Нийт үнэ" minorUnits />
                <SelectField<Values> name="status" label="Төлөв" options={orderStatusOptions} />
              </div>
            </FieldGroup>
          </div>
          <div className="flex justify-end gap-2 border-t bg-background px-5 py-3">
            <Button type="button" variant="outline" onClick={close} disabled={isSaving}>
              Болих
            </Button>
            <Button type="submit" disabled={isSaving || !form.formState.isDirty}>
              {isSaving ? "Хадгалж байна…" : "Хадгалах"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </EditorSheet>
  );
}
