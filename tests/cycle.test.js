// Month-cycle tests. The pure-logic tests run the real core scripts in a bare vm (no DOM needed);
// the last test drives the dialog in jsdom.
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

function env() {
  const store = {};
  const ctx = {
    localStorage: { getItem: (k) => (k in store ? store[k] : null), setItem: (k, v) => { store[k] = String(v); } },
    addEventListener() {}, dispatchEvent() {}, Event: class {},
    document: { querySelector() {}, querySelectorAll() { return []; } },
  };
  ctx.window = ctx;
  vm.createContext(ctx);
  for (const f of ['utils', 'seed', 'store', 'stats']) vm.runInContext(read(`assets/js/core/${f}.js`), ctx, { filename: f });
  return ctx;
}
const k = (c, d) => c.dk(d);

test('cycleOf: default start day is the calendar month', () => {
  const c = env(), r = c.cycleOf(new Date(2026, 9, 12), 1);
  assert.strictEqual(k(c, r.start), '2026-10-01');
  assert.strictEqual(k(c, r.end), '2026-10-31');
  assert.strictEqual(r.days, 31);
});

test('cycleOf: mid-month start, before and after the start day', () => {
  const c = env();
  let r = c.cycleOf(new Date(2026, 9, 12), 15);
  assert.deepStrictEqual([k(c, r.start), k(c, r.end), r.days], ['2026-09-15', '2026-10-14', 30]);
  r = c.cycleOf(new Date(2026, 9, 15), 15);
  assert.deepStrictEqual([k(c, r.start), k(c, r.end)], ['2026-10-15', '2026-11-14']);
});

test('cycleOf: crosses the year boundary', () => {
  const c = env(), r = c.cycleOf(new Date(2026, 0, 5), 15);
  assert.deepStrictEqual([k(c, r.start), k(c, r.end)], ['2025-12-15', '2026-01-14']);
});

test('cycleOf: day 31 falls back to the last day of short months', () => {
  const c = env(), r = c.cycleOf(new Date(2026, 2, 1), 31);
  assert.deepStrictEqual([k(c, r.start), k(c, r.end), r.days], ['2026-02-28', '2026-03-30', 31]);
});

test('cycleLabel formats calendar and custom cycles', () => {
  const c = env();
  assert.strictEqual(c.cycleLabel(c.cycleOf(new Date(2026, 9, 12), 1), 1), 'Oct 2026');
  assert.strictEqual(c.cycleLabel(c.cycleOf(new Date(2026, 9, 12), 15), 15), 'Sep 15 – Oct 14, 2026');
});

test('stats follow the cycle: spend, previous cycle, days left', () => {
  const c = env();
  const t = (date, amt) => ({ id: amt, name: 'x', cat: 'food', amt, type: 'expense', date: date + 'T10:00' });
  const s = {
    opening: 0, cycleStart: 15, budgets: { food: 1000 }, cats: { food: '🍕' },
    txns: [t('2026-09-14', 100), t('2026-09-15', 200), t('2026-10-12', 50), t('2026-10-15', 999)],
  };
  const st = c.V.stats(s, new Date(2026, 9, 12));
  assert.strictEqual(st.spent, 250);          // Sep 15 + Oct 12 only
  assert.strictEqual(st.lastTotal, 100);      // Sep 14 belongs to the previous cycle
  assert.strictEqual(st.dim, 30);
  assert.strictEqual(st.dom, 28);
  assert.strictEqual(st.left, 2);
  assert.strictEqual(st.label, 'Sep 15 – Oct 14, 2026');
  assert.strictEqual(st.endLabel, 'Oct 14');
  assert.strictEqual(st.days.length, 30);
  assert.strictEqual(st.daily.length, 28);
  // same data with a calendar month sees different numbers
  s.cycleStart = 1;
  assert.strictEqual(c.V.stats(s, new Date(2026, 9, 12)).spent, 1049);
});

test('streak is 0 with no transactions (no free 90-day streak)', () => {
  const c = env();
  const st = c.V.stats({ opening: 0, cycleStart: 1, budgets: { food: 100 }, cats: {}, txns: [] }, new Date(2026, 9, 12));
  assert.strictEqual(st.streak, 0);
  assert.ok(st.last14.every((d) => d.none));
});

test('store: setCycle clamps, and reset/clear keep the preference', () => {
  const c = env();
  c.V.setCycle(15);
  assert.strictEqual(c.V.get().cycleStart, 15);
  c.V.setCycle(99);
  assert.strictEqual(c.V.get().cycleStart, 1);
  c.V.setCycle(20);
  c.V.reset(true);
  assert.strictEqual(c.V.get().cycleStart, 20);
  c.V.clear();
  assert.strictEqual(c.V.get().cycleStart, 20);
});

test('store: ids stay unique when adding quickly', () => {
  const c = env();
  c.V.clear();
  const n = { name: 'a', cat: 'food', amt: 1, type: 'expense', date: '2026-10-12T10:00' };
  c.V.add(n); c.V.add(n); c.V.add(n);
  assert.strictEqual(new Set(c.V.get().txns.map((x) => x.id)).size, 3);
});

test('cycle dialog saves the start day and the label follows it (jsdom)', async () => {
  const { JSDOM, VirtualConsole } = require('jsdom');
  const html = read('insights.html')
    .replace(/<link[^>]*>/g, '')
    .replace(/<script src="([^"]+)"><\/script>/g, (_, src) => '<script>' + read(src) + '</script>');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(e.message));
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/insights.html', virtualConsole: vc, pretendToBeVisual: true });
  await new Promise((r) => setTimeout(r, 100));
  const w = dom.window, q = (s) => w.document.querySelector(s);
  assert.ok(q('.cycle-btn'), 'header has a cycle button');
  q('.cycle-btn').click();
  q('#vc-day').value = '15';
  q('#cycle-modal .vm-save').click();
  await new Promise((r) => setTimeout(r, 50));
  assert.strictEqual(w.V.get().cycleStart, 15);
  assert.ok(q('#scsub').textContent.includes('–'), 'page re-rendered with the custom range');
  assert.deepStrictEqual(errors, []);
});
