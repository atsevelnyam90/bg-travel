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
import { apiErrorMessage } from "@/lib/api/errorMessage";
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
      router.replace("/admin/dashboard");
    } catch (error) {
      // Сервер и-мэйл/нууц үгийн алийг нь буруу болохыг ЗААДАГГҮЙ —
      // тандалтаас сэргийлэх зорилготой. Тэр мессежийг хэвээр харуулна.
      toast.error(apiErrorMessage(error, "Нэвтрэх боломжгүй байна"));
    }
  });

  return (
    <Card className="gap-0 rounded-3xl bg-card/95 py-0 shadow-xl ring-foreground/10 backdrop-blur-sm">
      <CardHeader className="gap-2 px-6 pt-7 pb-5 sm:px-8 sm:pt-8">
        <CardTitle role="heading" aria-level={1} className="text-2xl tracking-tight">
          Тавтай морил
        </CardTitle>
        <CardDescription className="leading-6">
          Удирдлагын хэсэгт и-мэйл, нууц үгээрээ нэвтэрнэ үү.
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-7 sm:px-8 sm:pb-8">
        <FormProvider {...form}>
          <form onSubmit={onSubmit} noValidate autoComplete="on">
            <FieldGroup className="gap-4">
              <TextField<LoginValues>
                name="email"
                label="И-мэйл"
                type="email"
                inputMode="email"
                enterKeyHint="next"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                autoFocus
                placeholder="name@example.com"
                className="h-11 rounded-xl px-3.5"
              />
              <TextField<LoginValues>
                name="password"
                label="Нууц үг"
                type="password"
                enterKeyHint="go"
                autoComplete="current-password"
                placeholder="Нууц үгээ оруулна уу"
                className="h-11 rounded-xl px-3.5"
              />
              <Button
                type="submit"
                size="lg"
                disabled={login.isPending}
                className="h-11 w-full rounded-xl"
              >
                {login.isPending ? "Нэвтэрч байна…" : "Нэвтрэх"}
              </Button>
            </FieldGroup>
          </form>
        </FormProvider>
      </CardContent>
    </Card>
  );
}
