# Architecture

Vault is a static multi-page app. Pages share a small set of **classic scripts** (no bundler, no ES modules) so it works from `file://` as well as from any web server. Core scripts declare top-level globals; they must be loaded in the order listed in each HTML file.

## Layers

| Layer | Files | Responsibility |
|---|---|---|
| Utilities | `core/utils.js` | `$`, `$$`, `fmt` (₹ formatting), `esc` (HTML escape), palette, date helpers |
| Data | `core/seed.js`, `core/store.js` | Demo data; `V.get/save/add/del/limit/addCat/clear/reset` |
| Derivation | `core/stats.js` | `V.stats(state)` — pure function, no DOM |
| Commentary | `core/insights.js` | `V.insights(stats)` — ordered list of `{p,t,x,tip}` |
| Shared UI | `core/ui.js` | Toasts, clear-all, header badge |
| Pages | `pages/*.js` | Render HTML strings from `V.stats()`, wire events |

## Data model (`localStorage["vault:v2"]`)

```json
{
  "opening": 3000,
  "budgets": { "food": 500, "bills": 1800 },
  "cats":    { "food": "🍕", "bills": "🏠" },
  "txns": [
    { "id": 1, "name": "Ramen & Co.", "cat": "food",
      "amt": 18.5, "type": "expense", "date": "2026-10-08T20:15" }
  ]
}
```

- `type` is `expense` or `income`; `amt` is always positive.
- A category only gets a budget card if it has an entry in `budgets`.
- Dates are local ISO strings (`YYYY-MM-DDTHH:MM`); day keys are `date.slice(0, 10)`.

## Change flow

1. Any write goes through `V.*`, which saves and dispatches `vault`.
2. Pages call `render()` on `vault` and rebuild from `V.stats(V.get())`.
3. High-frequency inputs (budget sliders) save with `silent=true` and patch only the affected elements, so dragging is never interrupted by a re-render. A full rebuild happens on `change`.

## Adding an insight

Push another object in `core/insights.js`:

```js
if (st.income && st.spent > st.income)
  o.push({ p: 90, t: 'Spending exceeds income', x: 'You have spent more than you earned this month.', tip: 'Pause non-essentials for a week.' });
```

`p` is priority (higher shows first), `t` the headline, `x` the body (HTML allowed — escape any user data), `tip` the suggestion.

## Swapping storage for a backend

Only `core/store.js` touches `localStorage`. Replace `get`/`save` with API calls (keeping the `vault` event) and no page code changes.

## CSS

`base.css` holds design tokens and the shared shell. Per-page differences are expressed as CSS variables (`--nav-active`, `--badge-bg`, `--bg`, `--shadow-*`) set in each page file's `:root`.
