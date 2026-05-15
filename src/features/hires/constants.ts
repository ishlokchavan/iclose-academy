export const HIRE_STATUSES = ["pending", "reviewing", "shortlisted", "hired", "rejected"] as const;
export type HireStatus = (typeof HIRE_STATUSES)[number];
