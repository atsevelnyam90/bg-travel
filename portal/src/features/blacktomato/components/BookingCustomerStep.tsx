"use client";

import { ArrowLeft } from "lucide-react";
import { useId } from "react";
import {
  type BookingBudgetScreen,
  formatTravelDate,
  formatTravelMoney,
  transportLabel,
} from "../hooks/useBookingBudgetScreen";
import styles from "./bookingForm.module.css";

export function BookingCustomerStep({ screen }: { screen: BookingBudgetScreen }) {
  const fieldId = useId();
  const quote = screen.quote;
  if (!quote) return null;
  const { errors } = screen.customerForm.formState;
  const id = (name: string) => `${fieldId}-${name}`;

  return (
    <form className={styles.form} onSubmit={screen.continueToPayment}>
      <div className={styles.stepHeaderRow}>
        <button
          aria-label="Аялал сонгох хэсэг рүү буцах"
          className={styles.stepBackButton}
          onClick={screen.goBackToSelection}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <h3 className={styles.stepTitle}>Захиалагчийн мэдээлэл</h3>
      </div>

      <div className={styles.summary}>
        <strong>{quote.selectedTrip.name}</strong>
        <span>
          · {formatTravelDate(quote.selectedSlot.departureDate, quote.selectedSlot.departureDate)}
        </span>
        <span>
          · {transportLabel(quote.selectedSlot.transportType)} · {quote.peopleCount} хүн
        </span>
        <b>· {formatTravelMoney(quote.totalPriceMinor)}</b>
      </div>

      <div className={styles.customerGrid}>
        <label className={styles.field} htmlFor={id("lastName")}>
          <span className={styles.label}>Овог</span>
          <input
            {...screen.customerForm.register("lastName")}
            aria-invalid={Boolean(errors.lastName)}
            autoComplete="family-name"
            className={styles.customerInput}
            id={id("lastName")}
          />
          {errors.lastName ? <small className={styles.fieldError}>Овгоо оруулна уу.</small> : null}
        </label>
        <label className={styles.field} htmlFor={id("firstName")}>
          <span className={styles.label}>Нэр</span>
          <input
            {...screen.customerForm.register("firstName")}
            aria-invalid={Boolean(errors.firstName)}
            autoComplete="given-name"
            className={styles.customerInput}
            id={id("firstName")}
          />
          {errors.firstName ? <small className={styles.fieldError}>Нэрээ оруулна уу.</small> : null}
        </label>
        <label className={styles.field} htmlFor={id("phone")}>
          <span className={styles.label}>Утас</span>
          <input
            {...screen.customerForm.register("phone")}
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
            className={styles.customerInput}
            id={id("phone")}
            inputMode="tel"
          />
          {errors.phone ? (
            <small className={styles.fieldError}>Утасны дугаараа зөв оруулна уу.</small>
          ) : null}
        </label>
        <label className={styles.field} htmlFor={id("email")}>
          <span className={styles.label}>И-мэйл</span>
          <input
            {...screen.customerForm.register("email")}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className={styles.customerInput}
            id={id("email")}
            inputMode="email"
            type="email"
          />
          {errors.email ? (
            <small className={styles.fieldError}>И-мэйл хаягаа зөв оруулна уу.</small>
          ) : null}
        </label>
        <label className={styles.field} htmlFor={id("address")}>
          <span className={styles.label}>Хаяг (заавал биш)</span>
          <input
            {...screen.customerForm.register("address")}
            aria-invalid={Boolean(errors.address)}
            autoComplete="street-address"
            className={styles.customerInput}
            id={id("address")}
          />
          {errors.address ? (
            <small className={styles.fieldError}>Хаяг 500 тэмдэгтээс хэтрэхгүй байна.</small>
          ) : null}
        </label>
      </div>

      <div className={styles.customerActions}>
        <button className={styles.button} disabled={screen.isSubmitting} type="submit">
          Үргэлжлүүлэх
        </button>
      </div>
    </form>
  );
}
