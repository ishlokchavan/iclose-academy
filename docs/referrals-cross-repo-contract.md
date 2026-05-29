# Referral attribution — cross-repo contract

`iclose.ae` (marketing) and `academy.iclose.ae` (this app) are **separate
domains, repos, and deployments** that share **one Supabase project**. Partner
and member referrals only work end-to-end if both sides honour the conventions
below.

## Shared primitives

| Thing | Value | Notes |
|---|---|---|
| Attribution cookie name | `iclose_ref` | code of whoever referred the visitor |
| Visitor cookie name | `iclose_vid` | for unique-visitor counts |
| Cookie domain (prod) | `.iclose.ae` | set via `NEXT_PUBLIC_COOKIE_DOMAIN`; **both repos must match** or the cookie won't cross subdomains |
| Cookie domain (local) | unset | host-only; `localhost:*` shares it automatically |
| Query params | `?ref=CODE` (canonical), `?partner=CODE` (alias) | |
| Path entry | `/ref/CODE` | |
| Code namespace | one, case-insensitive | member codes (uppercase alnum) + partner codes (`partners.code`, may contain dashes) share it; don't mint colliding codes |

Codes are stored/compared **uppercase-canonical**. Reads here are
case-insensitive, so a code written lowercase still counts — but write
uppercase when you can.

## Who owns what

### Marketing repo (`iclose.ae`) — the capture side
1. **`/ref/CODE`**: record a click into `referral_clicks` (`code` set;
   `lead_id`/`visitor_id` optional), set the `iclose_ref` cookie on
   `.iclose.ae`, then land the visitor.
2. **Accept** `?ref=` / `?partner=` on any page and set the same cookie.
3. **Lead form** → write `leads.referred_by_code` from the form value **or**
   the `iclose_ref` cookie. This is the primary signup-attribution path.
4. Don't create marketing referral codes that collide with `partners.code`.

### Academy repo (this app) — the read + account side
1. **Generates** partner links pointing at the marketing domain
   (`partnerReferralLink()` → `NEXT_PUBLIC_MARKETING_URL`).
2. **Reads/displays** referral data case-insensitively: member tree, partner
   tree, who-referred-whom (member or partner), clicks/signups.
3. **Attributes academy accounts**: the referral code is stashed in
   `user_metadata.referred_by_code` at signup and written to
   `leads.referred_by_code` when the lead is materialized at profile
   completion (leads require a phone, so the lead can't be created at signup).
4. Shares the `iclose_ref` / `iclose_vid` cookies on `.iclose.ae`.

## Data model

- **A "signup" = a `leads` row** with `referred_by_code = <code>`. Both repos
  write leads; the tree (`referral_tree_descendants`) is keyed on
  `referred_by_code` and works for member *and* partner codes.
- **Clicks** live in `referral_clicks.code` (no FK needed for partner codes).
- `referral_conversions` is **not** the source of truth for counts — signups
  derive from `leads`.

## Required env (production)

Both repos:

```
NEXT_PUBLIC_COOKIE_DOMAIN=.iclose.ae
```

Academy also:

```
NEXT_PUBLIC_MARKETING_URL=https://iclose.ae   # where partner links point
```

## Gotchas

- Host-only cookies do **not** cross `iclose.ae` ↔ `academy.iclose.ae`. The
  shared `domain=.iclose.ae` is mandatory in prod.
- `leads.phone` is `NOT NULL` + unique — you cannot create a lead without a
  phone, which is why academy attribution lands at profile completion, not at
  signup.
- Don't rely on exact-case code matches; always compare uppercased.
