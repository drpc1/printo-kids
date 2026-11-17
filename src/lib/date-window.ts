/** A day of the year, months counted from 1. */
export interface MonthDay {
  month: number;
  day: number;
}

/** The days something shows, both ends included; `to` before `from` means the window crosses New Year. */
export interface DateWindow {
  from: MonthDay;
  to: MonthDay;
}

/** Whether `today` (local month and day) is inside the window, ends included, also across New Year. */
export function inWindow(window: DateWindow, today: Date): boolean {
  const day = (today.getMonth() + 1) * 100 + today.getDate();
  const from = window.from.month * 100 + window.from.day;
  const to = window.to.month * 100 + window.to.day;
  return from <= to ? from <= day && day <= to : day >= from || day <= to;
}
