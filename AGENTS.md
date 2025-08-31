# Repository Guidelines

## Project Structure & Module Organization
- `design/`: UI/branding assets (PNG mockups). Keep source files here.
- `src/`: Application code (create when adding code). Group by feature.
- `tests/`: Automated tests mirroring `src/` layout.
- `scripts/`: Developer utilities (format, lint, release).
- `docs/`: User/developer docs and architecture notes.

Example: `src/auth/`, `src/core/`, `tests/auth/`, `tests/core/`.

## Build, Test, and Development Commands
Because this repo currently contains design assets only, commands depend on the stack you add. Use the following conventions:
- Makefile: `make help` (lists tasks), `make build`, `make test`.
- Node/TypeScript: `npm i`, `npm run dev` (local), `npm test`, `npm run build`.
- Python: `uv venv && uv pip install -r requirements.txt`, `pytest -q`, `python -m app`.
- Rust: `cargo build`, `cargo test`, `cargo run`.
Add a `README` snippet documenting the chosen stack-specific commands.

## Coding Style & Naming Conventions
- Indentation: 2 spaces (JS/TS/JSON/YAML), 4 spaces (Python).
- Filenames: `snake_case.py`, `kebab-case.ts/js`, `PascalCase` for types/classes.
- Imports: prefer absolute app roots (e.g., `@/core/...`) once configured.
- Formatting/Linting: enable and enforce in CI. Examples: Prettier + ESLint (JS/TS), Black + Ruff (Python). Typical commands: `npm run lint`, `npm run format`, `ruff check .`, `black .`.

## Testing Guidelines
- Location: `tests/` mirroring `src/`.
- Naming: `test_*.py` (pytest), `*.spec.ts|tsx` (Vitest/Jest).
- Coverage: target ≥80% once testable code exists. Generate reports in CI.
- Run locally before pushing: `pytest -q` or `npm test`.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`. Example: `feat(auth): add JWT middleware`.
- PRs: concise title, summary of change, linked issues (`Closes #123`), screenshots for UI, checklist of tests/formatting done.
- Small, focused PRs are preferred; include migration notes when applicable.

## Security & Configuration Tips
- Never commit secrets. Use `.env.example` and document required variables.
- Add `.gitattributes`/`.gitignore` to exclude generated assets.
- Verify licensing for images in `design/` before distribution.
