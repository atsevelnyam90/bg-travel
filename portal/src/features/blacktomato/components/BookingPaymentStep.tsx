"use client";

import { Check, CircleAlert, Copy } from "lucide-react";
import dynamic from "next/dynamic";
import { toMajor } from "@/api/generated/contracts/money";
import {
  type BookingBudgetScreen,
  formatTravelMoney,
  type PaymentCopyField,
} from "../hooks/useBookingBudgetScreen";
import styles from "./bookingForm.module.css";

const QRCode = dynamic(() => import("react-qr-code"), { ssr: false });
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
  return (
    <div className={styles.paymentRow}>
      <span>
        <small>{label}</small>
        <strong>{value}</strong>
      </span>
      <button
        aria-label={`${label} хуулах`}
        className={styles.copyButton}
        onClick={() => onCopy(field, copyValue)}
        type="button"
      >
        {copied ? <Check aria-hidden="true" size={17} /> : <Copy aria-hidden="true" size={17} />}
        {copied ? "Хуулсан" : "Хуулах"}
      </button>
    </div>
  );
}

export function BookingPaymentStep({ screen }: { screen: BookingBudgetScreen }) {
  const payment = screen.paymentInfo;
  const quote = screen.quote;
  if (!quote) return null;
  const amountToCopy = String(toMajor(quote.totalPriceMinor));

  return (
    <div className={styles.paymentStep} aria-live="polite">
      <div className={styles.paymentHeader}>
        <h3 className={styles.stepTitle}>Дансны мэдээлэл</h3>
      </div>

      <div className={styles.paymentContent}>
        <div className={styles.qrCard}>
          <div className={styles.qrCode}>
            <QRCode aria-label="Түр төлбөрийн QR код" size={180} value={TEMPORARY_PAYMENT_QR} />
          </div>
        </div>

        {payment ? (
          <div className={styles.paymentDetails}>
            <div className={styles.paymentRow}>
              <span>
                <small>Банк</small>
                <strong>{payment.bankName}</strong>
              </span>
            </div>
            <CopyRow
              copied={screen.copiedPaymentField === "bankAccount"}
              copyValue={payment.bankAccount}
              field="bankAccount"
              label="Данс / IBAN"
              onCopy={screen.copyPaymentValue}
              value={formatBankAccount(payment.bankAccount)}
            />
            <div className={styles.paymentRow}>
              <span>
                <small>Данс эзэмшигч</small>
                <strong>{payment.bankAccountName}</strong>
              </span>
            </div>
            <CopyRow
              copied={screen.copiedPaymentField === "amount"}
              copyValue={amountToCopy}
              field="amount"
              label="Төлөх дүн"
              onCopy={screen.copyPaymentValue}
              value={formatTravelMoney(quote.totalPriceMinor)}
            />
          </div>
        ) : null}
      </div>

      {screen.paymentInfoError || screen.submitError ? (
        <div className={`${styles.status} ${styles.statusWarning}`} role="alert">
          <CircleAlert aria-hidden="true" size={20} />
          <span>
            {screen.submitError ?? "Дансны мэдээлэл авахад алдаа гарлаа. Дахин оролдоно уу."}
          </span>
        </div>
      ) : null}

      <button
        className={styles.button}
        disabled={
          screen.paymentInfoLoading || !payment || screen.isSubmitting || !!screen.orderResult
        }
        onClick={() => void screen.confirmPayment()}
        type="button"
      >
        {screen.isSubmitting ? "Бүртгэж байна…" : "Төлсөн"}
      </button>
    </div>
  );
}
