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