# Dashboard: Subscribers, YTP Price, Scan/Hotel/Flight

## Goal

Add five pieces of information and entry points to the dashboard:

- **Total Subscribers** — display-only stat
- **YTP Live Price** — display-only stat, sourced from `useWallet().ytpToInrRate`
- **Scan & Pay** — action card linking to `/scan-pay`
- **Hotel Booking** — action card linking to `/hotel`
- **Flight Booking** — action card linking to `/flight`

All of it must be responsive (mobile + desktop).

## Components

### 1. `components/Dashboard/LiveStats.tsx` (new)

Two-card strip shown immediately below the Net Worth card.

- Left card: Total Subscribers (static placeholder: `12,845+` — no API yet)
- Right card: YTP Price (live, from `useWallet().ytpToInrRate`, formatted as `₹{rate.toFixed(4)}`)
- Styling matches existing emerald/dark pattern used by NetWorthSection
- framer-motion fade-up on mount (consistent with other dashboard sections)
- Grid: `grid-cols-2 gap-3` — same on mobile and desktop

### 2. `components/Dashboard/Services.tsx` (new)

Three-card section labelled "Travel & Pay" shown below QuickActions.

- Scan & Pay → `/scan-pay` (QrCode icon, emerald accent)
- Hotel Booking → `/hotel` (BedDouble icon, amber accent)
- Flight Booking → `/flight` (Plane icon, sky accent)
- Grid: `grid-cols-3 gap-3` — same on mobile and desktop (cards scale down on small screens)
- Uses Link + motion — same hover/tap pattern as QuickActions

### 3. Dashboard layout update (`components/Dashboard/Dashboard.tsx`)

Insert into the existing grid:

- Mobile stack order: NetWorth → **LiveStats** → QuickActions → **Services** → HotOffers → StakingPlans → ReferralSection → Chart
- Desktop (lg): LiveStats in left col after NetWorth; Services in left col after QuickActions; right col unchanged

### 4. Stub pages (new, minimal)

- `app/(dashboard)/scan-pay/page.tsx`
- `app/(dashboard)/hotel/page.tsx`
- `app/(dashboard)/flight/page.tsx`

Each is a simple centered "Coming Soon" placeholder — enough that the links are not dead.

## Out of scope

- Real subscribers count API (hardcoded for now)
- Actual scan/hotel/flight flows (pages are placeholders only)
- Changes to QuickActions itself

## Success criteria

- Dashboard renders without errors on mobile and desktop
- YTP price reflects live `ytpToInrRate`
- Scan/Hotel/Flight cards navigate to their stub pages without 404
