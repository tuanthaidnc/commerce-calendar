export interface CalendarOptions {
  timeZone: string;
  workingWeekdays?: number[];
  recurringHolidays?: string[];
  closedDates?: string[];
}
export interface BusinessCalendar {
  dateAt(instant: Date | string): string;
  isBusinessDay(date: string): boolean;
  addBusinessDays(start: string, days: number): string;
}
export interface DayRange {min: number; max: number}
export interface DateRange {earliest: string; latest: string}
export function createCalendar(options: CalendarOptions): BusinessCalendar;
export function estimateDelivery(options: {
  calendar: BusinessCalendar;
  orderedAt: Date | string;
  processing?: DayRange | null;
  shipping?: DayRange | null;
}): {orderDate: string; processingEnd: DateRange; arrival: DateRange} | null;
