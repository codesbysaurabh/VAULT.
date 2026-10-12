#!/usr/bin/env node
/**
 * One-shot patcher for the non-JS files (HTML, CSS, manifest, docs).
 * Run once from the repo root:   node tools/apply-fixes.js
 * Safe to re-run: every step reports "+ applied" or "- already applied / not found".
 */
const fs = require('fs');
const path = require('path');
const ROOT = path.join(__dirname, '..');

function patch(file, steps) {
  const p = path.join(ROOT, file);
  if (!fs.existsSync(p)) return console.log(`skip (missing): ${file}`);
  console.log(file);
  const orig = fs.readFileSync(p, 'utf8');
  let s = orig;
  for (const [name, fn] of steps) {
    const n = fn(s);
    console.log(n === s ? `  - already applied / not found: ${name}` : `  + ${name}`);
    s = n;
  }
  if (s !== orig) fs.writeFileSync(p, s);
}
const rep = (re, to) => (s) => s.replace(re, to);
const append = (marker, text) => (s) => (s.includes(marker) ? s : s.replace(/\s*$/, '\n') + '\n' + text);

// ── CSS ─────────────────────────────────────────────────────────────
patch('assets/css/base.css', [
  ['mobile header: wrapper + short badge', rep(
    /\.page-wrapper \.site-header \.header-badge\s*\{\s*margin-left:\s*auto;\s*\}/,
    '.page-wrapper .site-header .hdr-right { margin-left: auto; min-width: 0; }\n  .hdr-right .header-badge { max-width: 52vw; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }\n  .cycle-btn .lbl { display: none; }')],
  ['cycle button, focus ring, reduced motion', append('/* ── Month cycle button', `/* ── Month cycle button (injected by core/ui.js) ── */
.hdr-right { display: flex; align-items: center; gap: 8px; }
.cycle-btn {
  padding: 4px 11px;
  border: var(--border-width) solid var(--white);
  border-radius: 999px;
  background: transparent;
  color: var(--white);
  font: 700 0.7rem 'DM Mono', monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.1s, color 0.1s, border-color 0.1s;
}
.cycle-btn:hover { background: var(--neon-green); color: var(--black); border-color: var(--neon-green); }

/* Visible keyboard focus (page styles set outline:none on buttons) */
:focus-visible { outline: 3px solid var(--hot-pink) !important; outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; scroll-behavior: auto !important; }
}
`)],
]);

patch('assets/css/dashboard.css', [
  ['stat card colours (nth-child matched nothing)', rep(/\.stat-card:nth-child\(/g, '.stat-card:nth-of-type(')],
  ['remove dead mobile nav rule', rep(/\n[ \t]*\.nav-pills\s*\{\s*display:\s*none;\s*\}/, '')],
  ['tag colours for health/travel/utilities/dining', append('/* extra tag colours */', `/* extra tag colours */
.tag-health    { background: #F87171; color: var(--white); }
.tag-travel    { background: var(--electric-blue); }
.tag-utilities { background: #94A3B8; color: var(--white); }
.tag-dining    { background: var(--orange); color: var(--white); }
`)],
]);

patch('assets/css/insights.css', [
  ['bar-grow keyframe (!important is ignored in keyframes)', rep(/from\s*\{\s*height:\s*0\s*!important;\s*\}/, 'from { height: 0; }')],
]);

// ── HTML ────────────────────────────────────────────────────────────
for (const page of ['index.html', 'transactions.html', 'budget.html', 'insights.html']) {
  patch(page, [
    ['split glued <meta>/<link> line', rep(/(<meta name="twitter:image"[^>]*>)[ \t]*(<link)/, '$1\n  $2')],
    ['remove duplicate preconnect', rep(/(<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com" \/>)\s*<link rel="preconnect" href="https:\/\/fonts\.googleapis\.com" \/>/, '$1')],
    ['link the web manifest', (s) => (/rel="manifest"/.test(s) ? s : s.replace('</head>', '  <link rel="manifest" href="manifest.webmanifest" />\n</head>'))],
    ['logo links home', rep(/<a class="site-logo" href="#">/, '<a class="site-logo" href="index.html">')],
    ['no hard-coded month in static text', (s) => s.replace('📅 Feb 2026 Summary', '📅 This Month Summary').replace('Top 3 budget drainers · Feb 2026', 'Top 3 budget drainers · This Month')],
  ]);
}

// ── Manifest (works when hosted in a sub-folder too) ────────────────
patch('manifest.webmanifest', [
  ['relative start_url / scope', (s) => s.replace('"start_url": "/index.html"', '"start_url": "./index.html"').replace('"scope": "/"', '"scope": "./"')],
]);

// ── Docs ────────────────────────────────────────────────────────────
patch('docs/ARCHITECTURE.md', [
  ['data model: cycleStart', rep(/("opening": 3000,)(?!\s*"cycleStart")/, '$1\n  "cycleStart": 1,')],
  ['month cycle section', append('## Month cycle', `## Month cycle

"This month" is the user's **month cycle**, not necessarily the calendar month. \`state.cycleStart\` (1–31, default 1) is the day each cycle begins; in months shorter than that day the cycle starts on the month's last day.

- \`cycleOf(date, day)\` (core/utils.js) returns \`{ start, end, next, days }\` for the cycle containing \`date\`; \`cycleLabel()\` formats it ("Oct 2026" or "Sep 15 – Oct 14, 2026").
- \`V.stats()\` derives *everything* month-based from it: spend, income, budgets, previous-cycle comparison, days left, forecast, daily log, and the 3M / YTD charts (which use cycles, not calendar months). Rolling windows (7 days, 8 weeks, streak, heatmap) are unaffected.
- \`V.setCycle(day)\` saves the choice. \`V.reset()\` and \`V.clear()\` keep it. The ⚙ button in every header (injected by core/ui.js) opens the dialog.
`)],
]);
patch('README.md', [
  ['month cycle feature', (s) => (s.includes('Month cycle') ? s : s.replace('\n## Data\n', `\n## Month cycle\n\nUse the **⚙ Cycle** button in the header to choose the day your month starts (e.g. payday on the 25th). Budgets, spend, "this month" labels, the previous-month comparison, forecast, daily log and the 3M / YTD charts all follow it. Months shorter than the chosen day start on their last day.\n\n## Data\n`))],
]);
console.log('\nDone. Run `npm test` to verify.');
