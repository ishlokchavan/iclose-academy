/**
 * Centralised date/time formatters. Imported everywhere a timestamp is
 * rendered to a user. Always en-GB so the day-month-year order is stable
 * across browser locales.
 */

const dateOnly = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric",
});

const dateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit",
});

const dateTimeWithSeconds = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short", year: "numeric",
  hour: "2-digit", minute: "2-digit", second: "2-digit",
});

const shortDate = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short",
});

const shortDateTime = new Intl.DateTimeFormat("en-GB", {
  day: "numeric", month: "short",
  hour: "2-digit", minute: "2-digit",
});

function parse(iso: string | Date | null | undefined): Date | null {
  if (!iso) return null;
  const d = iso instanceof Date ? iso : new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

/** "26 May 2026" — kept for non-table contexts (drawer headers, captions). */
export function formatDate(iso: string | Date | null | undefined): string {
  const d = parse(iso);
  return d ? dateOnly.format(d) : "—";
}

/** "26 May 2026, 04:58" — default for every table cell that shows a timestamp. */
export function formatDateTime(iso: string | Date | null | undefined): string {
  const d = parse(iso);
  return d ? dateTime.format(d) : "—";
}

/** "26 May 2026, 04:58:23" — for audit / log rows where seconds matter. */
export function formatDateTimeSeconds(iso: string | Date | null | undefined): string {
  const d = parse(iso);
  return d ? dateTimeWithSeconds.format(d) : "—";
}

/** "26 May" — for tight mobile cells where the year is implied by context. */
export function formatShortDate(iso: string | Date | null | undefined): string {
  const d = parse(iso);
  return d ? shortDate.format(d) : "—";
}

/** "26 May, 04:58" — short mobile cells that still want a time. */
export function formatShortDateTime(iso: string | Date | null | undefined): string {
  const d = parse(iso);
  return d ? shortDateTime.format(d) : "—";
}

/**
 * "Updated" column helper: returns a dash when the row effectively hasn't
 * been edited (updated_at within 2s of created_at — covers default-now
 * timing on insert), otherwise the formatted updated_at. Cuts visual noise
 * for tables of mostly never-edited rows.
 */
export function formatUpdatedAt(
  createdAt: string | Date | null | undefined,
  updatedAt: string | Date | null | undefined,
): string {
  const c = parse(createdAt);
  const u = parse(updatedAt);
  if (!u) return "—";
  if (c && Math.abs(u.getTime() - c.getTime()) <= 2000) return "—";
  return dateTime.format(u);
}
