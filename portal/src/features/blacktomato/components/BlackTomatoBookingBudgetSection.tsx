"use client";

import { Check, CircleAlert, Minus, Plane, Plus, Search, Users, X } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  type BookingQuote,
  formatTravelMoney,
  type TravelOption,
  useBookingBudgetScreen,
} from "../hooks/useBookingBudgetScreen";
import { BookingCustomerStep } from "./BookingCustomerStep";
import { BookingDateSelect } from "./BookingDateSelect";
import { BookingPaymentStep } from "./BookingPaymentStep";
import styles from "./bookingForm.module.css";
import layout from "./bookingLayout.module.css";

type BlackTomatoBookingBudgetSectionProps = {
  initialTripId?: string;
  mode?: "home" | "detail";
  onContinue?: (quote: BookingQuote) => void;
  variant?: "section" | "drawer" | "sideDrawer" | "card";
};

type BlackTomatoBookingBudgetViewProps = {
  screen: ReturnType<typeof useBookingBudgetScreen>;
  variant: NonNullable<BlackTomatoBookingBudgetSectionProps["variant"]>;
};

function TripResult({
  isSelected,
  onSelect,
  trip,
}: {
  isSelected: boolean;
  onSelect: () => void;
  trip: TravelOption;
}) {
  const t = useTranslations("publicBooking");

  return (
    <button className={styles.tripResult} onClick={onSelect} type="button">
      <span className={styles.tripIcon}>
        <Plane size={26} strokeWidth={2.2} />
      </span>
      <span className={styles.tripBody}>
        <span className={styles.tripTitle}>{trip.name}</span>
        <span className={styles.tripMeta}>
          {trip.description ?? t("departures", { count: trip.slots.length })}
        </span>
      </span>
      <span className={styles.tripAdd} aria-hidden="true">
        {isSelected ? <Check size={24} /> : <Plus size={26} />}
      </span>
    </button>
  );
}

export function BlackTomatoBookingBudgetSection({
  initialTripId,
  mode = "home",
  onContinue,
  variant = "section",
}: BlackTomatoBookingBudgetSectionProps) {
  const screen = useBookingBudgetScreen({ initialTripId, mode, onContinue });

  return <BlackTomatoBookingBudgetView screen={screen} variant={variant} />;
}

