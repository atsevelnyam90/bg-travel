"use client";

import dynamic from "next/dynamic";
import type { RichTextFieldProps } from "@/components/form/RichTextField";
import type { TravelFormValues } from "../travelFormValues";

export const TravelRichTextField = dynamic<RichTextFieldProps<TravelFormValues>>(
  () => import("@/components/form/RichTextField").then((module) => module.RichTextField),
  { ssr: false },
);
