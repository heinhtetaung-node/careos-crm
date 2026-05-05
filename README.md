# careos-crm

Sales CRM frontend used by staff to manage leads and orders.

This folder is a self-contained extraction of `apps/crm` from the
`careos-frontend` monorepo. It uses a small local pnpm workspace so the
internal packages it depends on can keep referencing each other via
`workspace:*` without relying on the parent monorepo.

## Layout

```
careos-crm/
├── package.json          # the CRM app (name: "careos-crm")
├── pnpm-workspace.yaml   # local workspace, only includes packages/*
├── src/                  # CRM application source
├── public/
└── packages/             # vendored workspace packages
    ├── careos-call/
    ├── careos-constants/
    ├── eslint-config-custom/
    ├── icons/                  (@alphafounders/icons)
    ├── mock-data/              (@alphafounders/mock-data)
    ├── newrelic/               (@careos/newrelic)
    ├── sorting-filtering/      (@careos/sorting-filtering)
    ├── tailwind-config/        (@alphafounders/tailwind-config)
    ├── ui/                     (@alphafounders/ui)
    └── utils/                  (@careos/utils)
```

## Install & run

```bash
cd careos-crm
pnpm install
pnpm dev
```

## Common scripts

- `pnpm dev` – start Vite dev server (port 3030)
- `pnpm build` / `pnpm build:staging` / `pnpm build:preprod` / `pnpm build:prod`
- `pnpm test` / `pnpm test:watch` / `pnpm test:coverage`
- `pnpm lint` / `pnpm lint:fix`
- `pnpm format:check` / `pnpm format:write`

## Notes

- The CRM app references the local workspace packages with `workspace:*`.
  Any source change in `packages/*` is picked up immediately by pnpm.
- The original copy under `apps/crm` in the parent monorepo still exists.
  Once this folder is verified as the source of truth, it can be removed
  along with related entries in the root `pnpm-workspace.yaml`,
  `turbo.json`, and root `package.json` scripts.
