# Verify Potta web

Run the checks and report results; fix what fails in files changed on this branch.

1. `npm run typecheck`. The repo still has legacy type errors in older screens: compare against `git diff --name-only main...HEAD` and fix every error in changed files.
2. `npm run lint` (warnings are acceptable, errors are not, in changed files).
3. `npm run build` to confirm the standalone build.
4. Grep for regressions: `rg "react-hot-toast|from 'axios'|NEXT_PUBLIC_API_BASE_URL" src` must only hit `src/config/axios.config.ts` (and `src/auth.ts` for the server-side session check).
5. Summarize: what passed, what failed, and anything that needs a running potta-backend / IdP to test manually.
