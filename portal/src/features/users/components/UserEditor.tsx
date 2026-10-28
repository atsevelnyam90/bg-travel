"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { users as userSchemas, type users } from "@/api/generated/contracts";
import { SelectField, TextField } from "@/components/form";
import { EditorSheet } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";

export function UserEditor({
  user,
  roles,
  isSaving,
  onClose,
  onSave,
}: {
  user: users.User | null;
  roles: users.Role[];
  isSaving: boolean;
  onClose(): void;
  onSave(input: users.UpdateUserInput): Promise<void>;
}) {
  const form = useForm<users.UpdateUserInput>({
    resolver: zodResolver(userSchemas.updateUserSchema),
    defaultValues: { email: "", name: "", status: "INVITED", roleId: null, version: 0 },
  });
  useEffect(() => {
    if (user)
      form.reset({
        email: user.email,
        name: user.name,
        status: user.status,
        roleId: user.roleId,
        version: user.version,
      });
  }, [form, user]);
  const close = () => {
    if (!isSaving) onClose();
  };
  return (
    <EditorSheet
      open={Boolean(user)}
      title="Хэрэглэгч засах"
      description={user?.email ?? ""}
      onClose={close}
    >
      <FormProvider {...form}>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={form.handleSubmit(onSave)}>
          <FieldGroup className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="grid gap-4 md:grid-cols-2">
              <TextField<users.UpdateUserInput> name="email" label="И-мэйл" type="email" />
              <TextField<users.UpdateUserInput> name="name" label="Нэр" />
              <SelectField<users.UpdateUserInput>
                name="status"
                label="Төлөв"
                options={[
                  { label: "Идэвхтэй", value: "ACTIVE" },
                  { label: "Уригдсан", value: "INVITED" },
                  { label: "Идэвхгүй", value: "DISABLED" },
                ]}
              />
              <SelectField<users.UpdateUserInput>
                name="roleId"
                label="Role"
                options={roles.map((role) => ({ value: role.id, label: role.name }))}
                clearable
              />
            </div>
          </FieldGroup>
          <div className="flex justify-end gap-2 border-t px-5 py-3">
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
