"use client";

import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef } from "react";
import { type FieldValues, type Path, useFormContext, useWatch } from "react-hook-form";
import { Field, FieldDescription, FieldError, FieldLabel } from "@/components/ui/field";
import styles from "./richTextField.module.css";
import { useFieldError } from "./useFieldError";

const emptyDocument: JSONContent = { type: "doc", content: [{ type: "paragraph" }] };

function isDocument(value: unknown): value is JSONContent {
  return typeof value === "object" && value !== null && "type" in value && value.type === "doc";
}

function plainTextDocument(value: string): JSONContent {
  return {
    type: "doc",
    content: value
      .split(/\r?\n/)
      .map((line) =>
        line
          ? { type: "paragraph", content: [{ type: "text", text: line }] }
          : { type: "paragraph" },
      ),
  };
}

function toDocument(value: unknown): JSONContent {
  if (isDocument(value)) return value;
  if (typeof value !== "string" || !value.trim()) return emptyDocument;
  try {
    const parsed: unknown = JSON.parse(value);
    if (isDocument(parsed)) return parsed;
  } catch {
    // Legacy plain text is converted to paragraphs without losing content.
  }
  return plainTextDocument(value);
}

export type RichTextFieldProps<T extends FieldValues> = {
  name: Path<T>;
  label: string;
  placeholder?: string;
  description?: string;
};

export function RichTextField<T extends FieldValues>({
  name,
  label,
  placeholder = "Тайлбар бичих",
  description,
}: RichTextFieldProps<T>) {
  const form = useFormContext<T>();
  const value = useWatch({ control: form.control, name });
  const lastValue = useRef<unknown>(value);
  const { message, errorId, invalid, describedBy } = useFieldError<T>(name);
  const editor = useEditor({
    content: toDocument(value),
    extensions: [StarterKit.configure({ heading: { levels: [2, 3] } })],
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: styles.content,
        "data-placeholder": placeholder,
        "aria-describedby": describedBy ?? "",
      },
    },
    onUpdate: ({ editor: instance }) => {
      const next = JSON.stringify(instance.getJSON());
      lastValue.current = next;
      form.setValue(name, next as never, { shouldDirty: true, shouldValidate: true });
    },
  });

  form.register(name);
  useEffect(() => {
    if (!editor || value === lastValue.current) return;
    editor.commands.setContent(toDocument(value), { emitUpdate: false });
    lastValue.current = value;
  }, [editor, value]);

  return (
    <Field data-invalid={invalid}>
      <FieldLabel>{label}</FieldLabel>
      <div className={styles.editor} aria-invalid={invalid}>
        <div className={styles.toolbar} role="toolbar" aria-label={`${label} formatting`}>
          <ToolbarButton
            active={editor?.isActive("heading", { level: 2 })}
            onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            H2
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("bold")}
            onClick={() => editor?.chain().focus().toggleBold().run()}
          >
            B
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("italic")}
            onClick={() => editor?.chain().focus().toggleItalic().run()}
          >
            I
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("bulletList")}
            onClick={() => editor?.chain().focus().toggleBulletList().run()}
          >
            •
          </ToolbarButton>
          <ToolbarButton
            active={editor?.isActive("orderedList")}
            onClick={() => editor?.chain().focus().toggleOrderedList().run()}
          >
            1.
          </ToolbarButton>
          <ToolbarButton
            disabled={!editor?.can().undo()}
            onClick={() => editor?.chain().focus().undo().run()}
          >
            ↶
          </ToolbarButton>
          <ToolbarButton
            disabled={!editor?.can().redo()}
            onClick={() => editor?.chain().focus().redo().run()}
          >
            ↷
          </ToolbarButton>
        </div>
        <EditorContent editor={editor} />
      </div>
      {description && !message ? <FieldDescription>{description}</FieldDescription> : null}
      {message ? <FieldError id={errorId}>{message}</FieldError> : null}
    </Field>
  );
}

function ToolbarButton({
  active = false,
  disabled = false,
  onClick,
  children,
}: {
  active?: boolean;
  disabled?: boolean;
  onClick(): void;
  children: string;
}) {
  return (
    <button
      type="button"
      className={styles.toolbarButton}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
