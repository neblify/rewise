---
name: audit
description: Runs the full pre-commit audit—install, audit fix, lint, format check, type check, build, unit tests (optionally knip). Use when auditing the project, verifying before commit, or when the user asks for the full check.
---

# Audit – Pre-Commit Sanity Check

## When to Apply

- User asks to audit the project, run the full check, verify before commit, or sanity-check the codebase.
- User asks to run any of: npm install, npm audit fix, lint, format check, type check, build, unit tests (individually or as a sequence).

## Instructions

Run from the **project root** (where `package.json` is). Request **network** permission for install and audit.

Execute in this order (stop on first failure and report the error):

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Fix known vulnerabilities**

   ```bash
   npm audit fix
   ```

3. **Lint**

   ```bash
   npm run lint
   ```

   If the user wants auto-fixes, run `npm run lint:fix` instead or after.

4. **Format check**

   ```bash
   npm run format:check
   ```

   If the user wants to fix formatting, run `npm run format` instead or after.

5. **Type check**

   ```bash
   npm run type-check
   ```

6. **Build**

   ```bash
   npm run build
   ```

7. **Unit tests**

   ```bash
   npm run test:unit
   ```

8. **Optional – find unused code/deps**
   ```bash
   npm run knip
   ```
   Run when the user asks for unused dependency/code checks; can report false positives.

- For a full audit, run steps 1–7 (and 8 if appropriate); stop on first failure and report the error.
- If the user asked for specific steps only, run those.
- Report success or failure for each step; on failure, show the relevant output.

## Notes

- Use `npm install` unless the project or user requires `npm ci` or another package manager (pnpm, yarn).
- Do not run `npm audit fix --force` unless the user explicitly requests it; report remaining advisories instead.
- E2E tests (`npm run test:e2e`) are slower and require a running app; run only when the user asks for full test coverage or e2e.
