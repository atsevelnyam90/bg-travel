"use client";

import { useState } from "react";
import { useFieldArray, useFormContext, useWatch } from "react-hook-form";
import { toast } from "sonner";
import {
  type DepartureFormValue,
  type DetailFormValue,
  emptyDeparture,
  emptyDetail,
  emptySection,
  type SectionFormValue,
  type TravelFormValues,
} from "../travelFormValues";

type EditorState<T> = {
  index: number;
  isNew: boolean;
  snapshot: T | null;
};

const copyDeparture = (value: DepartureFormValue): DepartureFormValue => ({ ...value });
const copySection = (value: SectionFormValue): SectionFormValue => ({
  ...value,
  images: [...value.images],
});
const copyDetail = (value: DetailFormValue): DetailFormValue => ({
  ...value,
  images: [...value.images],
});

export function useTravelDeparturesEditor() {
  const form = useFormContext<TravelFormValues>();
  const departures = useFieldArray({
    control: form.control,
    name: "departures",
    keyName: "_formKey",
  });
  const values = useWatch({ control: form.control, name: "departures" }) ?? [];
  const [editor, setEditor] = useState<EditorState<DepartureFormValue> | null>(null);

  function add() {
    const index = departures.fields.length;
    departures.append(emptyDeparture());
    setEditor({ index, isNew: true, snapshot: null });
  }

  function edit(index: number) {
    setEditor({
      index,
      isNew: false,
      snapshot: copyDeparture(form.getValues(`departures.${index}`)),
    });
  }

  function cancel() {
    if (!editor) return;
    form.clearErrors(`departures.${editor.index}`);
    if (editor.isNew) departures.remove(editor.index);
    else if (editor.snapshot) form.setValue(`departures.${editor.index}`, editor.snapshot);
    setEditor(null);
  }

  async function save() {
    if (!editor) return;
    if (!(await form.trigger(`departures.${editor.index}`))) {
      toast.error("Гарах, буцах огноо болон суудлын тоог зөв бөглөнө үү.");
      return;
    }
    setEditor(null);
  }

  function remove(index: number) {
    const row = form.getValues(`departures.${index}`);
    if (row.id) departures.update(index, { ...row, _delete: true });
    else departures.remove(index);
  }

  return { fields: departures.fields, values, editor, add, edit, cancel, save, remove };
}

export function useTravelSectionsEditor() {
  const form = useFormContext<TravelFormValues>();
  const sections = useFieldArray({
    control: form.control,
    name: "sections",
    keyName: "_formKey",
  });
  const sectionValues = useWatch({ control: form.control, name: "sections" }) ?? [];
  const detailValues = useWatch({ control: form.control, name: "details" }) ?? [];
  const [sectionEditor, setSectionEditor] = useState<EditorState<SectionFormValue> | null>(null);

  function addSection() {
    const index = sections.fields.length;
    sections.append(emptySection());
    setSectionEditor({ index, isNew: true, snapshot: null });
  }

  function editSection(index: number) {
    setSectionEditor({
      index,
      isNew: false,
      snapshot: copySection(form.getValues(`sections.${index}`)),
    });
  }

  function cancelSection() {
    if (!sectionEditor) return;
    form.clearErrors(`sections.${sectionEditor.index}`);
    if (sectionEditor.isNew) sections.remove(sectionEditor.index);
    else if (sectionEditor.snapshot) {
      form.setValue(`sections.${sectionEditor.index}`, sectionEditor.snapshot);
    }
    setSectionEditor(null);
  }

  async function saveSection() {
    if (!sectionEditor) return;
    if (!(await form.trigger(`sections.${sectionEditor.index}`))) {
      toast.error("Бүлгийн гарчиг болон дарааллыг зөв бөглөнө үү.");
      return;
    }
    setSectionEditor(null);
  }

  function removeSection(index: number) {
    const row = form.getValues(`sections.${index}`);
    if (row.id) {
      detailValues.forEach((detail, detailIndex) => {
        if (detail.sectionId === row.id) {
          form.setValue(`details.${detailIndex}.sectionId`, null, { shouldDirty: true });
        }
      });
      sections.update(index, { ...row, _delete: true });
    } else sections.remove(index);
  }

  return {
    fields: sections.fields,
    values: sectionValues,
    editor: sectionEditor,
    add: addSection,
    edit: editSection,
    cancel: cancelSection,
    save: saveSection,
    remove: removeSection,
  };
}

export function useTravelDetailsEditor() {
  const form = useFormContext<TravelFormValues>();
  const details = useFieldArray({
    control: form.control,
    name: "details",
    keyName: "_formKey",
  });
  const values = useWatch({ control: form.control, name: "details" }) ?? [];
  const sectionValues = useWatch({ control: form.control, name: "sections" }) ?? [];
  const [editor, setEditor] = useState<EditorState<DetailFormValue> | null>(null);

  function addDetail() {
    const index = details.fields.length;
    details.append(emptyDetail());
    setEditor({ index, isNew: true, snapshot: null });
  }

  function editDetail(index: number) {
    setEditor({
      index,
      isNew: false,
      snapshot: copyDetail(form.getValues(`details.${index}`)),
    });
  }

  function cancelDetail() {
    if (!editor) return;
    form.clearErrors(`details.${editor.index}`);
    if (editor.isNew) details.remove(editor.index);
    else if (editor.snapshot) {
      form.setValue(`details.${editor.index}`, editor.snapshot);
    }
    setEditor(null);
  }

  async function saveDetail() {
    if (!editor) return;
    if (!(await form.trigger(`details.${editor.index}`))) {
      toast.error("Өдрийн дугаар болон гарчгийг зөв бөглөнө үү.");
      return;
    }
    setEditor(null);
  }

  function removeDetail(index: number) {
    const row = form.getValues(`details.${index}`);
    if (row.id) details.update(index, { ...row, _delete: true });
    else details.remove(index);
  }

  return {
    sectionValues,
    fields: details.fields,
    values,
    editor,
    add: addDetail,
    edit: editDetail,
    cancel: cancelDetail,
    save: saveDetail,
    remove: removeDetail,
  };
}
