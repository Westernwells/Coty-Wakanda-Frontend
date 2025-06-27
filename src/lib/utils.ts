import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}


export function addMonthsToDate(date: Date, months: number) {
    const newDate = new Date(date); // Create a new Date instance to avoid mutating the original date
    newDate.setMonth(newDate.getMonth() + months);
    return newDate;
}

export function dateToLocalString(date: Date) {
    return date.toLocaleDateString('default', {month: 'short', year: '2-digit'})
}

type HouseObject = {
    id: number;
    name: { [locale: string]: string };
    active: boolean;
    created_at: string | null;
    updated_at: string | null;
    deleted_at: string | null;
  };
  type HouseField = HouseObject | string;
  
  // 2. Helper to extract the human-readable house name:
export function getHouseName(house: HouseField, locale = "en"): string {
    if (typeof house === "string") {
      // simple string case
      return house;
    }
  
    // object case: maybe you want the localized field…
    if (house.name && typeof house.name === "object") {
      // fallback if the locale isn't present:
      return house.name[locale] ?? Object.values(house.name)[0];
    }
  
    // if name were ever a string (defensive)
    return (house as any).name ?? "";
  }