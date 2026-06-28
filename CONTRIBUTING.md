# Contributing to RobeRent

Thanks for helping improve RobeRent! This guide covers the local workflow.

## Getting started

```bash
npm run install:all
cp server/.env.example server/.env   # then edit values
npm run seed:admin --prefix server   # create an admin account
npm run server                       # API (watch)
npm run client                       # Vite dev server
```

See the [README](README.md) for full setup and the
[API reference](docs/API.md).

## Project layout

- `server/` — Express API (CommonJS). Routes are thin; validation lives in
  `validators/` (Zod) and is applied via `middleware/validate.js`. Throw the
  typed errors in `utils/errors.js` and let the central handler format them.
- `client/` — React + Vite (ESM). Shared helpers live in `src/utils/`.

## Quality gates

Run these before opening a PR — all should pass:

```bash
npm test          # backend tests (Jest + Supertest)
npm run lint      # ESLint (server + client)
npm run format    # Prettier (writes); use format:check in CI
```

### Tests

- Add backend tests under `server/tests/` as `*.test.js`.
- Unit tests for validators/utilities need no database.
- Tests that hit routes requiring the database should use an in-memory MongoDB
  (e.g. `mongodb-memory-server`) — not yet wired; contributions welcome.

## Coding conventions

- Match the surrounding style; Prettier is the formatter of record
  (single quotes, semicolons, 90-char width).
- Validate all external input with a Zod schema before using it.
- Never log secrets or full tokens. Use the `winston` logger, not `console.*`.
- Keep secrets out of git — only `server/.env.example` is tracked.

## Commits & branches

- Branch off `main`; use focused, descriptive commits.
- Reference the relevant `TODO.md` / `IMPROVEMENTS.md` item where applicable, and
  update `CHANGELOG.md` under **Unreleased** for user-visible changes.
