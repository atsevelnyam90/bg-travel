"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { users as userSchemas, type users } from "@/api/generated/contracts";
import { SelectField, TextField } from "@/components/form";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FieldGroup } from "@/components/ui/field";

export function InviteUserDialog({
  open,
  roles,
  isSaving,
  onClose,
  onSave,
}: {
  open: boolean;
  roles: users.Role[];
  isSaving: boolean;
  onClose(): void;
  onSave(input: users.InviteUserInput): Promise<void>;
}) {
  const form = useForm<users.InviteUserInput>({
    resolver: zodResolver(userSchemas.inviteUserSchema),
    defaultValues: { email: "", name: "", roleId: roles[0]?.id ?? "" },
  });
  useEffect(() => {
    if (open) form.reset({ email: "", name: "", roleId: roles[0]?.id ?? "" });
  }, [form, open, roles]);
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Хэрэглэгч урих</DialogTitle>
          <DialogDescription>И-мэйлээр урилга илгээнэ.</DialogDescription>
        </DialogHeader>
        <FormProvider {...form}>
          <form onSubmit={form.handleSubmit(onSave)}>
            <FieldGroup>
              <TextField<users.InviteUserInput> name="email" label="И-мэйл" type="email" />
              <TextField<users.InviteUserInput> name="name" label="Нэр" />
              <SelectField<users.InviteUserInput>
                name="roleId"
                label="Role"
                options={roles.map((role) => ({ value: role.id, label: role.name }))}
              />
            </FieldGroup>
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={onClose}>
                Болих
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? "Илгээж байна…" : "Урих"}
              </Button>
            </DialogFooter>
          </form>
        </FormProvider>
      </DialogContent>
    </Dialog>
  );
}
