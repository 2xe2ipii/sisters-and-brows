# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `npm run dev` — start Next.js dev server (http://localhost:3000)
- `npm run build` — production build
- `npm run start` — run production build
- `npm run lint` — eslint (flat config, `eslint.config.mjs`)

There is no test framework configured in this repo.

## Required environment (`.env.local`)

```
GOOGLE_SERVICE_ACCOUNT_EMAIL
GOOGLE_PRIVATE_KEY        # literal \n sequences are unescaped at runtime
GOOGLE_SHEET_ID
```

The service account must have Editor access to the sheet. Missing env throws at first `getDoc()` call.

## Architecture

This is a Next.js 16 App Router project (React 19, TS) using **Google Sheets as the database**. There is no SQL/ORM. All persistence and configuration lives in one spreadsheet.

### Data layer (`lib/googleSheets.ts`)
- One singleton `GoogleSpreadsheet` instance (`docInstance`) — `getDoc()` reuses it to avoid re-auth on every request.
- `getCachedServices` and `getCachedAppConfig` wrap reads of the `Services`, `Time_Slots`, and `Locations` sheets in `unstable_cache` (TTL: 30s dev, 3600s prod). Each has `DEFAULT_*` fallbacks hardcoded — if the sheet is missing/empty/errors, the defaults are returned silently. **The defaults are the source of truth when the sheet sheet doesn't override them**, so changes to branches/time slots/services must be made in `googleSheets.ts` defaults AND/OR in the sheet.
- `getSheetRows()` reads `Raw_Intake` (or first sheet as fallback) live — no cache.

### Booking domain (`lib/booking/`)
- `availability.ts` — capacity logic. Reads a **fortnight-partitioned sheet** named like `"Feb 1 - 15, 2026"` (derived from the requested date via `getFortnightSheetName`), NOT `Raw_Intake`. This is a deliberate trade-off documented in code as "The Blind Spot": rows still in `Raw_Intake` are not counted, but it saves API quota. Cached via `unstable_cache` keyed `sheet-data-cache-v1`, 60s revalidate. Row objects come back as plain JSON via `row.toObject()` because `GoogleSpreadsheetRow` has circular refs that break the cache.
- `availability.ts` filters out visual "date header" rows (rows where `BRANCH` is blank and `CLIENT #` looks like `Feb 14` / `Feb 14, 2026`).
- `config.ts` — resolves dynamic `BRANCH_MAP` (name → code) and `BRANCH_LIMITS` (code → per-slot capacity) from cached app config.
- `utils.ts` — strict normalizers used throughout for matching: `normalizeDate` → `YYYY-MM-DD`, `normalizePhone` → digits-only (`09171234567`), `getStrictTime` → lowercased start time (`10:00 am`), `findColumnKey` for case/whitespace-tolerant header lookup. **Always use these when comparing sheet values** — do not raw-string compare.

### Server actions (`app/actions.ts`)
All mutations are Next.js Server Actions: `fetchAppConfig`, `fetchServices`, `getSlotAvailability`, `lookupBooking` (by `CLIENT #` ref code), `submitBooking` (validated with Zod).

`submitBooking` is **idempotent**: it calls `checkDuplicate` (matches on date + (name OR phone)) and updates the existing row instead of inserting a duplicate. The lookup/update path also reconstructs a "main booker + guests (joiners)" group by walking matches in reverse until the first non-joiner row.

### Required sheet structure
- `Raw_Intake` (or first sheet) — header row must contain: `BRANCH`, `FACEBOOK NAME`, `FULL NAME`, `Contact Number`, `DATE`, `TIME`, `CLIENT #`, `SERVICES`, `SESSION`, `STATUS`, `ACK?`, `M O P`, `REMARKS` (plus optionally `TYPE` for joiner/main distinction).
- `Services`, `Time_Slots`, `Locations` — optional config sheets; if absent, `DEFAULT_*` arrays in `googleSheets.ts` are used.
- Fortnight sheets — `"<Mon> 1 - 15, YYYY"` / `"<Mon> 16 - <last>, YYYY"` — availability is computed from these only.

### UI
- `app/page.tsx` renders `components/BookingForm.tsx` (client component, orchestrates the flow).
- `components/booking/*` — step components (BranchSelect, DateSelect, TimeSlotGrid, ServiceList, GuestForm, ReviewSummary, Ticket, etc.). Constants for static lists in `components/booking/constants.ts`.
- `Ticket.tsx` uses `html-to-image` to export the confirmation ticket.

## Conventions specific to this repo

- Treat the spreadsheet as production data. Test schema changes against a copy first — there is no migration system.
- Sheet column lookups must go through `findColumnKey(headers, "CLIENT #")` etc. Header casing/spacing in the live sheet drifts.
- When adding new branches/time slots, update both `DEFAULT_LOCATIONS`/`DEFAULT_TIME_SLOTS` in [lib/googleSheets.ts](lib/googleSheets.ts) and the corresponding sheet, or behavior will diverge between fallback and live paths.
- Stray top-level files seen in the working tree (`code.js`, `temp.js`, `temp_claude.js`, `code_gs.txt`) are scratch/Apps Script snippets, not part of the build.
