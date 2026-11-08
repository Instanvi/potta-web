# Potta POS & Books (web)

Next.js frontend for Potta: the POS register and the accounting books (chart of accounts, journals, ledger, reports, cashbook, taxes), sales (invoices, receipts, credit notes, vouchers), purchasing (purchase orders, vendor portal) and treasury (bank accounts).

It talks to:

| Service | Env var | Purpose |
|---|---|---|
| potta-backend | `NEXT_PUBLIC_API_BASE_URL` | POS + Books API |
| instanvi-auth-starter | `NEXT_PUBLIC_AUTH_API_URL` | IdP: `/get-session`, `/session/permissions`, `/session/hierarchy` |
| instanvi-auth-frontend | `NEXT_PUBLIC_SUPER_APP_URL` | Hub login and app launcher |

## Run locally

```bash
cp .env.example .env.local
npm ci
npm run dev
```

Sign in from the hub (Potta tile) or open any page: unauthenticated visits are sent to `${NEXT_PUBLIC_SUPER_APP_URL}/login`, which returns to `/auth-callback` with an encrypted session payload.

## Scripts

| Script | What it does |
|---|---|
| `npm run dev` | Dev server |
| `npm run typecheck` | `tsc --noEmit` (the build itself ignores type errors) |
| `npm run lint` | ESLint flat config |
| `npm run build` | Standalone production build |

## Conventions

- Requests go through `config/axios.config` (adds the bearer token, `x-location-id`, `x-organization-id`; handles 401/403).
- Org, location and permissions live in `src/store/use-auth-context-store.ts`; check access with `<Can resource action>` / `useCan()`.
- Navigation is defined once in `src/lib/navigation.ts`; route access in `src/lib/route-permissions.ts`.
- Feedback uses Sonner (`import { toast } from 'sonner'`).

See `.cursor/rules` for the full set of project rules and `.cursor/commands` for reusable agent commands.
