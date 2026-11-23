#!/usr/bin/env bash
# Soft guard: never open PRs into main / force-push main for potta-web.
input=$(cat)
command=$(printf '%s' "$input" | python3 -c 'import json,sys; print(json.load(sys.stdin).get("command",""))' 2>/dev/null || true)

if echo "$command" | grep -Eq 'gh pr create.*(--base[[:space:]]+main|main)'; then
  printf '%s\n' '{"permission":"deny","user_message":"Potta web PRs must target feat/pos-books-web, not main.","agent_message":"Blocked: open the PR into feat/pos-books-web per .cursor/rules/git-workflow.mdc."}'
  exit 0
fi

if echo "$command" | grep -Eq 'git push.*(origin[[:space:]]+main|--force.*main|main:main)'; then
  printf '%s\n' '{"permission":"ask","user_message":"This may push to main. Prefer feat/pos-books-web.","agent_message":"Confirm before touching main; deployable branch is feat/pos-books-web."}'
  exit 0
fi

printf '%s\n' '{"permission":"allow"}'
exit 0
