"use client";

import { Check, CircleAlert, Minus, Plane, Plus, Search, Users, X } from "lucide-react";
import {
  type BookingQuote,
  formatTravelMoney,
  type TravelOption,
  transportLabel,
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
  variant?: "section" | "drawer" | "card";
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
  return (
    <button className={styles.tripResult} onClick={onSelect} type="button">
      <span className={styles.tripIcon}>
        <Plane size={26} strokeWidth={2.2} />
      </span>
      <span className={styles.tripBody}>
        <span className={styles.tripTitle}>{trip.name}</span>
        <span className={styles.tripMeta}>{trip.description ?? `${trip.slots.length} гаралт`}</span>
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
  const isDrawer = variant === "drawer";

  return (
    <section
      className={`${layout.booking} ${layout[variant]}${variant === "section" ? " section" : ""}`}
      id={isDrawer ? "booking-drawer" : undefined}
      aria-label="Захиалгын хэсэг"
    >
      {isDrawer ? (
        <button
          className={`${layout.backdrop} js-close-booking-drawer`}
          aria-label="Хаах"
          tabIndex={-1}
          type="button"
        />
      ) : null}

      <div className={layout.drawerPanel}>
        {isDrawer ? (
          <button
            className={`${layout.close} js-close-booking-drawer`}
            aria-label="Хаах"
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
                  ? "Аялал сонгох"
                  : screen.step === "customer"
                    ? "Захиалагчийн мэдээлэл"
                    : "Дансны мэдээлэл"
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
                      <span className={styles.label}>Аялал сонгох</span>
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
                          placeholder={screen.selectedTrip?.name ?? "Аялал хайх"}
                          role="combobox"
                          type="search"
                          value={screen.query}
                        />
                        <button
                          aria-label="Clear trip search"
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
                          <p className={styles.empty}>Аяллуудыг ачаалж байна…</p>
                        ) : screen.travelsError ? (
                          <p className={styles.empty}>Аяллын мэдээлэл авахад алдаа гарлаа.</p>
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
                          <p className={styles.empty}>Илэрц олдсонгүй.</p>
                        )}
                      </div>
                    ) : null}
                  </div>

                  <div className={styles.controls}>
                    <div className={styles.field}>
                      <span className={styles.label}>Огноо</span>
                      <BookingDateSelect
                        disabled={!screen.selectedTrip || screen.dateOptions.length === 0}
                        isLight={variant === "card"}
                        onChange={screen.selectDate}
                        options={screen.dateOptions}
                        value={screen.selectedDateKey}
                      />
                    </div>

                    <div className={styles.field}>
                      <span className={styles.label}>Хүний тоо</span>
                      <div className={styles.stepper}>
                        <button
                          aria-label="Decrease travellers"
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
                          aria-label="Increase travellers"
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
                      <span className={styles.label}>Тээврийн төрөл</span>
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
                              {transportLabel(slot.transportType)}
                            </span>
                            <span className={styles.transportPrice}>
                              {formatTravelMoney(slot.unitPriceMinor)} / хүн
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}

                  <div className={styles.total} aria-live="polite">
                    <span className={styles.label}>Нийт үнэ</span>
                    <strong>
                      {screen.quote ? formatTravelMoney(screen.quote.totalPriceMinor) : "—"}
                    </strong>
                  </div>

                  <div
                    role="status"
                    className={
                      screen.quote && !screen.quote.hasAvailability
                        ? `${styles.status} ${styles.statusWarning}`
                        : styles.status
                    }
                  >
                    <CircleAlert aria-hidden="true" size={20} />
                    <span>
                      {screen.quote
                        ? screen.quote.hasAvailability
                          ? `${screen.quote.selectedSlot.capacity} суудалтай. Үргэлжлүүлэх боломжтой.`
                          : "Сонгосон хүний тоонд хүрэлцэх суудал одоогоор алга."
                        : "Үнэ болон суудлын мэдээлэл аялал, гаралт, хүний тоо сонгосны дараа гарна."}
                    </span>
                  </div>

                  <div className={styles.actions} ref={screen.bookingActionsRef}>
                    <p className={styles.note}>Сонгосон мэдээлэл дараагийн алхамд хадгалагдана.</p>
                    <button className={styles.button} disabled={!screen.canContinue} type="submit">
                      Үргэлжлүүлэх
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
