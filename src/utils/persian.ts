/**
 * Persian language and formatting helper functions
 */

const PERSIAN_DIGITS = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
const ENGLISH_DIGITS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

export function toPersianDigits(value: string | number | undefined | null): string {
  if (value === undefined || value === null) return '';
  const str = String(value);
  return str.replace(/\d/g, (digit) => PERSIAN_DIGITS[parseInt(digit, 10)]);
}

export function toEnglishDigits(value: string): string {
  let str = value;
  for (let i = 0; i < 10; i++) {
    str = str.replace(new RegExp(PERSIAN_DIGITS[i], 'g'), ENGLISH_DIGITS[i]);
  }
  return str;
}

export function formatNumber(num: number | string): string {
  if (num === null || num === undefined || isNaN(Number(num))) return '۰';
  const parts = Number(num).toLocaleString('en-US').split('.');
  const intPart = toPersianDigits(parts[0]);
  return parts.length > 1 ? `${intPart}.${toPersianDigits(parts[1])}` : intPart;
}

export function formatToman(amount: number): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(amount);
  const formatted = formatNumber(absVal);
  return isNegative ? `(${formatted}-) تومان` : `${formatted} تومان`;
}

export function getTodayJalali(): string {
  // Approximate Jalali calculation for sample dates, e.g. 1405/05/13
  const now = new Date();
  const year = 1405;
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${toPersianDigits(year)}/${toPersianDigits(month)}/${toPersianDigits(day)}`;
}

export function getJalaliDateOffset(daysOffset: number): string {
  const now = new Date();
  now.setDate(now.getDate() + daysOffset);
  const month = String((now.getMonth() % 12) + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `۱۴۰۵/${toPersianDigits(month)}/${toPersianDigits(day)}`;
}
