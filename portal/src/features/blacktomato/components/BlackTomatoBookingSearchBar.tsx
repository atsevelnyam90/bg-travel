"use client";

import { ArrowRight, CalendarDays, ChevronDown, Plane, Route, Wallet, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { ReactNode } from "react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { BookingBudgetScreen } from "../hooks/useBookingBudgetScreen";
import {
  type BookingDateSearchOption,
  type BookingSearchFacet,
  useBookingSearchScreen,
} from "../hooks/useBookingSearchScreen";
import { OPEN_BOOKING_DRAWER_EVENT } from "./BlackTomatoInteractions";
import styles from "./journeyOptionTwo.module.css";

type SearchOption = {
  label: string;
  value: string;
};

type SearchableFacetProps = {
  activeFacet: BookingSearchFacet | null;
  className: string;
  facet: BookingSearchFacet;
  icon: ReactNode;
  label: string;
  meta: string;
  onActiveFacetChange: (facet: BookingSearchFacet | null) => void;
  onSelect: (value: string | null) => void;
  options: SearchOption[];
  placeholder: string;
  searchable?: boolean;
  searchPlaceholder?: string;
  selected: SearchOption | null;
};

function SearchableFacet({
  activeFacet,
  className,
  facet,
  icon,
  label,
  meta,
  onActiveFacetChange,
  onSelect,
  options,
  placeholder,
  searchable = true,
  searchPlaceholder,
  selected,
}: SearchableFacetProps) {
  const t = useTranslations("publicBooking");
  const isOpen = activeFacet === facet;
  const showSearch = searchable && options.length > 2;

  return (
    <Popover onOpenChange={(open) => onActiveFacetChange(open ? facet : null)} open={isOpen}>
      <PopoverTrigger asChild>
        <button
          aria-expanded={isOpen}
          aria-label={label}
          className={`${styles.searchField} ${className}`}
          data-selected={selected ? "" : undefined}
          disabled={options.length === 0}
          role="combobox"
          type="button"
        >
          <span className={styles.searchIcon}>{icon}</span>
          <span className={styles.searchFieldBody}>
            <span className={styles.searchFieldLabel}>
              <small>{label}</small>
              {selected ? <span className={styles.searchFieldMeta}>{meta}</span> : null}
            </span>
            <span className={styles.searchFieldValue}>
              <span data-placeholder={selected ? undefined : ""}>
                {selected?.label ?? placeholder}
              </span>
              <ChevronDown aria-hidden="true" size={15} />
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent align="start" className={styles.searchPopover} sideOffset={8}>
        <Command>
          {showSearch ? <CommandInput placeholder={searchPlaceholder} /> : null}
          <CommandList>
            <CommandEmpty>{t("noResults")}</CommandEmpty>
            <CommandGroup>
              {selected ? (
                <CommandItem
                  className={styles.searchClearOption}
                  onSelect={() => onSelect(null)}
                  value={`${t("clearSelection")} ${facet}`}
                >
                  <X aria-hidden="true" size={15} />
                  {t("clearSelection")}
                </CommandItem>
              ) : null}
              {options.map((option) => (
                <CommandItem
                  className={styles.searchOption}
                  data-checked={option.value === selected?.value}
                  key={option.value}
                  onSelect={() => onSelect(option.value)}
                  value={`${option.label} ${option.value}`}
                >
                  <span>{option.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type DateFacetProps = Omit<
  SearchableFacetProps,
  "facet" | "options" | "searchable" | "searchPlaceholder" | "selected"
> & {
  activeMonth: string | null;
  monthKeys: string[];
  onMonthChange: (month: string) => void;
  options: BookingDateSearchOption[];
  selected: BookingDateSearchOption | null;
  showMonthSwitcher: boolean;
};

function DateFacet({
  activeFacet,
  activeMonth,
  className,
  icon,
  label,
  meta,
  monthKeys,
  onActiveFacetChange,
  onMonthChange,
  onSelect,
  options,
  placeholder,
  selected,
  showMonthSwitcher,
}: DateFacetProps) {
  const locale = useLocale();
  const t = useTranslations("publicBooking");
  const isOpen = activeFacet === "date";
  const monthFormatter = new Intl.DateTimeFormat(locale, {
    month: "long",
    timeZone: "UTC",
    year: "numeric",
  });
  const shortMonthFormatter = new Intl.DateTimeFormat(locale, {
    month: "short",
    timeZone: "UTC",
    year: "numeric",
  });
  const groupedOptions = new Map<string, BookingDateSearchOption[]>();

  for (const option of options) {
    const monthKey = option.departureDate.slice(0, 7);
    const group = groupedOptions.get(monthKey) ?? [];
    group.push(option);
    groupedOptions.set(monthKey, group);
  }

  const formatMonth = (monthKey: string, short = false) =>
    (short ? shortMonthFormatter : monthFormatter).format(new Date(`${monthKey}-01T00:00:00.000Z`));

  return (
    <Popover onOpenChange={(open) => onActiveFacetChange(open ? "date" : null)} open={isOpen}>
      <PopoverTrigger asChild>
        <button
          aria-expanded={isOpen}
          aria-label={label}
          className={`${styles.searchField} ${className}`}
          data-selected={selected ? "" : undefined}
          disabled={options.length === 0}
          role="combobox"
          type="button"
        >
          <span className={styles.searchIcon}>{icon}</span>
          <span className={styles.searchFieldBody}>
            <span className={styles.searchFieldLabel}>
              <small>{label}</small>
              {selected ? <span className={styles.searchFieldMeta}>{meta}</span> : null}
            </span>
            <span className={styles.searchFieldValue}>
              <span data-placeholder={selected ? undefined : ""}>
                {selected?.label ?? placeholder}
              </span>
              <ChevronDown aria-hidden="true" size={15} />
            </span>
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className={`${styles.searchPopover} ${styles.datePopover}`}
        sideOffset={8}
      >
        <Command>
          {showMonthSwitcher ? (
            <div className={styles.dateMonthSwitcher}>
              {monthKeys.map((monthKey) => (
                <button
                  className={styles.dateMonthButton}
                  data-active={monthKey === activeMonth ? "" : undefined}
                  key={monthKey}
                  onClick={() => onMonthChange(monthKey)}
                  type="button"
                >
                  {formatMonth(monthKey, true)}
                </button>
              ))}
            </div>
          ) : null}
          <CommandList>
            <CommandEmpty>{t("noResults")}</CommandEmpty>
            {selected ? (
              <CommandGroup>
                <CommandItem
                  className={styles.searchClearOption}
                  onSelect={() => onSelect(null)}
                  value={`${t("clearSelection")} date`}
                >
                  <X aria-hidden="true" size={15} />
                  {t("clearSelection")}
                </CommandItem>
              </CommandGroup>
            ) : null}
            {[...groupedOptions.entries()].map(([monthKey, groupOptions]) => (
              <CommandGroup heading={formatMonth(monthKey)} key={monthKey}>
                {groupOptions.map((option) => {
                  const isSelected = option.value === selected?.value;
                  return (
                    <CommandItem
                      className={`${styles.searchOption} ${styles.dateOption}`}
                      data-checked={isSelected}
                      key={option.value}
                      onSelect={() => onSelect(option.value)}
                      value={`${option.label} ${option.value}`}
                    >
                      <span className={styles.dateOptionCopy}>
                        <strong>{option.label}</strong>
                        <small>
                          {t("dateOptionMeta", {
                            days: option.durationDays,
                            seats: option.remainingSeats,
                          })}
                        </small>
                      </span>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

type BlackTomatoBookingSearchBarProps = {
  mobilePanelOpen?: boolean;
  onMobilePanelClose?: () => void;
  screen: BookingBudgetScreen;
};

export function BlackTomatoBookingSearchBar({
  mobilePanelOpen = false,
  onMobilePanelClose,
  screen,
}: BlackTomatoBookingSearchBarProps) {
  const t = useTranslations("publicBooking");
  const search = useBookingSearchScreen(screen);
  const priceRange =
    search.priceOptions.length === 0
      ? t("selectPrice")
      : search.priceOptions.length === 1
        ? search.priceOptions[0].label
        : `${search.priceOptions[0].label} – ${search.priceOptions.at(-1)?.label}`;
  const tripSummary = t("searchSummary.trips", { count: search.tripOptions.length });
  const dateSummary = t("searchSummary.dates", { count: search.dateOptions.length });
  const transportSummary = t("searchSummary.transports", {
    count: search.transportOptions.length,
  });
  const closeMobilePanel = () => {
    search.setActiveFacet(null);
    onMobilePanelClose?.();
  };

  return (
    <>
      {mobilePanelOpen ? (
        <button
          aria-label={t("close")}
          className={styles.mobileSearchBackdrop}
          onClick={closeMobilePanel}
          type="button"
        />
      ) : null}
      <form
        aria-label={t("sectionLabel")}
        className={styles.searchBar}
        data-mobile-open={mobilePanelOpen ? "" : undefined}
        onSubmit={(event) => event.preventDefault()}
      >
        <div className={styles.mobileSearchHeader}>
          <strong>{t("filters")}</strong>
          <button aria-label={t("close")} onClick={closeMobilePanel} type="button">
            <X aria-hidden="true" size={18} />
          </button>
        </div>
        <SearchableFacet
          activeFacet={search.activeFacet}
          className={styles.tripField}
          facet="trip"
          icon={<Plane aria-hidden="true" size={19} />}
          label={t("selectTrip")}
          meta={tripSummary}
          onActiveFacetChange={search.setActiveFacet}
          onSelect={search.selectTrip}
          options={search.tripOptions}
          placeholder={tripSummary}
          searchPlaceholder={t("searchTrip")}
          selected={
            search.selectedTrip
              ? { label: search.selectedTrip.name, value: search.selectedTrip.publicId }
              : null
          }
        />

        <DateFacet
          activeFacet={search.activeFacet}
          activeMonth={search.activeDateMonth}
          className={styles.dateField}
          icon={<CalendarDays aria-hidden="true" size={19} />}
          label={t("date")}
          meta={dateSummary}
          monthKeys={search.dateMonths}
          onActiveFacetChange={search.setActiveFacet}
          onMonthChange={search.selectDateMonth}
          onSelect={search.selectDate}
          options={search.visibleDateOptions}
          placeholder={dateSummary}
          selected={search.selectedDate}
          showMonthSwitcher={search.dateOptions.length > 6}
        />

        <SearchableFacet
          activeFacet={search.activeFacet}
          className={styles.transportField}
          facet="transport"
          icon={<Route aria-hidden="true" size={19} />}
          label={t("transportType")}
          meta={transportSummary}
          onActiveFacetChange={search.setActiveFacet}
          onSelect={search.selectTransport}
          options={search.transportOptions}
          placeholder={transportSummary}
          searchPlaceholder={t("searchTransport")}
          selected={search.selectedTransport}
        />

        <SearchableFacet
          activeFacet={search.activeFacet}
          className={styles.priceField}
          facet="price"
          icon={<Wallet aria-hidden="true" size={19} />}
          label={t("price")}
          meta={priceRange}
          onActiveFacetChange={search.setActiveFacet}
          onSelect={search.selectPrice}
          options={search.priceOptions}
          placeholder={priceRange}
          searchPlaceholder={t("searchPrice")}
          selected={search.selectedPrice}
        />

        <button
          className={styles.searchSubmit}
          disabled={!search.canBook}
          onClick={() => {
            search.bookSelection();
            closeMobilePanel();
            window.dispatchEvent(new Event(OPEN_BOOKING_DRAWER_EVENT));
          }}
          type="button"
        >
          <span>{t("book")}</span>
          <ArrowRight aria-hidden="true" size={19} />
        </button>
      </form>
    </>
  );
}
