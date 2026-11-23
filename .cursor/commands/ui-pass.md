# UI consistency pass (Potta web)

Run this checklist on screens you touched; fix what fails.

1. **Fields:** inputs/selects/textareas use `FIELD_*` / `SHEET_FIELD_*` or shadcn controls with `bg-field` — not pure white on white.
2. **Selects:** form/filter selects are shadcn Select (async typeahead may keep react-select).
3. **Toolbar:** list search and action buttons share one `ListToolbar` row.
4. **Sheets:** open from the right (`side="right"` / Slider from right). No left slide-ins.
5. **Headers:** no duplicate in-page `PageHeader` title/description when the navbar already names the page.
6. **Location:** switcher has no border box / “Location context” card chrome.
7. **Invoice / documents:** seller block uses `useOrganizationProfile` (Auth logo + metadata). Grep must not find hardcoded `Instanvi Sarl` or personal email fallbacks on previews.
8. **Loading:** tables and layout panels use Skeleton / `TableSkeleton`, not `InlineLoader` spinners.
9. **Data:** lists and mutations go through TanStack Query custom hooks — no inline `useEffect` + axios in the page.
