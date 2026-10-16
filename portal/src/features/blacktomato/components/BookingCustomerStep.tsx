"use client";

import { ArrowLeft } from "lucide-react";
import { useTranslations } from "next-intl";
import { useId } from "react";
import { type BookingBudgetScreen, formatTravelMoney } from "../hooks/useBookingBudgetScreen";
import styles from "./bookingForm.module.css";

export function BookingCustomerStep({ screen }: { screen: BookingBudgetScreen }) {
  const t = useTranslations("publicBooking.customer");
  const fieldId = useId();
  const quote = screen.quote;
  if (!quote) return null;
  const { errors } = screen.customerForm.formState;
  const id = (name: string) => `${fieldId}-${name}`;

  return (
    <form className={styles.form} onSubmit={screen.continueToPayment}>
      <div className={styles.stepHeaderRow}>
        <button
          aria-label={t("back")}
          className={styles.stepBackButton}
          onClick={screen.goBackToSelection}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <h3 className={styles.stepTitle}>{t("title")}</h3>
      </div>

      <div className={styles.summary}>
        <strong>{quote.selectedTrip.name}</strong>
        <span>
          ·{" "}
          {screen.formatTravelDate(quote.selectedSlot.departureDate, quote.selectedSlot.returnDate)}
        </span>
        <span>
          · {screen.transportLabel(quote.selectedSlot.transportType)} ·{" "}
          {t("people", { count: quote.peopleCount })}
        </span>
        <b>· {formatTravelMoney(quote.totalPriceMinor)}</b>
      </div>

      <div className={styles.customerGrid}>
        <label className={styles.field} htmlFor={id("lastName")}>
          <span className={styles.label}>{t("lastName")}</span>
          <input
            {...screen.customerForm.register("lastName")}
            aria-invalid={Boolean(errors.lastName)}
            autoComplete="family-name"
            className={styles.customerInput}
            id={id("lastName")}
          />
          {errors.lastName ? (
            <small className={styles.fieldError}>{t("lastNameError")}</small>
          ) : null}
        </label>
        <label className={styles.field} htmlFor={id("firstName")}>
          <span className={styles.label}>{t("firstName")}</span>
          <input
            {...screen.customerForm.register("firstName")}
            aria-invalid={Boolean(errors.firstName)}
            autoComplete="given-name"
            className={styles.customerInput}
            id={id("firstName")}
          />
          {errors.firstName ? (
            <small className={styles.fieldError}>{t("firstNameError")}</small>
          ) : null}
        </label>
        <label className={styles.field} htmlFor={id("phone")}>
          <span className={styles.label}>{t("phone")}</span>
          <input
            {...screen.customerForm.register("phone")}
            aria-invalid={Boolean(errors.phone)}
            autoComplete="tel"
            className={styles.customerInput}
            id={id("phone")}
            inputMode="tel"
          />
          {errors.phone ? <small className={styles.fieldError}>{t("phoneError")}</small> : null}
        </label>
        <label className={styles.field} htmlFor={id("email")}>
          <span className={styles.label}>{t("email")}</span>
          <input
            {...screen.customerForm.register("email")}
            aria-invalid={Boolean(errors.email)}
            autoComplete="email"
            className={styles.customerInput}
            id={id("email")}
            inputMode="email"
            type="email"
          />
          {errors.email ? <small className={styles.fieldError}>{t("emailError")}</small> : null}
        </label>
        <label className={styles.field} htmlFor={id("address")}>
          <span className={styles.label}>{t("address")}</span>
          <input
            {...screen.customerForm.register("address")}
            aria-invalid={Boolean(errors.address)}
            autoComplete="street-address"
            className={styles.customerInput}
            id={id("address")}
          />
          {errors.address ? <small className={styles.fieldError}>{t("addressError")}</small> : null}
        </label>
      </div>

      <div className={styles.customerActions}>
        <button className={styles.button} disabled={screen.isSubmitting} type="submit">
          {t("continue")}
        </button>
      </div>
    </form>
  );
}
