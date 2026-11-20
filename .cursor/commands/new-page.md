# Add a Potta web page

Create the page the user describes inside the existing shell.

1. Pick the module (POS, Books, Sales, Purchasing, Treasury) and create `src/app/(routes)/<path>/page.tsx` as a `'use client'` component wrapped in `<RootLayout>` from `src/app/(routes)/layout`.
2. Add the feature files next to it: `utils/api.ts`, `hooks/`, `components/` (see `.cursor/rules/project-structure.mdc`).
3. Register navigation in `src/lib/navigation.ts` (title, href, Phosphor icon) and access in `src/lib/route-permissions.ts`.
4. Reuse existing table, slideover, modal and form components so the page matches the rest of Potta; handle loading, empty and error states.
5. Use Sonner for feedback and a confirmation modal for destructive actions.
6. Run `npm run typecheck` and `npm run lint`.
