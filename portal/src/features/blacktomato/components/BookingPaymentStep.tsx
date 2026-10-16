"use client";

import { ArrowLeft, Check, CircleAlert, Copy, LoaderCircle } from "lucide-react";
import dynamic from "next/dynamic";
import { useTranslations } from "next-intl";
import { toMajor } from "@/api/generated/contracts/money";
import { Skeleton } from "@/components/ui/skeleton";
import {
  type BookingBudgetScreen,
  formatTravelMoney,
  type PaymentCopyField,
} from "../hooks/useBookingBudgetScreen";
import styles from "./bookingForm.module.css";

const QRCode = dynamic(() => import("react-qr-code"), {
  loading: () => <Skeleton aria-label="QR" className={styles.qrSkeleton} role="status" />,
  ssr: false,
});
const TEMPORARY_PAYMENT_QR = "BG-TRAVEL-PAYMENT-QR-COMING-SOON";

function formatBankAccount(value: string): string {
  return value.startsWith("MN") ? (value.match(/.{1,4}/g)?.join(" ") ?? value) : value;
}

type CopyRowProps = {
  copied: boolean;
  copyValue: string;
  field: PaymentCopyField;
  label: string;
  onCopy: (field: PaymentCopyField, value: string) => Promise<void>;
  value: string;
};

function CopyRow({ copied, copyValue, field, label, onCopy, value }: CopyRowProps) {
  const t = useTranslations("publicBooking.payment");

  return (
    <div className={styles.paymentRow}>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
      <button
        aria-label={t("copyLabel", { label })}
        className={styles.copyButton}
        onClick={() => onCopy(field, copyValue)}
        type="button"
      >
        {copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}
        {copied ? t("copied") : t("copy")}
      </button>
    </div>
  );
}

export function BookingPaymentStep({ screen }: { screen: BookingBudgetScreen }) {
  const t = useTranslations("publicBooking.payment");
  const payment = screen.paymentInfo;
  const quote = screen.quote;
  if (!quote) return null;
  const amountToCopy = String(toMajor(quote.totalPriceMinor));

  return (
    <div className={styles.paymentStep} aria-live="polite">
      <div className={styles.paymentHeader}>
        <button
          aria-label={t("back")}
          className={styles.stepBackButton}
          disabled={screen.isSubmitting || !!screen.orderResult}
          onClick={screen.goBackToCustomer}
          type="button"
        >
          <ArrowLeft aria-hidden="true" size={20} />
        </button>
        <h3 className={styles.stepTitle}>{t("title")}</h3>
      </div>

      <div className={styles.paymentContent}>
        <div className={styles.qrCard}>
          <div className={styles.qrCode}>
            <QRCode aria-label={t("temporaryQr")} size={180} value={TEMPORARY_PAYMENT_QR} />
          </div>
        </div>

        {payment ? (
          <div className={styles.paymentDetails}>
            <div className={styles.paymentRow}>
              <span>
                <small>{t("bank")}</small>
                <strong>{payment.bankName}</strong>
              </span>
            </div>
            <CopyRow
              copied={screen.copiedPaymentField === "bankAccount"}
              copyValue={payment.bankAccount}
              field="bankAccount"
              label={t("account")}
              onCopy={screen.copyPaymentValue}
              value={formatBankAccount(payment.bankAccount)}
            />
            <div className={styles.paymentRow}>
              <span>
                <small>{t("accountHolder")}</small>
                <strong>{payment.bankAccountName}</strong>
              </span>
            </div>
            <CopyRow
              copied={screen.copiedPaymentField === "amount"}
              copyValue={amountToCopy}
              field="amount"
              label={t("amount")}
              onCopy={screen.copyPaymentValue}
              value={formatTravelMoney(quote.totalPriceMinor)}
            />
          </div>
        ) : null}
      </div>

      {screen.paymentInfoError ? (
        <div className={`${styles.status} ${styles.statusWarning}`} role="alert">
          <CircleAlert aria-hidden="true" size={20} />
          <span>{t("error")}</span>
        </div>
      ) : null}

      <button
        aria-busy={screen.isSubmitting}
        className={styles.button}
        disabled={
          screen.paymentInfoLoading || !payment || screen.isSubmitting || !!screen.orderResult
        }
        onClick={() => void screen.confirmPayment()}
        type="button"
      >
        {screen.isSubmitting ? (
          <>
            <LoaderCircle aria-hidden="true" className={styles.buttonSpinner} size={18} />
            {t("submitting")}
          </>
        ) : screen.orderResult ? (
          <>
            <Check aria-hidden="true" size={18} />
            {t("submitted")}
          </>
        ) : (
          t("paid")
        )}
      </button>
    </div>
  );
}
