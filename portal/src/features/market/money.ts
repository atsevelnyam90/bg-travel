// Мөнгийг ЦЭЛ тоогоор (мөнгө) хадгалдаг — Float ашиглавал 0.1+0.2 маягийн
// алдаа мөнгөнд хүрнэ. Харуулахдаа л 100-д хуваана.
const formatter = new Intl.NumberFormat("mn-MN", { maximumFractionDigits: 0 });

export const formatMoney = (minor: number, currency = "MNT"): string =>
  `${formatter.format(Math.round(minor / 100))}${currency === "MNT" ? "₮" : ` ${currency}`}`;

export const toMinor = (major: number): number => Math.round(major * 100);
export const toMajor = (minor: number): number => minor / 100;
