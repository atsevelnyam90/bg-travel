"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import type { orders } from "@/api/generated/contracts";
import { orders as orderSchemas } from "@/api/generated/contracts";
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
  isSaving,
  onClose,
  onSave,
}: {
  open: boolean;
  order: orders.AdminOrder | null;
  isSaving: boolean;
  onClose(): void;
  onSave(input: orders.CreateAdminOrderInput | orders.UpdateAdminOrderInput): Promise<void>;
}) {
  const form = useForm<Values>({
    resolver: zodResolver(orderSchemas.updateAdminOrderSchema),
    defaultValues: emptyValues(),
  });
  useEffect(() => {
    if (!open) return;
    form.reset(
      order
        ? {
            ...order,
            address: order.address ?? "",
            transportNameSnapshot: order.transportNameSnapshot ?? null,
          }
        : { ...emptyValues(), idempotencyKey: crypto.randomUUID() },
    );
  }, [form, order, open]);

  return (
    <EditorSheet
      open={open}
      title={order ? "Захиалга засах" : "Захиалга нэмэх"}
      description={order?.publicOrderId ?? "Захиалгын мэдээлэл"}
      onClose={onClose}
    >
      <FormProvider {...form}>
        <form
          className="flex min-h-0 flex-1 flex-col"
          onSubmit={form.handleSubmit(async (values) => {
            const input = {
              ...values,
              transportNameSnapshot: values.transportNameSnapshot || null,
            };
            if (order) await onSave(input);
            else {
              const { version: _version, ...createInput } = input;
              await onSave(createInput);
            }
          })}
        >
          <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-5 py-5">
            <FieldGroup>
              <div className="grid gap-4 md:grid-cols-3">
                <TextField<Values> name="publicOrderId" label="Захиалгын дугаар" />
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
                <TextField<Values> name="serviceCode" label="Үйлчилгээний код" />
                <SelectField<Values>
                  name="transportType"
                  label="Тээврийн төрөл"
                  options={[
                    { label: "Газар", value: "GROUND" },
                    { label: "Шууд нислэг", value: "DIRECT_FLIGHT" },
                  ]}
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
                <SelectField<Values>
                  name="status"
                  label="Төлөв"
                  options={[
                    { label: "Баталгаажаагүй", value: "AWAITING_PAYMENT" },
                    { label: "Баталгаажсан", value: "PAID" },
                  ]}
                />
              </div>
              <TextField<Values> name="idempotencyKey" label="Idempotency key" />
            </FieldGroup>
          </div>
          <div className="flex justify-end gap-2 border-t bg-background px-5 py-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Болих
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Хадгалж байна…" : "Хадгалах"}
            </Button>
          </div>
        </form>
      </FormProvider>
    </EditorSheet>
  );
}
