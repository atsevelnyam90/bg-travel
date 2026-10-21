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
          disabled={options.length === 0}
          role="combobox"
          type="button"
        >
          <span className={styles.searchIcon}>{icon}</span>
          <span className={styles.searchFieldBody}>
            <small>{label}</small>
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
        onActiveFacetChange={search.setActiveFacet}
        onSelect={search.selectTrip}
        options={search.tripOptions}
        placeholder={t("searchTrip")}
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
        onActiveFacetChange={search.setActiveFacet}
        onSelect={search.selectDate}
        options={search.dateOptions}
        placeholder={t("selectDeparture")}
        searchPlaceholder={t("searchDeparture")}
        selected={search.selectedDate}
      />

      <SearchableFacet
        activeFacet={search.activeFacet}
        className={styles.transportField}
        facet="transport"
        icon={<Route aria-hidden="true" size={19} />}
        label={t("transportType")}
        onActiveFacetChange={search.setActiveFacet}
        onSelect={search.selectTransport}
        options={search.transportOptions}
        placeholder={t("selectTransport")}
        searchPlaceholder={t("searchTransport")}
        selected={search.selectedTransport}
      />

      <SearchableFacet
        activeFacet={search.activeFacet}
        className={styles.priceField}
        facet="price"
        icon={<Wallet aria-hidden="true" size={19} />}
        label={t("price")}
        onActiveFacetChange={search.setActiveFacet}
        onSelect={search.selectPrice}
        options={search.priceOptions}
        placeholder={t("selectPrice")}
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
