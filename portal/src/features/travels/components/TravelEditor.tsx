"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { FormProvider, type Resolver, useForm } from "react-hook-form";
import { toast } from "sonner";
import { travels as travelSchemas, type travels } from "@/api/generated/contracts";
import { FormUploadProvider, useFormUploads } from "@/components/form";
import { EditorSheet } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  emptyTravel,
  normalizeTravelForm,
  type TravelFormValues,
  travelToForm,
} from "../travelFormValues";
import { TravelGeneralFields, TravelLocaleFields } from "./TravelCoreFields";
import {
  TravelDeparturesFields,
  TravelDetailsFields,
  TravelSectionsFields,
} from "./TravelRelatedFields";

type TravelEditorProps = {
  open: boolean;
  loading: boolean;
  travel: travels.AdminTravel | null;
  isSaving: boolean;
  onClose(): void;
  onSave(input: travels.CreateAdminTravelInput | travels.UpdateAdminTravelInput): Promise<void>;
};

export function TravelEditor(props: TravelEditorProps) {
  return (
    <FormUploadProvider>
      <TravelEditorForm {...props} />
    </FormUploadProvider>
  );
}

function TravelEditorForm({ open, loading, travel, isSaving, onClose, onSave }: TravelEditorProps) {
  const [activeTab, setActiveTab] = useState("general");
  const { isUploading } = useFormUploads();
  const form = useForm<TravelFormValues>({
    resolver: zodResolver(
      travelSchemas.updateAdminTravelSchema.partial({ version: true }),
    ) as Resolver<TravelFormValues>,
    defaultValues: emptyTravel(),
  });
  useEffect(() => {
    if (!open) return;
    setActiveTab("general");
    if (travel) form.reset(travelToForm(travel));
    else if (!loading) form.reset(emptyTravel());
  }, [form, loading, open, travel]);

  const isBusy = isSaving || isUploading;
  const close = () => {
    if (isBusy) {
      toast.error(isUploading ? "Файл байршуулж дуусаагүй байна" : "Хадгалж дуусаагүй байна");
      return;
    }
    onClose();
  };

  return (
    <EditorSheet
      open={open}
      title={travel ? "Аялал засах" : "Аялал нэмэх"}
      description={travel?.name ?? "Аяллын мэдээлэл, гаралт, хөтөлбөр"}
      onClose={close}
    >
      {loading ? (
        <div className="space-y-4 p-5">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-72 w-full" />
        </div>
      ) : (
        <FormProvider {...form}>
          <form
            className="flex min-h-0 flex-1 flex-col"
            onSubmit={form.handleSubmit(
              async (rawValues) => {
                if (isUploading) {
                  toast.error("Файл байршуулж дууссаны дараа хадгална уу");
                  return;
                }
                const values = normalizeTravelForm(rawValues);
                if (travel) {
                  await onSave({
                    ...values,
                    version: travel.version,
                  } as travels.UpdateAdminTravelInput);
                } else {
                  const { version: _version, ...input } = values;
                  await onSave(input);
                }
              },
              (errors) => {
                if (errors.departures) setActiveTab("departures");
                else if (errors.sections) setActiveTab("sections");
                else if (errors.details) setActiveTab("details");
                else setActiveTab("general");
                toast.error(
                  "Аяллыг хадгалах боломжгүй. Улаанаар тэмдэглэсэн талбаруудыг шалгана уу.",
                );
              },
            )}
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="min-h-0 flex-1 gap-0 overflow-hidden"
            >
              <div className="overflow-x-auto border-b px-5">
                <TabsList variant="line" className="w-max justify-start">
                  <TabsTrigger value="general">Үндсэн</TabsTrigger>
                  <TabsTrigger value="departures">Гаралтууд</TabsTrigger>
                  <TabsTrigger value="sections">Бүлгүүд</TabsTrigger>
                  <TabsTrigger value="details">Өдрүүд</TabsTrigger>
                </TabsList>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
                <TabsContent value="general" className="space-y-8">
                  <section className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">Үндсэн тохиргоо</h3>
                      <p className="text-muted-foreground text-sm">
                        Холбоос, ангилал, төлөв болон нүүр зургийг тохируулна.
                      </p>
                    </div>
                    <TravelGeneralFields />
                  </section>

                  <section className="space-y-4">
                    <div className="space-y-1">
                      <h3 className="font-semibold text-lg">Контент ба орчуулга</h3>
                      <p className="text-muted-foreground text-sm">
                        Монгол контент заавал, бусад хэлний орчуулга сонголтоор байна.
                      </p>
                    </div>
                    <Tabs defaultValue="mn" className="rounded-xl border bg-card p-4">
                      <TabsList variant="line" className="max-w-full justify-start overflow-x-auto">
                        <TabsTrigger value="mn">Монгол</TabsTrigger>
                        <TabsTrigger value="en">English</TabsTrigger>
                        <TabsTrigger value="zh">中文</TabsTrigger>
                        <TabsTrigger value="ko">한국어</TabsTrigger>
                      </TabsList>
                      <TabsContent value="mn" className="pt-4">
                        <TravelLocaleFields locale="mn" />
                      </TabsContent>
                      <TabsContent value="en" className="pt-4">
                        <TravelLocaleFields locale="en" />
                      </TabsContent>
                      <TabsContent value="zh" className="pt-4">
                        <TravelLocaleFields locale="zh" />
                      </TabsContent>
                      <TabsContent value="ko" className="pt-4">
                        <TravelLocaleFields locale="ko" />
                      </TabsContent>
                    </Tabs>
                  </section>
                </TabsContent>
                <TabsContent value="departures">
                  <TravelDeparturesFields />
                </TabsContent>
                <TabsContent value="sections">
                  <TravelSectionsFields />
                </TabsContent>
                <TabsContent value="details">
                  <TravelDetailsFields />
                </TabsContent>
              </div>
            </Tabs>
            <div className="flex justify-end gap-2 border-t bg-background px-5 py-3">
              <Button type="button" variant="outline" onClick={close} disabled={isBusy}>
                Болих
              </Button>
              <Button type="submit" disabled={isBusy || !form.formState.isDirty}>
                {isUploading ? "Файл байршуулж байна…" : isSaving ? "Хадгалж байна…" : "Хадгалах"}
              </Button>
            </div>
          </form>
        </FormProvider>
      )}
    </EditorSheet>
  );
}
