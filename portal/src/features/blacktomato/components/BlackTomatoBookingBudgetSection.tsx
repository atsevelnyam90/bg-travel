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

type BlackTomatoBookingBudgetSectionProps = {
  initialTripId?: string;
  mode?: "home" | "detail";
  onContinue?: (quote: BookingQuote) => void;
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
    <button className="bt-trip-result" onClick={onSelect} type="button">
      <span className="bt-trip-result__icon">
        {trip.isInternational ? (
          <Plane size={26} strokeWidth={2.2} />
        ) : (
          <MapPin size={27} strokeWidth={2.4} />
        )}
      </span>
      <span className="bt-trip-result__body">
        <span className="bt-trip-result__title">{trip.title}</span>
        <span className="bt-trip-result__meta">
          {trip.region} · {trip.duration} · {trip.availableSeats} сул суудал
        </span>
      </span>
      <span className="bt-trip-result__tag">{trip.isInternational ? "Гадаад" : "Дотоод"}</span>
      <span className="bt-trip-result__add" aria-hidden="true">
        {isSelected ? <Check size={24} /> : <Plus size={26} />}
      </span>
    </button>
  );
}

export function BlackTomatoBookingBudgetSection({
  initialTripId,
  mode = "home",
  onContinue,
}: BlackTomatoBookingBudgetSectionProps) {
  const screen = useBookingBudgetScreen({ initialTripId, mode, onContinue });
  const hasTransportChoices = (screen.selectedTrip?.transportOptions.length ?? 0) > 1;

  return (
    <section className="bt-booking section" id="journey-start">
      <style>{`
        .bt-booking {
          background: white;
          color: black;
          padding: 86px 24px 96px;
        }

        .bt-booking__wrap {
          display: grid;
          gap: 34px;
          grid-template-columns: minmax(300px, 0.78fr) minmax(390px, 1.22fr);
          margin: 0 auto;
          max-width: 1180px;
        }

        .bt-booking__eyebrow {
          color: rgb(116 121 128);
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 2.4px;
          margin: 0 0 14px;
          text-transform: uppercase;
        }

        .bt-booking__title {
          color: black;
          font-family: AlternateGotNo1D, sans-serif;
          font-size: 58px;
          font-weight: 400;
          letter-spacing: 1.8px;
          line-height: 0.98;
          margin: 0 0 20px;
          text-transform: uppercase;
        }

        .bt-booking__copy {
          color: rgb(82 87 92);
          font-size: 18px;
          line-height: 1.72;
          margin: 0 0 28px;
          max-width: 470px;
        }

        .bt-booking__quote {
          border: 1px solid rgb(225 226 228);
          border-radius: 8px;
          display: grid;
          gap: 14px;
          max-width: 470px;
          padding: 22px;
        }

        .bt-booking__quote-title {
          color: black;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.6px;
          margin: 0 0 4px;
          text-transform: uppercase;
        }

        .bt-booking__quote-empty {
          color: rgb(116 121 128);
          font-size: 15px;
          line-height: 1.55;
          margin: 0;
        }

        .bt-booking__quote-row {
          align-items: start;
          border-top: 1px solid rgb(236 237 238);
          display: grid;
          gap: 16px;
          grid-template-columns: 110px 1fr;
          padding-top: 14px;
        }

        .bt-booking__quote-label {
          color: rgb(116 121 128);
          font-size: 12px;
          line-height: 1.35;
        }

        .bt-booking__quote-value {
          color: black;
          font-size: 15px;
          font-weight: 700;
          line-height: 1.35;
          text-align: right;
        }

        .bt-booking__quote-value--good {
          color: rgb(0 141 31);
        }

        .bt-booking__quote-value--danger {
          color: rgb(183 28 28);
        }

        .bt-booking__quote-value--total {
          font-size: 24px;
        }

        .bt-booking__panel {
          background: rgb(18 18 18);
          border-radius: 8px;
          color: white;
          padding: 26px;
        }

        .bt-booking__form {
          display: grid;
          gap: 18px;
        }

        .bt-booking__travel {
          position: relative;
        }

        .bt-booking__search {
          align-items: center;
          border: 1px solid rgb(0 141 31);
          border-radius: 8px;
          display: grid;
          gap: 12px;
          grid-template-columns: auto 1fr auto;
          min-height: 68px;
          padding: 0 16px;
        }

        .bt-booking__search input {
          background: transparent;
          border: 0;
          color: white;
          font-size: 20px;
          font-weight: 700;
          min-width: 0;
          outline: none;
          width: 100%;
        }

        .bt-booking__search input::placeholder {
          color: rgb(156 163 175);
        }

        .bt-booking__clear {
          align-items: center;
          background: rgb(86 86 86);
          border: 0;
          border-radius: 999px;
          color: white;
          cursor: pointer;
          display: inline-flex;
          height: 36px;
          justify-content: center;
          width: 36px;
        }

        .bt-booking__results {
          background: rgb(18 18 18);
          border: 1px solid rgb(32 32 32);
          border-radius: 0 0 8px 8px;
          box-shadow: 0 22px 55px rgb(0 0 0 / 22%);
          display: grid;
          gap: 8px;
          left: 0;
          margin-top: 10px;
          max-height: 460px;
          overflow: auto;
          padding: 10px;
          position: absolute;
          right: 0;
          top: 100%;
          z-index: 6;
        }

        .bt-booking__group {
          display: grid;
          gap: 4px;
        }

        .bt-booking__group-label {
          color: rgb(143 149 157);
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 1.6px;
          padding: 10px 14px 4px;
          text-transform: uppercase;
        }

        .bt-booking__empty {
          color: rgb(203 203 203);
          font-size: 14px;
          margin: 0;
          padding: 18px 14px;
        }

        .bt-trip-result {
          align-items: center;
          background: transparent;
          border: 0;
          color: white;
          cursor: pointer;
          display: grid;
          gap: 18px;
          grid-template-columns: 46px 1fr auto 52px;
          min-height: 86px;
          padding: 12px 14px;
          text-align: left;
          width: 100%;
        }

        .bt-trip-result:hover,
        .bt-trip-result:focus-visible {
          background: rgb(18 48 14);
          outline: none;
        }

        .bt-trip-result__icon {
          color: rgb(48 185 53);
          display: inline-flex;
          justify-content: center;
        }

        .bt-trip-result__body {
          display: grid;
          gap: 3px;
          min-width: 0;
        }

        .bt-trip-result__title {
          color: white;
          font-size: 20px;
          font-weight: 800;
          line-height: 1.18;
        }

        .bt-trip-result__meta {
          color: rgb(217 217 217);
          font-size: 14px;
          line-height: 1.35;
        }

        .bt-trip-result__tag {
          background: rgb(37 37 37);
          border-radius: 7px;
          color: white;
          font-size: 13px;
          font-weight: 800;
          line-height: 1;
          padding: 10px 12px;
        }

        .bt-trip-result__add {
          align-items: center;
          background: rgb(37 37 37);
          border-radius: 7px;
          color: rgb(178 178 178);
          display: inline-flex;
          height: 46px;
          justify-content: center;
          width: 46px;
        }

        .bt-booking__controls {
          display: grid;
          gap: 14px;
          grid-template-columns: 1fr 190px;
        }

        .bt-booking__field {
          display: flex;
          flex-direction: column;
          gap: 8px;
          min-width: 0;
        }

        .bt-booking__label {
          color: rgb(204 204 204);
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 1.4px;
          line-height: 1.2;
          text-transform: uppercase;
        }

        .bt-booking__stepper {
          align-items: center;
          background: white;
          border-radius: 4px;
          display: grid;
          grid-template-columns: 48px 1fr 48px;
          min-height: 50px;
          overflow: hidden;
        }

        .bt-booking__stepper button {
          align-items: center;
          background: white;
          border: 0;
          color: black;
          cursor: pointer;
          display: inline-flex;
          height: 50px;
          justify-content: center;
        }

        .bt-booking__stepper button:disabled {
          cursor: not-allowed;
          opacity: 0.35;
        }

        .bt-booking__count {
          align-items: center;
          color: black;
          display: inline-flex;
          gap: 7px;
          justify-content: center;
          font-size: 17px;
          font-weight: 800;
          text-align: center;
        }

        .bt-booking__transport {
          display: grid;
          gap: 10px;
        }

        .bt-booking__transport-list {
          background: rgb(32 32 32);
          border-radius: 8px;
          display: grid;
          gap: 8px;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          padding: 6px;
        }

        .bt-booking__transport-button {
          background: transparent;
          border: 1px solid transparent;
          border-radius: 5px;
          color: rgb(216 216 216);
          cursor: pointer;
          display: grid;
          gap: 3px;
          min-height: 58px;
          padding: 9px 12px;
          text-align: left;
        }

        .bt-booking__transport-button[aria-pressed="true"] {
          background: white;
          border-color: white;
          color: black;
        }

        .bt-booking__transport-name {
          font-size: 14px;
          font-weight: 800;
        }

        .bt-booking__transport-price {
          font-size: 12px;
          font-weight: 700;
          opacity: 0.72;
        }

        .bt-booking__status {
          align-items: center;
          background: rgb(27 27 27);
          border-radius: 8px;
          color: rgb(214 214 214);
          display: flex;
          gap: 10px;
          min-height: 54px;
          padding: 14px 16px;
        }

        .bt-booking__status svg {
          color: rgb(0 180 38);
          flex: 0 0 auto;
        }

        .bt-booking__status--warning svg {
          color: rgb(255 179 64);
        }

        .bt-booking__actions {
          align-items: center;
          display: flex;
          gap: 18px;
          justify-content: space-between;
          padding-top: 8px;
        }

        .bt-booking__note {
          color: rgb(184 184 184);
          font-size: 13px;
          line-height: 1.45;
          margin: 0;
        }

        .bt-booking__button {
          background: rgb(0 141 31);
          border: 1px solid rgb(0 141 31);
          border-radius: 4px;
          color: white;
          cursor: pointer;
          flex: 0 0 auto;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1.8px;
          min-height: 52px;
          padding: 0 30px;
          text-transform: uppercase;
          transition: background-color 180ms ease, color 180ms ease, opacity 180ms ease;
        }

        .bt-booking__button:hover:not(:disabled) {
          background: white;
          color: black;
        }

        .bt-booking__button:disabled {
          cursor: not-allowed;
          opacity: 0.45;
        }

        @media screen and (max-width: 980px) {
          .bt-booking {
            padding: 64px 18px;
          }

          .bt-booking__wrap,
          .bt-booking__controls {
            grid-template-columns: 1fr;
          }

          .bt-booking__title {
            font-size: 44px;
          }
        }

        @media screen and (max-width: 680px) {
          .bt-booking__panel {
            padding: 18px;
          }

          .bt-trip-result {
            gap: 12px;
            grid-template-columns: 34px 1fr 42px;
          }

          .bt-trip-result__tag {
            display: none;
          }

          .bt-booking__transport-list {
            grid-template-columns: 1fr;
          }

          .bt-booking__actions {
            align-items: stretch;
            flex-direction: column;
          }
        }
      `}</style>

      <div className="bt-booking__wrap">
        <div>
          <p className="bt-booking__eyebrow">Booking</p>
          <h2 className="bt-booking__title">Plan your journey</h2>
          <p className="bt-booking__copy">
            Аяллаа сонгоод огноо, хүний тоогоо оруулахад боломжит суудал болон үнийн санал шууд
            харагдана.
          </p>

          <div className="bt-booking__quote" aria-live="polite">
            <p className="bt-booking__quote-title">Захиалгын хураангуй</p>

            {screen.quote ? (
              <>
                <div className="bt-booking__quote-row">
                  <span className="bt-booking__quote-label">Аялал</span>
                  <span className="bt-booking__quote-value">{screen.quote.selectedTrip.title}</span>
                </div>
                <div className="bt-booking__quote-row">
                  <span className="bt-booking__quote-label">Огноо</span>
                  <span className="bt-booking__quote-value">{screen.quote.travelDate}</span>
                </div>
                <div className="bt-booking__quote-row">
                  <span className="bt-booking__quote-label">Хүний тоо</span>
                  <span className="bt-booking__quote-value">{screen.quote.peopleCount}</span>
                </div>
                <div className="bt-booking__quote-row">
                  <span className="bt-booking__quote-label">Тээвэр</span>
                  <span className="bt-booking__quote-value">
                    {screen.quote.selectedTransport.label}
                  </span>
                </div>
                <div className="bt-booking__quote-row">
                  <span className="bt-booking__quote-label">Суудал</span>
                  <span
                    className={
                      screen.quote.hasAvailability
                        ? "bt-booking__quote-value bt-booking__quote-value--good"
                        : "bt-booking__quote-value bt-booking__quote-value--danger"
                    }
                  >
                    {screen.quote.hasAvailability
                      ? `${screen.quote.selectedTrip.availableSeats} сул суудал`
                      : "Суудал хүрэлцэхгүй"}
                  </span>
                </div>
                <div className="bt-booking__quote-row">
                  <span className="bt-booking__quote-label">Нийт үнэ</span>
                  <span className="bt-booking__quote-value bt-booking__quote-value--total">
                    {formatTravelMoney(screen.quote.totalPriceMnt)}
                  </span>
                </div>
              </>
            ) : (
              <p className="bt-booking__quote-empty">
                Аялал, огноо, хүний тоогоо сонгоод захиалгын саналаа харна уу.
              </p>
            )}
          </div>
        </div>

        <div className="bt-booking__panel">
          <form className="bt-booking__form" onSubmit={screen.continueBooking}>
            <div className="bt-booking__travel">
              <label className="bt-booking__field">
                <span className="bt-booking__label">Аялал сонгох</span>
                <span className="bt-booking__search">
                  <Search aria-hidden="true" color="rgb(0 180 38)" size={24} />
                  <input
                    aria-autocomplete="list"
                    aria-expanded={screen.isDropdownOpen}
                    onChange={(event) => {
                      screen.setQuery(event.target.value);
                      screen.setDropdownOpen(true);
                    }}
                    onFocus={() => screen.setDropdownOpen(true)}
                    placeholder={screen.selectedTrip?.title ?? "Аяллын нэр, улс, төрлөөр хайх"}
                    role="combobox"
                    type="search"
                    value={screen.query}
                  />
                  <button
                    aria-label="Clear trip search"
                    className="bt-booking__clear"
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

              {screen.isDropdownOpen ? (
                <div className="bt-booking__results">
                  {screen.filteredTripGroups.some((group) => group.trips.length > 0) ? (
                    screen.filteredTripGroups.map((group) =>
                      group.trips.length > 0 ? (
                        <div className="bt-booking__group" key={group.category}>
                          <span className="bt-booking__group-label">{group.category}</span>
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
                    <p className="bt-booking__empty">Илэрц олдсонгүй.</p>
                  )}
                </div>
              ) : null}
            </div>

            <div className="bt-booking__controls">
              <label className="bt-booking__field">
                <span className="bt-booking__label">Огноо</span>
                <span className="bt-booking__search">
                  <CalendarDays aria-hidden="true" color="rgb(0 180 38)" size={24} />
                  <input
                    onChange={(event) => screen.setTravelDate(event.target.value)}
                    type="date"
                    value={screen.travelDate}
                  />
                  <span />
                </span>
              </label>

              <div className="bt-booking__field">
                <span className="bt-booking__label">Хүний тоо</span>
                <div className="bt-booking__stepper">
                  <button
                    aria-label="Decrease travellers"
                    disabled={screen.peopleCount <= 1}
                    onClick={screen.decrementPeople}
                    type="button"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="bt-booking__count">
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

            {hasTransportChoices ? (
              <div className="bt-booking__transport">
                <span className="bt-booking__label">Тээврийн төрөл</span>
                <div className="bt-booking__transport-list">
                  {screen.selectedTrip?.transportOptions.map((transport) => (
                    <button
                      aria-pressed={transport.id === screen.selectedTransport?.id}
                      className="bt-booking__transport-button"
                      key={transport.id}
                      onClick={() => screen.setSelectedTransportId(transport.id)}
                      type="button"
                    >
                      <span className="bt-booking__transport-name">{transport.label}</span>
                      <span className="bt-booking__transport-price">
                        {formatTravelMoney(transport.priceMnt)} / хүн
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ) : null}

            <div
              className={
                screen.quote && !screen.quote.hasAvailability
                  ? "bt-booking__status bt-booking__status--warning"
                  : "bt-booking__status"
              }
            >
              <CircleAlert aria-hidden="true" size={20} />
              <span>
                {screen.quote
                  ? screen.quote.hasAvailability
                    ? "Суудал баталгаатай байна. Үргэлжлүүлэх боломжтой."
                    : "Сонгосон хүний тоонд хүрэлцэх суудал одоогоор алга."
                  : "Үнэ болон суудлын мэдээлэл аялал, огноо, хүний тоо сонгосны дараа гарна."}
              </span>
            </div>

            <div className="bt-booking__actions">
              <p className="bt-booking__note">Сонгосон мэдээлэл дараагийн алхамд хадгалагдана.</p>
              <button
                className="bt-booking__button"
                disabled={!screen.canContinue || screen.isSubmitting}
                type="submit"
              >
                Үргэлжлүүлэх
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export const BlackTomatoBookingWidget = BlackTomatoBookingBudgetSection;
