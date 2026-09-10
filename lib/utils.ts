import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const onesEn = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tensEn = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function convertLessThanThousandEn(n: number): string {
  if (n === 0) return '';
  if (n < 20) return onesEn[n] + ' ';
  const ten = Math.floor(n / 10);
  const one = n % 10;
  if (one === 0) return tensEn[ten] + ' ';
  return tensEn[ten] + ' ' + onesEn[one] + ' ';
}

export function numberToWordsEnglish(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n) || n === 0) return 'Zero Rupees Only';
  if (n < 0) return 'Minus ' + numberToWordsEnglish(-n);

  let remaining = Math.floor(n);
  let words = '';

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  const hundred = remaining;

  if (crore > 0) {
    words += convertLessThanThousandEn(crore) + 'Crore ';
  }
  if (lakh > 0) {
    words += convertLessThanThousandEn(lakh) + 'Lakh ';
  }
  if (thousand > 0) {
    words += convertLessThanThousandEn(thousand) + 'Thousand ';
  }
  if (hundred > 0) {
    const h = Math.floor(hundred / 100);
    const rest = hundred % 100;
    if (h > 0) {
      words += onesEn[h] + ' Hundred ';
    }
    if (rest > 0) {
      if (words !== '') words += 'and ';
      words += convertLessThanThousandEn(rest);
    }
  }

  return words.trim() + ' Rupees Only';
}

const onesMr = ['', 'एक', 'दोन', 'तीन', 'चार', 'पाच', 'सहा', 'सात', 'आठ', 'नऊ', 'दहा', 'अकरा', 'बारा', 'तेरा', 'चौदा', 'पंधरा', 'सोळा', 'सतरा', 'अठरा', 'एकोणीस', 'वीस', 'एकवीस', 'बावीस', 'तेवीस', 'चोवीस', 'पंचवीस', 'सव्वीस', 'सत्तावीस', 'अठ्ठावीस', 'एकोणतीस', 'तीस', 'एकतीस', 'बत्तीस', 'तेहेतीस', 'चौतीस', 'पस्तीस', 'छत्तीस', 'सदतीस', 'अडतीस', 'एकोणचाळीस', 'चाळीस', 'एक्केचाळीस', 'बेचाळीस', 'त्रेचाळीस', 'चव्वेचाळीस', 'पंचेचाळीस', 'शेहेचाळीस', 'सत्तेचाळीस', 'अठ्ठेचाळीस', 'एकोणपन्नास', 'पन्नास', 'एक्कावन्न', 'बावन्न', 'त्रेपन्न', 'चौपन्न', 'पंचावन्न', 'छप्पन्न', 'सत्तावन्न', 'अठ्ठावन्न', 'एकोणसाठ', 'साठ', 'एकसष्ठ', 'बासष्ठ', 'त्रेसष्ठ', 'चौसष्ठ', 'पासष्ठ', 'सहासष्ठ', 'सदुसष्ठ', 'अडुसष्ठ', 'एकोणसत्तर', 'सत्तर', 'एकाहत्तर', 'बाहत्तर', 'त्र्याहत्तर', 'चौऱ्याहत्तर', 'पंच्याहत्तर', 'शहात्तर', 'सत्त्याहत्तर', 'अठ्ठ्याहत्तर', 'एकोणऐंशी', 'ऐंशी', 'एक्याऐंशी', 'ब्याऐंशी', 'त्र्याऐंशी', 'चौऱ्याऐंशी', 'पंच्याऐंशी', 'शहाऐंशी', 'सत्त्याऐंशी', 'अठ्ठ्याऐंशी', 'एकोणनव्वद', 'नव्वद', 'एक्याण्णव', 'ब्याण्णव', 'त्र्याण्णव', 'चौऱ्याण्णव', 'पंच्याण्णव', 'शहाण्णव', 'सत्त्याण्णव', 'अठ्ठ्याण्णव', 'नव्व्याण्णव'];

export function numberToWordsMarathi(num: number | string): string {
  const n = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(n) || n === 0) return 'शून्य रुपये फक्त';
  if (n < 0) return 'ऋण ' + numberToWordsMarathi(-n);

  let remaining = Math.floor(n);
  let words = '';

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  const hundred = Math.floor(remaining / 100);
  const rest = remaining % 100;

  if (crore > 0) {
    words += (onesMr[crore] || crore.toString()) + ' कोटी ';
  }
  if (lakh > 0) {
    words += (onesMr[lakh] || lakh.toString()) + ' लाख ';
  }
  if (thousand > 0) {
    words += (onesMr[thousand] || thousand.toString()) + ' हजार ';
  }
  if (hundred > 0) {
    words += (onesMr[hundred] || hundred.toString()) + ' शे ';
  }
  if (rest > 0) {
    words += (onesMr[rest] || rest.toString()) + ' ';
  }

  return words.trim() + ' रुपये फक्त';
}

/**
 * Parses multiple date formats safely (YYYY-MM-DD, DD-MM-YYYY, DD/MM/YYYY, ISO)
 */
export function parseDueDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  const clean = dateStr.trim();

  // Format: DD-MM-YYYY or DD/MM/YYYY
  const dmyMatch = clean.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (dmyMatch) {
    const day = parseInt(dmyMatch[1], 10);
    const month = parseInt(dmyMatch[2], 10) - 1;
    const year = parseInt(dmyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Format: YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = clean.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})$/);
  if (ymdMatch) {
    const year = parseInt(ymdMatch[1], 10);
    const month = parseInt(ymdMatch[2], 10) - 1;
    const day = parseInt(ymdMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  const d = new Date(clean);
  return isNaN(d.getTime()) ? null : d;
}

export type DueStatusType = 'TOMORROW' | 'TODAY' | 'OVERDUE' | 'UPCOMING' | 'FUTURE';

export interface DueStatusResult {
  diffDays: number;
  type: DueStatusType;
  label: string;
  badgeClass: string;
  isUrgent: boolean; // 1-day before, today, or overdue
}

/**
 * Returns difference in calendar days and reminder alert categorization
 */
export function getDueStatus(dueDate: Date, referenceDate: Date = new Date()): DueStatusResult {
  const d1 = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate());
  const d2 = new Date(referenceDate.getFullYear(), referenceDate.getMonth(), referenceDate.getDate());

  const diffTime = d1.getTime() - d2.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 1) {
    return {
      diffDays,
      type: 'TOMORROW',
      label: 'Due Tomorrow (1-Day Reminder)',
      badgeClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800',
      isUrgent: true
    };
  } else if (diffDays === 0) {
    return {
      diffDays,
      type: 'TODAY',
      label: 'Due Today',
      badgeClass: 'bg-red-100 text-red-900 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800',
      isUrgent: true
    };
  } else if (diffDays < 0) {
    return {
      diffDays,
      type: 'OVERDUE',
      label: `Overdue (${Math.abs(diffDays)} ${Math.abs(diffDays) === 1 ? 'day' : 'days'} ago)`,
      badgeClass: 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800',
      isUrgent: true
    };
  } else if (diffDays <= 7) {
    return {
      diffDays,
      type: 'UPCOMING',
      label: `Due in ${diffDays} days`,
      badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800',
      isUrgent: false
    };
  } else {
    return {
      diffDays,
      type: 'FUTURE',
      label: `Scheduled (${d1.toLocaleDateString('en-IN')})`,
      badgeClass: 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
      isUrgent: false
    };
  }
}


