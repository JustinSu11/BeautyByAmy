## Quick context — what this repo is

- Monorepo with a Next.js web app in `apps/web` and a Flutter mobile app in
  `mobile_flutter`.
- Root-level scripts (see `package.json`) provide shortcuts:
  - `npm run dev:web` — starts Next.js with turbopack (primary web dev flow)
  - `npm run dev:mobile` — runs the Flutter app (sets API_BASE_URL for emulator)

## Big picture architecture

- apps/web

  - Uses the Next.js app router (`apps/web/src/app`) with server and client
    components. Key folders: `src/app`, `src/components`, `src/lib`, `src/hooks`.
  - Example integration points:
    - Stripe webhook route: `apps/web/src/app/api/webhooks/stripe/route.ts`
    - Stripe helper: `apps/web/src/lib/stripe.ts` (reads `process.env.STRIPE_SECRET_KEY`)
  - UI components live under `apps/web/src/components/ui` (e.g. `button.tsx`,
    `input.tsx`, `navigation-menu.tsx`). Follow the existing component props
    and styling patterns.

- mobile_flutter
  - Standard Flutter app. Dev script in `mobile_flutter/package.json` uses:
    `flutter run --dart-define=API_BASE_URL=http://10.0.2.2:3000` (emulator)
  - Build scripts set production `API_BASE_URL` via `--dart-define` for releases.

## Developer workflows & commands (concrete)

- Web (fast dev):
  - From repo root: `npm run dev:web` (recommended, sets turbopack)
  - Or from `apps/web`: `npm run dev`
- Mobile (emulator):
  - `npm run dev:mobile` from repo root — sets `API_BASE_URL` to `10.0.2.2`
  - For production builds: `npm run build:android` / `npm run build:ios` in
    `mobile_flutter` (scripts exist in `mobile_flutter/package.json`).
- Linting: `npm run lint` (root and `apps/web` also have lint scripts).
- Turbo pipeline is configured in `turbo.json` — builds depend on `^build` and the
  cache/outputs are defined for the monorepo. Keep outputs under `.next/**` or
  `dist/**` when adding build steps.

## Project-specific conventions & patterns

- TypeScript paths: `@/*` maps to `apps/web/src/*` (see `apps/web/tsconfig.json`).
  Use `@/` imports inside the web app for consistency.
- Styling: Tailwind is configured in `apps/web/tailwind.config.js`. Components
  are styled with utility classes; keep new classes listed in `content` glob.
- API & secrets:
  - `apps/web/src/lib/stripe.ts` expects `process.env.STRIPE_SECRET_KEY`.
  - The Flutter app expects `API_BASE_URL` via `--dart-define`.
  - Do not commit secrets or hard-code production URLs — prefer env vars.
- UI components:
  - Reuse components from `apps/web/src/components/ui` and follow their
    prop names and exported defaults (e.g., `button.tsx`, `card.tsx`).

## Integration points to inspect before changing behavior

- `apps/web/src/app/api/webhooks/stripe/route.ts` — webhook handling for Stripe.
- `apps/web/src/lib/stripe.ts` — server-side Stripe client and apiVersion usage.
- `apps/web/src/lib/*` — helpers for config, logging and validations.
- `mobile_flutter/package.json` — dev/build scripts and the `API_BASE_URL`
  convention used by CI/local dev.

## Safety notes for AI edits

- Never add or commit real secrets. If creating `.env` examples, make them
  `.env.example` with placeholders and note required keys (e.g. `STRIPE_SECRET_KEY`).
- Preserve existing exports and file locations (Next's app router expects
  `src/app` and API routes under `src/app/api`). Moving files will break routes.
- Keep TypeScript types strict; the project uses `strict: true` in TS config.

## What to look for when changing or adding code

- For web API changes, ensure server-only code lives under server components or
  `src/app/api` and uses environment variables for secrets.
- For mobile changes that call the API, use the same `API_BASE_URL` pattern
  (document any additional dart-defines you introduce in `mobile_flutter/README.md`).
- When adding build outputs, update `turbo.json` `pipeline` outputs to help
  CI cache correctness.

If any of these files are out-of-date or you want more specific rules (ex: lint
exceptions, PR size limits, preferred commit message format), tell me which
area to expand and I will update this file accordingly.
