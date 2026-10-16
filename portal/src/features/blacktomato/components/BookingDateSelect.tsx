"use client";

import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import styles from "./bookingForm.module.css";

type BookingDateSelectProps = {
  disabled: boolean;
  isLight: boolean;
  onChange: (value: string) => void;
  options: Array<{ key: string; label: string }>;
  value: string | null;
};

export function BookingDateSelect({
  disabled,
  isLight,
  onChange,
  options,
  value,
}: BookingDateSelectProps) {
  const t = useTranslations("publicBooking");

  return (
    <div className={styles.dateSelect}>
      <CalendarDays aria-hidden="true" size={24} />
      <Select disabled={disabled} onValueChange={onChange} value={value ?? ""}>
        <SelectTrigger aria-label={t("departure")} className={styles.dateTrigger}>
          <SelectValue placeholder={t("selectDeparture")} />
        </SelectTrigger>
        <SelectContent
          align="start"
          className={`${styles.dateMenu} ${isLight ? styles.dateMenuLight : ""}`}
          position="popper"
        >
          {options.map((option) => (
            <SelectItem className={styles.dateOption} key={option.key} value={option.key}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
