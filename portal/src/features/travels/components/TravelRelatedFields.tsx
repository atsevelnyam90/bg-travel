"use client";

import { CalendarDays, ChevronRight, Layers3, MapPinned, Plus, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { formatMinor } from "@/api/generated/contracts/money";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useTravelDeparturesEditor,
  useTravelDetailsEditor,
  useTravelSectionsEditor,
} from "../hooks/useTravelRelatedEditor";
import type { DepartureFormValue, DetailFormValue } from "../travelFormValues";
import { DepartureFields } from "./DepartureFields";
import { DetailFields } from "./DetailFields";
import { SectionFields } from "./SectionFields";

const transportLabels: Record<DepartureFormValue["transportType"], string> = {
  GROUND: "Газрын тээвэр",
  DIRECT_FLIGHT: "Шууд нислэг",
};

export function TravelDeparturesFields() {
  const editor = useTravelDeparturesEditor();
  const visibleRows = editor.fields
    .map((field, index) => ({ field, index, value: editor.values[index] }))
    .filter(({ value }) => value && !value._delete);

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Аяллын гаралтууд"
        description="Огноо, үнэ, суудал болон захиалга авах төлөвийг удирдана."
        actionLabel="Гаралт нэмэх"
        onAction={editor.add}
      />

      {visibleRows.length === 0 ? (
        <EmptyRelatedState
          icon={<CalendarDays />}
          title="Гаралт нэмээгүй байна"
          description="Захиалга авахын тулд аяллын огноо, үнэ, суудлын мэдээлэл нэмнэ үү."
          actionLabel="Эхний гаралтыг нэмэх"
          onAction={editor.add}
        />
      ) : (
        <div className="divide-y overflow-hidden rounded-xl border bg-card">
          {visibleRows.map(({ field, index, value }) => (
            <RelatedRow
              key={field._formKey}
              title={departureTitle(value)}
              description={`${transportLabels[value.transportType]} · ${formatMinor(value.unitPriceMinor)} · ${value.capacity} суудал`}
              status={value.isBookingOpen ? "Захиалга нээлттэй" : "Захиалга хаалттай"}
              onEdit={() => editor.edit(index)}
              onRemove={() => editor.remove(index)}
            />
          ))}
        </div>
      )}

      <RelatedEditorDialog
        open={editor.editor !== null}
        title={editor.editor?.isNew ? "Гаралт нэмэх" : "Гаралт засах"}
        description="Огноо, тээвэр, үнэ болон суудлын мэдээллийг бөглөнө үү."
        onCancel={editor.cancel}
        onSave={editor.save}
      >
        {editor.editor ? <DepartureFields index={editor.editor.index} /> : null}
      </RelatedEditorDialog>
    </div>
  );
}

export function TravelSectionsFields() {
  const editor = useTravelSectionsEditor();
  const visibleRows = editor.fields
    .map((field, index) => ({ field, index, value: editor.values[index] }))
    .filter(({ value }) => value && !value._delete);

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Хөтөлбөрийн бүлгүүд"
        description="Хөтөлбөрийн том хэсгүүд, зураг болон орчуулгыг энд удирдана."
        actionLabel="Бүлэг нэмэх"
        onAction={editor.add}
      />
      {visibleRows.length === 0 ? (
        <EmptyRelatedState
          icon={<Layers3 />}
          title="Хөтөлбөрийн бүлэг алга"
          description="Аяллын хөтөлбөрийг хэсгүүдэд хувааж оруулна уу."
          actionLabel="Эхний бүлгийг нэмэх"
          onAction={editor.add}
        />
      ) : (
        <div className="divide-y overflow-hidden rounded-xl border bg-card">
          {visibleRows.map(({ field, index, value }) => (
            <RelatedRow
              key={field._formKey}
              title={value.title || "Гарчиггүй бүлэг"}
              description={`Дараалал ${value.sortOrder} · ${value.images.length} зураг`}
              onEdit={() => editor.edit(index)}
              onRemove={() => editor.remove(index)}
            />
          ))}
        </div>
      )}

      <RelatedEditorDialog
        open={editor.editor !== null}
        title={editor.editor?.isNew ? "Хөтөлбөрийн бүлэг нэмэх" : "Хөтөлбөрийн бүлэг засах"}
        description="Бүлгийн үндсэн мэдээлэл, зураг болон хэл бүрийн контентыг бөглөнө үү."
        onCancel={editor.cancel}
        onSave={editor.save}
      >
        {editor.editor ? <SectionFields index={editor.editor.index} /> : null}
      </RelatedEditorDialog>
    </div>
  );
}

