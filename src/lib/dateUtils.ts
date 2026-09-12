export function getColombiaNow() {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: "America/Bogota",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  };
  const formatter = new Intl.DateTimeFormat("en-US", options);
  const parts = formatter.formatToParts(now);
  const partMap: Record<string, string> = {};
  parts.forEach((p) => {
    partMap[p.type] = p.value;
  });

  const year = partMap.year || "2026";
  const month = partMap.month || "08";
  const day = partMap.day || "31";
  let hour = parseInt(partMap.hour || "8", 10);
  if (hour === 24) hour = 0;
  const minute = parseInt(partMap.minute || "0", 10);

  return {
    year: parseInt(year, 10),
    month: parseInt(month, 10),
    day: parseInt(day, 10),
    dayStr: `${year}-${month}-${day}`,
    hour,
    minute,
  };
}

export function getTodayDateStr(): string {
  return getColombiaNow().dayStr;
}

export interface DayRangeItem {
  dayStr: string;
  label: string;
  dateLabel: string;
  fullLabel: string;
  isToday: boolean;
  isStart: boolean;
}

export interface WeekRangeItem {
  weekKey: string;
  weekNumber: number;
  startStr: string;
  endStr: string;
  label: string;
  shortLabel: string;
  fullLabel: string;
  isCurrentWeek: boolean;
}

const MONTHS = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

const DAYS_WEEK = [
  "Domingo",
  "Lunes",
  "Martes",
  "Miércoles",
  "Jueves",
  "Viernes",
  "Sábado",
];

export function generateDaysRange(startStr = "2026-07-27"): DayRangeItem[] {
  const colNow = getColombiaNow();
  const endStr = colNow.dayStr;

  const list: DayRangeItem[] = [];
  const curr = new Date(startStr + "T00:00:00");
  const end = new Date(endStr + "T00:00:00");

  while (curr <= end) {
    const year = curr.getFullYear();
    const mNum = curr.getMonth() + 1;
    const mStr = String(mNum).padStart(2, "0");
    const dNum = curr.getDate();
    const dStr = String(dNum).padStart(2, "0");
    const dayStr = `${year}-${mStr}-${dStr}`;

    const monthLabel = MONTHS[curr.getMonth()];
    const dayOfWeek = DAYS_WEEK[curr.getDay()];
    const shortLabel = `${dNum} ${monthLabel}`;

    const isStart = dayStr === startStr;
    const isToday = dayStr === endStr;

    let dateLabel = shortLabel;
    let fullLabel = `${dayOfWeek} ${dNum} ${monthLabel} ${year}`;

    if (isToday) {
      dateLabel = `${shortLabel} (Hoy)`;
      fullLabel = `${dayOfWeek} ${dNum} ${monthLabel} ${year} (Presente)`;
    } else if (isStart) {
      dateLabel = `${shortLabel} (${shortLabel} 8:00 AM+)`;
      fullLabel = `${dayOfWeek} ${dNum} ${monthLabel} ${year} (Desde 8:00 AM)`;
    }

    list.push({
      dayStr,
      label: dateLabel,
      dateLabel,
      fullLabel,
      isToday,
      isStart,
    });

    curr.setDate(curr.getDate() + 1);
  }

  return list;
}

export function generateWeeksRange(startStr = "2026-07-27"): WeekRangeItem[] {
  const colNow = getColombiaNow();
  const todayStr = colNow.dayStr;
  const todayDate = new Date(todayStr + "T23:59:59");

  const weeks: WeekRangeItem[] = [];
  const currMonday = new Date(startStr + "T00:00:00");
  let weekNum = 1;

  while (currMonday <= todayDate) {
    const currSunday = new Date(currMonday);
    currSunday.setDate(currSunday.getDate() + 6);

    const startYear = currMonday.getFullYear();
    const startMonth = String(currMonday.getMonth() + 1).padStart(2, "0");
    const startDay = String(currMonday.getDate()).padStart(2, "0");
    const startFormatted = `${startYear}-${startMonth}-${startDay}`;

    const endYear = currSunday.getFullYear();
    const endMonth = String(currSunday.getMonth() + 1).padStart(2, "0");
    const endDay = String(currSunday.getDate()).padStart(2, "0");
    const endFormatted = `${endYear}-${endMonth}-${endDay}`;

    const sMonthLabel = MONTHS[currMonday.getMonth()];
    const eMonthLabel = MONTHS[currSunday.getMonth()];

    const startShort = `${currMonday.getDate()} ${sMonthLabel}`;
    const endShort = `${currSunday.getDate()} ${eMonthLabel}`;

    const isCurrentWeek =
      todayStr >= startFormatted && todayStr <= endFormatted;

    const label = `Semana ${weekNum} (${startShort} - ${endShort})`;
    const shortLabel = `Sem ${weekNum} (${startShort})`;
    const fullLabel = `Semana ${weekNum}: ${startShort} a ${endShort} ${endYear}${
      isCurrentWeek ? " (Esta semana)" : ""
    }`;

    weeks.push({
      weekKey: `week-${startFormatted}`,
      weekNumber: weekNum,
      startStr: startFormatted,
      endStr: endFormatted,
      label,
      shortLabel,
      fullLabel,
      isCurrentWeek,
    });

    // Move to next Monday
    currMonday.setDate(currMonday.getDate() + 7);
    weekNum += 1;
  }

  return weeks;
}

/**
 * Extracts a normalized YYYY-MM-DD string from any date/timestamp representation
 */
export function extractDateKey(
  dateInput: string | Date | null | undefined,
): string {
  if (!dateInput) return "";
  if (typeof dateInput === "string") {
    if (
      dateInput.length >= 10 &&
      dateInput.charAt(4) === "-" &&
      dateInput.charAt(7) === "-"
    ) {
      return dateInput.substring(0, 10);
    }
  }
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

/**
 * Checks if a given timestamp falls into a specific day (YYYY-MM-DD)
 */
export function isDateInDay(
  dateInput: string | Date | null | undefined,
  targetDay: string,
): boolean {
  if (!dateInput || !targetDay) return false;
  const key = extractDateKey(dateInput);
  return key === targetDay;
}

/**
 * Checks if a given timestamp falls between two dates (inclusive)
 */
export function isDateInRange(
  dateInput: string | Date | null | undefined,
  startDate: string,
  endDate: string,
): boolean {
  if (!dateInput) return false;
  const key = extractDateKey(dateInput);
  if (!key) return false;
  if (startDate && key < startDate) return false;
  if (endDate && key > endDate) return false;
  return true;
}

/**
 * Formats a date nicely into Spanish (e.g., "28 Jul 2026, 09:30 AM")
 */
export function formatDatePretty(
  dateInput: string | Date | null | undefined,
  includeTime = true,
): string {
  if (!dateInput) return "—";
  try {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return String(dateInput);

    const day = d.getDate();
    const month = MONTHS[d.getMonth()];
    const year = d.getFullYear();

    if (!includeTime) {
      return `${day} ${month} ${year}`;
    }

    const timeStr = d.toLocaleTimeString("es-CO", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZone: "America/Bogota",
    });

    return `${day} ${month} ${year}, ${timeStr}`;
  } catch {
    return String(dateInput);
  }
}
