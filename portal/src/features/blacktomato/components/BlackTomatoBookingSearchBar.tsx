"use client";

import { ArrowRight, CalendarDays, ChevronDown, Plane, Route, Wallet, X } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { type BookingSearchFacet, useBookingSearchScreen } from "../hooks/useBookingSearchScreen";
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
  searchPlaceholder: string;
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
  searchPlaceholder,
  selected,
}: SearchableFacetProps) {
  const t = useTranslations("publicBooking");
  const isOpen = activeFacet === facet;

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
          <CommandInput placeholder={searchPlaceholder} />
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

type BlackTomatoBookingSearchBarProps = {
  screen: BookingBudgetScreen;
};

export function BlackTomatoBookingSearchBar({ screen }: BlackTomatoBookingSearchBarProps) {
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

  return (
    <form
      aria-label={t("sectionLabel")}
      className={styles.searchBar}
      onSubmit={(event) => event.preventDefault()}
    >
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

      <SearchableFacet
        activeFacet={search.activeFacet}
        className={styles.dateField}
        facet="date"
        icon={<CalendarDays aria-hidden="true" size={19} />}
        label={t("date")}
        meta={dateSummary}
        onActiveFacetChange={search.setActiveFacet}
        onSelect={search.selectDate}
        options={search.dateOptions}
        placeholder={dateSummary}
        searchPlaceholder={t("searchDeparture")}
        selected={search.selectedDate}
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
          window.dispatchEvent(new Event(OPEN_BOOKING_DRAWER_EVENT));
        }}
        type="button"
      >
        <span>{t("book")}</span>
        <ArrowRight aria-hidden="true" size={19} />
      </button>
    </form>
  );
}
