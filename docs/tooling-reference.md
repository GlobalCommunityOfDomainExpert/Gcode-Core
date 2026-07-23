# Tooling & Config Reference

## package.json scripts

| Script | Command | Purpose |
|---|---|---|
| `dev` | `next dev` | Dev server |
| `build` | `next build` | Production build |
| `start` | `next start` | Run production server |
| `lint` | `eslint` | Lint via flat config |
| `format` | `prettier --write .` | Auto-format all files |
| `format:check` | `prettier --check .` | Check formatting only |
| `storybook` | `storybook dev -p 6006` | Storybook dev server |
| `build-storybook` | `storybook build` | Static Storybook build → `storybook-static/` |
| `docs` | `npx concurrently "vitepress dev docs" "npm run storybook"` | This VitePress site + Storybook, side by side |

No `"test"` script exists — see [Testing](#testing) below.

## Key dependencies

- **Framework**: `next` 16.2.9, `react`/`react-dom` 19.2.4
- **UI/state**: `lucide-react` (icons), `@react-oauth/google`, `qrcode`, `zod`, `zustand`
- **Cloud**: `oci-common`, `oci-objectstorage` (OCI Object Storage integration)
- **Testing**: `vitest`, `@vitest/browser-playwright`, `@vitest/coverage-v8`, `playwright`, `vite`
- **Storybook**: `storybook` + `@chromatic-com/storybook`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/addon-mcp`, `@storybook/addon-vitest`, `@storybook/nextjs-vite`, `eslint-plugin-storybook`
- **Docs**: `vitepress`, `lcm`; `mintlify` is present but no config found in the repo — likely unused leftover
- **Lint/format**: `eslint`, `eslint-config-next`, `prettier`, `prettier-plugin-tailwindcss`
- **Styling**: `tailwindcss` v4, `@tailwindcss/postcss`
- **Types**: `typescript`, `@types/node`, `@types/react`, `@types/react-dom`, `@types/qrcode`

## Config files

| File | Key settings |
|---|---|
| `next.config.ts` | Effectively empty — no custom rewrites/images/headers |
| `tsconfig.json` | Target `ES2017`, `strict: true`, `moduleResolution: "bundler"`, `jsx: "react-jsx"`, path alias `@/*` → `./src/*` |
| `eslint.config.mjs` | Flat config: `eslint-config-next/core-web-vitals` + `/typescript`, re-adds `.next/**` etc. to ignores, appends `eslint-plugin-storybook`'s `flat/recommended` |
| `postcss.config.mjs` | Single plugin: `@tailwindcss/postcss` |
| `vitest.config.ts` | One project, `storybook` — wires `@storybook/addon-vitest`'s `storybookTest()` against `.storybook`, runs in real Chromium via `@vitest/browser-playwright`, headless |
| `.prettierrc.json` | Only `plugins: ["prettier-plugin-tailwindcss"]` (auto-sorts Tailwind classes) |

## Testing

- **Only test layer**: Storybook interaction tests via `vitest.config.ts`'s `storybook` project. There is no separate unit-test project.
- **Zero `*.test.ts(x)` / `*.spec.ts(x)` / `__tests__/` files** exist anywhere in the tracked repo. Test coverage is whatever each `.storybook/stories/**/*.stories.tsx` file exercises via play/interaction functions.
- Coverage gaps (components with no story at all, therefore no coverage) are listed in [Components & Design System](/component-reference).
- `.smoke-test.mjs` (repo root) — standalone Playwright script driving a real Razorpay registration flow (`/events/21/register`) 5 times, checking for order response + absence of "Registration failed" text. **Not wired into package.json** — run manually via `node .smoke-test.mjs`.

## Storybook (`.storybook/`)

- `main.ts` — stories glob: `src/**/*.mdx` + `.storybook/stories/**/*.stories.@(js|jsx|mjs|ts|tsx)`. Stories are intentionally isolated outside `src/` from components themselves. Addons: `@chromatic-com/storybook`, `@storybook/addon-vitest`, `@storybook/addon-a11y`, `@storybook/addon-docs`, `@storybook/addon-mcp`. Framework: `@storybook/nextjs-vite`. `staticDirs: ["../public"]`.
- `preview.tsx` — imports global Tailwind CSS (`../src/app/globals.css`), a11y addon set to `test: "todo"` (violations surface in the test UI, don't fail CI).
- `.storybook/stories/` — ~70 files mirroring atomic design: `components/atoms/*`, `components/molecules/*`, `components/layout/*`, plus `app/(auth)/_components/*` (auth-card, google-button, otp-input only).

## Environment variables

| Variable | Declared in `.env.example`? | Used at |
|---|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Yes | Google Identity Services (OAuth) |
| `NEXT_PUBLIC_API_BASE_URL` | **No — gap** | `src/lib/api/client.ts`, overrides the default Oracle ORDS endpoint |

## `.mcp.json`

One MCP server configured: **`sqlcl`** (stdio, `sql -mcp`, `TNS_ADMIN` env) — Oracle SQLcl MCP server for Oracle ADB access, consistent with the ORDS backend. Allow-listed in `.claude/settings.local.json` (`enabledMcpjsonServers: ["sqlcl"]`).

## `.claude/` project setup

```
.claude/
  settings.local.json     Local permission allowlist (playwright MCP tools, npx tsc/eslint, perl) + enables sqlcl MCP
  skills/
    gcode-design-system/  Project skill: "GCODE Design System Architect"
      atoms/*.md            21 files — 1:1 with src/components/atoms
      molecules/*.md         28 files — 1:1 with src/components/molecules
      layout/*.md              footer, navbar, sidebar
      foundations/*.md          colors, typography
      tokens/*.md                colors, radius, shadows, spacing
      references/naming.md
```

No `.claude/agents/` directory exists in this project — only `skills/`.

## `docs/` (this VitePress site)

```
docs/
  .vitepress/config.mts   Site config: title, nav, sidebar, social link
  index.md                  Home hero — links to /getting-started and Storybook (localhost:6006)
  getting-started.md          Prerequisites (Node 18+, OCI creds, Google OAuth keys), setup steps
  backend-integration-strategy.md   Oracle ADB/ORDS schema, proposed columns/tables, phased frontend plan
  oracle-adb-schema-gap-prompt.md    Gap-analysis prompt to DB team — missing backend fields/tables
  architecture-overview.md            This reference set (added for full codebase documentation)
  routing-reference.md
  component-reference.md
  tooling-reference.md
```

Root `README.md` is unmodified `create-next-app` boilerplate and does not reflect this project's actual setup — `docs/getting-started.md` is the real onboarding doc.
