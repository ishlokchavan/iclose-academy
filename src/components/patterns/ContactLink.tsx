"use client";

import { cn } from "@/lib/utils/cn";

/**
 * Renders an email address as a mailto: link. Use everywhere we display a
 * contact email so admin/manager can one-tap to send. Pass `stopPropagation`
 * when the surrounding row/card is itself clickable (table rows that open a
 * drawer) so the mail client opens without firing the row click.
 */
export function EmailLink({
  email,
  className,
  children,
  stopPropagation,
}: {
  email: string | null | undefined;
  className?: string;
  children?: React.ReactNode;
  stopPropagation?: boolean;
}) {
  if (!email) return <span className={className}>—</span>;
  return (
    <a
      href={`mailto:${email}`}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
      className={cn("hover:text-accent hover:underline", className)}
    >
      {children ?? email}
    </a>
  );
}

/** Renders a phone number as a tel: link. Same conventions as EmailLink. */
export function TelLink({
  phone,
  className,
  children,
  stopPropagation,
}: {
  phone: string | null | undefined;
  className?: string;
  children?: React.ReactNode;
  stopPropagation?: boolean;
}) {
  if (!phone) return <span className={className}>—</span>;
  return (
    <a
      href={`tel:${phone}`}
      onClick={stopPropagation ? (e) => e.stopPropagation() : undefined}
      className={cn("hover:text-accent hover:underline", className)}
    >
      {children ?? phone}
    </a>
  );
}
