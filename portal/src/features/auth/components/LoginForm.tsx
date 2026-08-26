"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { FormProvider, useForm } from "react-hook-form";
import { toast } from "sonner";
import { auth as authContract } from "@/api/generated/contracts";
import { TextField } from "@/components/form/TextField";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { ApiError } from "@/lib/api/apiClient";
import { useLogin } from "../hooks/useLogin";

// Validation schema нь backend-ээс generate хийгдсэн contract — гараар давхардуулахгүй.
type LoginValues = authContract.LoginInput;

export function LoginForm() {
  const router = useRouter();
  const login = useLogin();

  const form = useForm<LoginValues>({
    resolver: zodResolver(authContract.loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const onSubmit = form.handleSubmit(async (values) => {
    try {
      await login.mutateAsync(values);
      router.replace("/dashboard");
    } catch (error) {
      // Сервер и-мэйл/нууц үгийн алийг нь буруу болохыг ЗААДАГГҮЙ —
      // тандалтаас сэргийлэх зорилготой. Тэр мессежийг хэвээр харуулна.
      toast.error(error instanceof ApiError ? error.message : "Нэвтрэхэд алдаа гарлаа");
    }
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Нэвтрэх</CardTitle>
        <CardDescription>И-мэйл болон нууц үгээ оруулна уу.</CardDescription>
      </CardHeader>
      <CardContent>
        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate>
            <FieldGroup>
              <TextField<LoginValues>
                name="email"
                label="И-мэйл"
                type="email"
                autoComplete="email"
                autoFocus
              />
              <TextField<LoginValues>
                name="password"
                label="Нууц үг"
                type="password"
                autoComplete="current-password"
              />
              <Button type="submit" disabled={login.isPending} className="w-full">
                {login.isPending ? "Нэвтэрч байна…" : "Нэвтрэх"}
              </Button>
            </FieldGroup>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
