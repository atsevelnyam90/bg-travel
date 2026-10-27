"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, useSearchParams } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { auth as authContract } from "@/api/generated/contracts";
import { TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { FieldGroup } from "@/components/ui/field";
import { api } from "@/lib/api/apiClient";
import { apiErrorMessage } from "@/lib/api/errorMessage";

type Values = authContract.AcceptInviteInput;

export function AcceptInviteForm() {
  const token = useSearchParams().get("token") ?? "";
  const router = useRouter();

  const form = useForm<Values>({
    resolver: zodResolver(authContract.acceptInviteSchema),
    defaultValues: { token, name: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await api.post<void>("/auth/accept-invite", values, { skipAuthRefresh: true });
      toast.success("Бүртгэл идэвхжлээ. Одоо нэвтэрнэ үү.");
      router.replace("/auth/login");
    } catch (error) {
      toast.error(apiErrorMessage(error, "Бүртгэлийг идэвхжүүлж чадсангүй"));
    }
  });

  if (!token) {
    return (
      <Empty className="border bg-background">
        <EmptyHeader>
          <EmptyTitle>Урилга олдсонгүй</EmptyTitle>
          <EmptyDescription>И-мэйл дэх холбоосыг бүтнээр нь хуулж оруулна уу.</EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Бүртгэлээ идэвхжүүлэх</CardTitle>
        <CardDescription>Нэр болон нууц үгээ тохируулна уу.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <TextField<Values> name="name" label="Нэр" autoComplete="name" autoFocus />
              <TextField<Values>
                name="password"
                label="Нууц үг"
                type="password"
                autoComplete="new-password"
                description="Дор хаяж 8 тэмдэгт."
              />
              <Button type="submit" disabled={form.formState.isSubmitting} className="w-full">
                {form.formState.isSubmitting ? "Хадгалж байна…" : "Идэвхжүүлэх"}
              </Button>
            </FieldGroup>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
