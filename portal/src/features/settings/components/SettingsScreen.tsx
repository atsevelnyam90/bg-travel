"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { organization as orgContract } from "@/api/generated/contracts";
import { SelectField, TextField } from "@/components/form";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Skeleton } from "@/components/ui/skeleton";
import { usePermissions } from "@/features/auth";
import { apiErrorMessage } from "@/lib/api/errorMessage";
import { useBanks, useOrganization, useUpdateOrganization } from "../hooks/useOrganization";

type Values = orgContract.UpdateOrganizationInput;

export function SettingsScreen() {
  const { can } = usePermissions();
  const canManage = can("org:manage");
  const org = useOrganization();
  const banks = useBanks();
  const save = useUpdateOrganization();

  const form = useForm<Values>({
    resolver: zodResolver(orgContract.updateOrganizationSchema),
    defaultValues: {
      name: "",
      bankCode: null,
      bankAccount: "",
      bankAccountName: "",
      version: 0,
    },
  });

  useEffect(() => {
    if (!org.data) return;
    form.reset({
      name: org.data.name,
      logoUrl: org.data.logoUrl,
      bankCode: org.data.bankCode,
      bankAccount: org.data.bankAccount ?? "",
      bankAccountName: org.data.bankAccountName ?? "",
      version: org.data.version,
    });
  }, [org.data, form]);

  // Банкны жагсаалт нь сервер талын mn-integrations/banks-аас ирнэ —
  // Монголбанкны оролцогчийн код + BIC. Portal дээр давхардуулж бичихгүй.
  const bankOptions = useMemo(
    () => (banks.data ?? []).map((bank) => ({ value: bank.code, label: bank.name })),
    [banks.data],
  );

  const onSubmit = form.handleSubmit(async (values) => {
    if (!canManage) return;
    try {
      await save.mutateAsync(values);
      toast.success("Хадгалагдлаа");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Байгууллагын тохиргоог хадгалж чадсангүй"));
    }
  });

  if (org.isPending) return <Skeleton className="h-72 w-full max-w-xl rounded-lg" />;

  return (
    <div className="space-y-6">
      <PageHeader title="Тохиргоо" description="Байгууллагын мэдээлэл, төлбөрийн данс." />

      <FormProvider {...form}>
        <form onSubmit={onSubmit} noValidate className="max-w-xl space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Байгууллага</CardTitle>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <TextField<Values> name="name" label="Нэр" disabled={!canManage} />
              </FieldGroup>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Төлбөрийн данс</CardTitle>
              <CardDescription>
                Бараа болон аяллын төлбөрийн QR үүсгэхэд ашиглагдана. Банкны аппууд уншина.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup>
                <SelectField<Values>
                  name="bankCode"
                  label="Банк"
                  options={bankOptions}
                  clearable
                  disabled={!canManage}
                />
                <TextField<Values>
                  name="bankAccount"
                  label="Данс / IBAN"
                  autoComplete="off"
                  disabled={!canManage}
                />
                <TextField<Values>
                  name="bankAccountName"
                  label="Данс эзэмшигчийн нэр"
                  description="QR дотор латинаар хөрвүүлэгдэж бичигдэнэ."
                  disabled={!canManage}
                />
              </FieldGroup>
            </CardContent>
          </Card>

          {canManage ? (
            <Button type="submit" disabled={save.isPending || !form.formState.isDirty}>
              {save.isPending ? "Хадгалж байна…" : "Хадгалах"}
            </Button>
          ) : null}
        </form>
      </FormProvider>
    </div>
  );
}