export function BlackTomatoBookingBudgetView({
  screen,
  variant,
}: BlackTomatoBookingBudgetViewProps) {
  const t = useTranslations("publicBooking");
  const isDrawer = variant === "drawer" || variant === "sideDrawer";

  return (
    <section
      className={`${layout.booking} ${layout[variant]}${variant === "section" ? " section" : ""}`}
      id={isDrawer ? "booking-drawer" : undefined}
      aria-label={t("sectionLabel")}
    >
      {isDrawer ? (
        <button
          className={`${layout.backdrop} js-close-booking-drawer`}
          aria-label={t("close")}
          tabIndex={-1}
          type="button"
        />
      ) : null}

      <div className={layout.drawerPanel}>
        {isDrawer ? (
          <button
            className={`${layout.close} js-close-booking-drawer`}
            aria-label={t("close")}
            data-booking-initial-focus
            type="button"
          >
            <X size={22} />
          </button>
        ) : null}

        <div className={layout.wrap}>
          <div
            className={variant === "card" ? `${styles.panel} ${styles.panelLight}` : styles.panel}
          >
            <section
              aria-label={
                screen.step === "selection"
                  ? t("selectTrip")
                  : screen.step === "customer"
                    ? t("customer.title")
                    : t("payment.title")
              }
              className={styles.stepTransition}
              data-step={screen.step}
              key={screen.step}
              ref={screen.stepContainerRef}
              tabIndex={-1}
            >
              {screen.step === "customer" ? (
                <BookingCustomerStep screen={screen} />
              ) : screen.step === "payment" ? (
                <BookingPaymentStep screen={screen} />
              ) : (
                <form className={styles.form} onSubmit={screen.continueBooking}>
                  <div className={styles.travel}>
                    <label className={styles.field}>
                      <span className={styles.label}>{t("selectTrip")}</span>
                      <span className={styles.search}>
                        <Search aria-hidden="true" size={24} />
                        <input
                          aria-autocomplete="list"
                          aria-expanded={screen.isDropdownOpen}
                          onChange={(event) => {
                            screen.setQuery(event.target.value);
                            screen.setDropdownOpen(true);
                          }}
                          onFocus={() => screen.setDropdownOpen(true)}
                          placeholder={screen.selectedTrip?.name ?? t("searchTrip")}
                          role="combobox"
                          type="search"
                          value={screen.query}
                        />
                        <button
                          aria-label={t("clearSearch")}
                          className={styles.clear}
                          onClick={() => {
                            screen.setQuery("");
                            screen.setDropdownOpen(false);
                          }}
                          type="button"
                        >
                          <X size={23} />
                        </button>
                      </span>
                    </label>

                    {screen.selectedTrip ? (
                      <p className={styles.selectedTrip}>{screen.selectedTrip.name}</p>
                    ) : null}

                    {screen.isDropdownOpen ? (
                      <div className={styles.results}>
                        {screen.isLoading ? (
                          <p className={styles.empty}>{t("loadingTrips")}</p>
                        ) : screen.travelsError ? (
                          <p className={styles.empty}>{t("tripsError")}</p>
                        ) : screen.filteredTripGroups.some((group) => group.trips.length > 0) ? (
                          screen.filteredTripGroups.map((group) =>
                            group.trips.length > 0 ? (
                              <div className={styles.group} key={group.category}>
                                <span className={styles.groupLabel}>{group.category}</span>
                                {group.trips.map((trip) => (
                                  <TripResult
                                    isSelected={trip.publicId === screen.selectedTrip?.publicId}
                                    key={trip.publicId}
                                    onSelect={() => screen.selectTrip(trip)}
                                    trip={trip}
                                  />
                                ))}
                              </div>
                            ) : null,
                          )
                        ) : (
                          <p className={styles.empty}>{t("noResults")}</p>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className={styles.controls}>
                    <div className={styles.field}>
                      <span className={styles.label}>{t("date")}</span>
                      <BookingDateSelect
                        disabled={!screen.selectedTrip || screen.dateOptions.length === 0}
                        isLight={variant === "card"}
                        onChange={screen.selectDate}
                        options={screen.dateOptions}
                        value={screen.selectedDateKey}
                      />
                    </div>

                    <div className={styles.field}>
                      <span className={styles.label}>{t("travellers")}</span>
                      <div className={styles.stepper}>
                        <button
                          aria-label={t("decreaseTravellers")}
                          disabled={screen.peopleCount <= 1}
                          onClick={screen.decrementPeople}
                          type="button"
                        >
                          <Minus size={20} />
                        </button>
                        <span className={styles.count}>
                          <Users aria-hidden="true" size={17} /> {screen.peopleCount}
                        </span>
                        <button
                          aria-label={t("increaseTravellers")}
                          onClick={screen.incrementPeople}
                          type="button"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                    </div>
                  </div>

                  {screen.selectedDateKey && screen.transportOptions.length > 0 ? (
                    <div className={styles.transport}>
                      <span className={styles.label}>{t("transportType")}</span>
                      <div className={styles.transportList}>
                        {screen.transportOptions.map((slot) => (
                          <button
                            aria-pressed={slot.publicId === screen.selectedSlot?.publicId}
                            className={styles.transportButton}
                            key={slot.publicId}
                            onClick={() => screen.setSelectedSlotId(slot.publicId)}
                            type="button"
                          >
                            <span className={styles.transportName}>
                              {screen.transportLabel(slot.transportType)}
                            </span>
                            <span className={styles.transportPrice}>
                              {t("perPerson", {
                                price: formatTravelMoney(slot.unitPriceMinor),
                              })}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className={styles.total} aria-live="polite">
                    <span className={styles.label}>{t("totalPrice")}</span>
                    <strong>
                      {screen.quote ? formatTravelMoney(screen.quote.totalPriceMinor) : "—"}
                    </strong>
                  </div>

                  {!screen.quote?.hasAvailability ? (
                    <div
                      role="status"
                      className={
                        screen.quote ? `${styles.status} ${styles.statusWarning}` : styles.status
                      }
                    >
                      <CircleAlert aria-hidden="true" size={20} />
                      <span>{screen.quote ? t("notEnoughSeats") : t("quoteHint")}</span>
                    </div>
                  ) : null}

                  <div className={styles.actions} ref={screen.bookingActionsRef}>
                    <p className={styles.note}>
                      {screen.quote
                        ? t("remainingSeats", {
                            count: screen.quote.selectedSlot.remainingSeats,
                          })
                        : t("remainingSeatsHint")}
                    </p>
                    <button className={styles.button} disabled={!screen.canContinue} type="submit">
                      {t("continue")}
                    </button>
                  </div>
                </form>
              )}
            </section>
          </div>
        </div>
      </div>
    </section>
  );
}

export const BlackTomatoBookingWidget = BlackTomatoBookingBudgetSection;