export function TravelDetailsFields() {
  const editor = useTravelDetailsEditor();
  const visibleRows = editor.fields
    .map((field, index) => ({ field, index, value: editor.values[index] }))
    .filter(({ value }) => value && !value._delete);
  const sectionOptions = editor.sectionValues
    .filter((section) => section.id && !section._delete)
    .map((section) => ({ value: section.id ?? "", label: section.title || "Гарчиггүй бүлэг" }));
  const sectionNames = new Map(
    editor.sectionValues
      .filter((section) => section.id)
      .map((section) => [section.id, section.title || "Гарчиггүй бүлэг"]),
  );

  return (
    <div className="space-y-5">
      <SectionHeading
        title="Өдрийн хөтөлбөр"
        description="Өдөр бүрийн нэр, тайлбар, зураг болон харьяалах бүлгийг тохируулна."
        actionLabel="Өдөр нэмэх"
        onAction={editor.add}
      />
      {visibleRows.length === 0 ? (
        <EmptyRelatedState
          icon={<MapPinned />}
          title="Өдрийн хөтөлбөр алга"
          description="Аяллын өдөр бүрийн хөтөлбөрийг дарааллаар нь нэмнэ үү."
          actionLabel="Эхний өдрийг нэмэх"
          onAction={editor.add}
        />
      ) : (
        <div className="divide-y overflow-hidden rounded-xl border bg-card">
          {visibleRows.map(({ field, index, value }) => (
            <RelatedRow
              key={field._formKey}
              title={`Өдөр ${value.dayNumber} · ${value.title || "Гарчиггүй"}`}
              description={detailDescription(value, sectionNames)}
              onEdit={() => editor.edit(index)}
              onRemove={() => editor.remove(index)}
            />
          ))}
        </div>
      )}

      <RelatedEditorDialog
        open={editor.editor !== null}
        title={editor.editor?.isNew ? "Өдрийн хөтөлбөр нэмэх" : "Өдрийн хөтөлбөр засах"}
        description="Өдрийн дугаар, гарчиг, зураг болон тайлбарыг бөглөнө үү."
        onCancel={editor.cancel}
        onSave={editor.save}
      >
        {editor.editor ? (
          <DetailFields index={editor.editor.index} sectionOptions={sectionOptions} />
        ) : null}
      </RelatedEditorDialog>
    </div>
  );
}

function departureTitle(value: DepartureFormValue) {
  if (!value.departureDate && !value.returnDate) return "Огноо сонгоогүй";
  return `${value.departureDate || "Гарах огноо сонгоогүй"} → ${value.returnDate || "Буцах огноо сонгоогүй"}`;
}

function detailDescription(
  value: DetailFormValue,
  sectionNames: Map<string | null | undefined, string>,
) {
  const section = value.sectionId ? sectionNames.get(value.sectionId) : null;
  return `${section ?? "Бүлэг сонгоогүй"} · ${value.images.length} зураг`;
}

function SectionHeading({
  title,
  description,
  actionLabel,
  onAction,
}: {
  title: string;
  description: string;
  actionLabel: string;
  onAction(): void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div className="space-y-1">
        <h3 className="font-semibold text-lg">{title}</h3>
        <p className="text-muted-foreground text-sm">{description}</p>
      </div>
      <Button type="button" variant="outline" onClick={onAction}>
        <Plus />
        {actionLabel}
      </Button>
    </div>
  );
}

function RelatedRow({
  title,
  description,
  status,
  onEdit,
  onRemove,
}: {
  title: string;
  description: string;
  status?: string;
  onEdit(): void;
  onRemove(): void;
}) {
  return (
    <div className="group flex items-stretch transition-colors hover:bg-muted/40">
      <button
        type="button"
        className="flex min-w-0 flex-1 items-center gap-3 p-4 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
        onClick={onEdit}
      >
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate font-medium">{title}</span>
            {status ? (
              <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                {status}
              </span>
            ) : null}
          </div>
          <span className="block text-muted-foreground text-sm">{description}</span>
        </div>
        <ChevronRight className="text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
      </button>
      <div className="flex shrink-0 items-center pr-4">
        <Button type="button" size="sm" variant="destructive" onClick={onRemove}>
          <Trash2 />
          Устгах
        </Button>
      </div>
    </div>
  );
}

function EmptyRelatedState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel: string;
  onAction(): void;
}) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed px-5 py-10 text-center">
      <div className="mb-3 flex size-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
      <p className="font-medium">{title}</p>
      <p className="mt-1 max-w-md text-muted-foreground text-sm">{description}</p>
      <Button type="button" size="sm" className="mt-4" onClick={onAction}>
        <Plus />
        {actionLabel}
      </Button>
    </div>
  );
}

function RelatedEditorDialog({
  open,
  title,
  description,
  onCancel,
  onSave,
  children,
}: {
  open: boolean;
  title: string;
  description: string;
  onCancel(): void;
  onSave(): void | Promise<void>;
  children: ReactNode;
}) {
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-h-[90vh] grid-rows-[auto_minmax(0,1fr)_auto] overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b px-5 py-4 pr-12">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="overflow-y-auto px-5 py-1">{children}</div>
        <DialogFooter className="m-0 rounded-none px-5 py-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Болих
          </Button>
          <Button type="button" onClick={onSave}>
            Хадгалах
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
