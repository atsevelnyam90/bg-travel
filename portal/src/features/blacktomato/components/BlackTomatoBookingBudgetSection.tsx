"use client";

import {
  CalendarDays,
  Check,
  CircleAlert,
  MapPin,
  Minus,
  Plane,
  Plus,
  Search,
  Users,
  X,
} from "lucide-react";
import {
  type BookingQuote,
  formatTravelMoney,
  type TravelOption,
  useBookingBudgetScreen,
} from "../hooks/useBookingBudgetScreen";
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
        {trip.isInternational ? (
          <Plane size={26} strokeWidth={2.2} />
        ) : (
          <MapPin size={27} strokeWidth={2.4} />
        )}
      </span>
      <span className={styles.tripBody}>
        <span className={styles.tripTitle}>{trip.title}</span>
        <span className={styles.tripMeta}>
          {trip.region} · {trip.duration} · {trip.availableSeats} сул суудал
        </span>
      </span>
      <span className={styles.tripTag}>{trip.isInternational ? "Гадаад" : "Дотоод"}</span>
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
          type="button"
        />
      ) : null}

      <div className={layout.drawerPanel}>
        {isDrawer ? (
          <button
            className={`${layout.close} js-close-booking-drawer`}
            aria-label="Хаах"
            type="button"
          >
            <X size={22} />
          </button>
        ) : null}

        <div className={layout.wrap}>
          <div
            className={variant === "card" ? `${styles.panel} ${styles.panelLight}` : styles.panel}
          >
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
                      placeholder={screen.selectedTrip?.title ?? "Аялал хайх"}
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
                  <p className={styles.selectedTrip}>{screen.selectedTrip.title}</p>
                ) : null}

                {screen.isDropdownOpen ? (
                  <div className={styles.results}>
                    {screen.filteredTripGroups.some((group) => group.trips.length > 0) ? (
                      screen.filteredTripGroups.map((group) =>
                        group.trips.length > 0 ? (
                          <div className={styles.group} key={group.category}>
                            <span className={styles.groupLabel}>{group.category}</span>
                            {group.trips.map((trip) => (
                              <TripResult
                                isSelected={trip.id === screen.selectedTrip?.id}
                                key={trip.id}
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
                <label className={styles.field}>
                  <span className={styles.label}>Огноо</span>
                  <span className={styles.search}>
                    <CalendarDays aria-hidden="true" size={24} />
                    <input
                      onChange={(event) => screen.setTravelDate(event.target.value)}
                      type="date"
                      value={screen.travelDate}
                    />
                    <span />
                  </span>
                </label>

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

              {screen.selectedTrip ? (
                <div className={styles.transport}>
                  <span className={styles.label}>Тээврийн төрөл</span>
                  <div className={styles.transportList}>
                    {screen.selectedTrip?.transportOptions.map((transport) => (
                      <button
                        aria-pressed={transport.id === screen.selectedTransport?.id}
                        className={styles.transportButton}
                        key={transport.id}
                        onClick={() => screen.setSelectedTransportId(transport.id)}
                        type="button"
                      >
                        <span className={styles.transportName}>{transport.label}</span>
                        <span className={styles.transportPrice}>
                          {formatTravelMoney(transport.priceMnt)} / хүн
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className={styles.total} aria-live="polite">
                <span className={styles.label}>Нийт үнэ</span>
                <strong>
                  {screen.quote ? formatTravelMoney(screen.quote.totalPriceMnt) : "—"}
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
                      ? `${screen.quote.selectedTrip.availableSeats} сул суудал. Үргэлжлүүлэх боломжтой.`
                      : "Сонгосон хүний тоонд хүрэлцэх суудал одоогоор алга."
                    : "Үнэ болон суудлын мэдээлэл аялал, огноо, хүний тоо сонгосны дараа гарна."}
                </span>
              </div>

              <div className={styles.actions}>
                <p className={styles.note}>Сонгосон мэдээлэл дараагийн алхамд хадгалагдана.</p>
                <button
                  className={styles.button}
                  disabled={!screen.canContinue || screen.isSubmitting}
                  type="submit"
                >
                  Үргэлжлүүлэх
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}

export const BlackTomatoBookingWidget = BlackTomatoBookingBudgetSection;
