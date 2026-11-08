# Wire a potta-backend endpoint into Potta web

Connect the endpoint the user names (method + path, e.g. `GET /cashbook/entries`) to a screen.

1. Find the route in `../potta-backend/src/modules/**/*.controller.ts`. Note:
   - the `@Permissions({ action, resource })` on it,
   - the request DTO (body/query) and what the service returns.
2. In the feature folder under `src/app/(routes)/<feature>/`:
   - add a function to `utils/api.ts` using `import axios from 'config/axios.config'` and return `res.data`;
   - add or extend the feature's query-key factory;
   - add a hook in `hooks/` (`useQuery` for reads, `useMutation` + `invalidateQueries` + Sonner toast for writes).
3. Use the hook in the page/component. Wrap create/update/delete controls in `<Can resource="..." action="...">` with the exact strings from the decorator.
4. If the resource/action is not in `src/lib/permissions.ts`, add it there (and tell the user it must also exist in instanvi-auth-starter `src/roles/potta-permissions.catalog.ts`).
5. Run `npm run typecheck` and fix errors in the files you touched.

Do not set auth, location or organization headers; the client does it.
