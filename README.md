# VAULT.

> Your money, brutally honest. A neo-brutalist personal finance tracker built with vanilla JavaScript and `localStorage` — no framework, no build step, no backend.

**Live:** https://vault.thestrange.in

## Features

| Page | What it does |
|---|---|
| **Dashboard** (`index.html`) | Net balance, weekly change, stat cards, under-budget streak, recent activity, quick-add form, budget bars and a generated insight. |
| **Transactions** (`transactions.html`) | Filter by type or category, live search, pagination, delete, CSV export, print/PDF and copy-to-sheet. |
| **Budget** (`budget.html`) | Per-category limits with sliders, global adjusters, over-budget alerts, filter/sort, and custom categories. |
| **Insights** (`insights.html`) | Week-over-week headline, switchable chart (7D / MTD / 3M / YTD), spend breakdown, month comparison, forecast, daily log, 8-week trend and heatmap. |

Every number and every sentence on every page is **derived from one data store** — add a transaction on the dashboard and all four pages update.

## Quick start

```bash
git clone <your-repo-url> vault && cd vault
npm start        # serves the folder on http://localhost:3000
```

No install is needed to run it; any static file server works (`python3 -m http.server`, VS Code Live Server, …). Opening `index.html` directly also works.

```bash
npm install      # only needed for tests (installs jsdom)
npm test         # smoke + behaviour tests
```

## Project structure

```
vault/
├── index.html                # Dashboard
├── transactions.html         # Transactions
├── budget.html               # Budgets
├── insights.html             # Insights
├── assets/
│   ├── favicon.svg
│   ├── css/
│   │   ├── base.css          # design tokens, reset, header/nav/footer, toast
│   │   ├── dashboard.css     # per-page styles
│   │   ├── transactions.css
│   │   ├── budget.css
│   │   └── insights.css
│   └── js/
│       ├── core/             # shared, DOM-free logic (load order matters)
│       │   ├── utils.js      #  1. helpers, formatters, palette, dates
│       │   ├── seed.js       #  2. deterministic demo data
│       │   ├── store.js      #  3. state + CRUD + "vault" change event
│       │   ├── stats.js      #  4. V.stats()    — derives every figure
│       │   ├── insights.js   #  5. V.insights() — rule-based commentary
│       │   └── ui.js         #  6. toast, clear-all, header badge
│       └── pages/            # one small render + events file per page
│           ├── dashboard.js
│           ├── transactions.js
│           ├── budget.js
│           └── insights.js
├── docs/ARCHITECTURE.md
├── tests/smoke.test.js
├── package.json
├── LICENSE
└── README.md
```

## How it works

```
user action ─▶ V.add / V.del / V.limit … ─▶ localStorage ─▶ "vault" event
                                                                  │
 page render() ◀─ V.stats(state) ◀─ V.insights(stats) ◀───────────┘
```

State is saved in `localStorage` under the key `vault:v2`. Each page listens for the `vault` event (also fired by the `storage` event, so other open tabs stay in sync) and re-renders from `V.stats()`. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the data model and how to extend it.

## Data

- First visit loads ~75 days of generated demo data.
- **Reset demo data** and **Clear all data** are in every footer; **Clear All Data** is also on the Transactions page.
- Data lives only in your browser. Use **Download CSV** to back it up.

## Deploying

It is a static site — upload the folder as is.

- **GitHub Pages / Cloudflare Pages / Netlify / Vercel:** point at the repo root, no build command, publish directory `/`.
- **Custom domain:** add `vault.thestrange.in` in the host's dashboard and create the DNS record it asks for.

## Roadmap

- [ ] JSON export / import for moving data between devices
- [ ] Edit existing transactions
- [ ] Recurring transactions
- [ ] Optional backend sync (all data access already goes through `core/store.js`)

## License

MIT © 2026 Strange
