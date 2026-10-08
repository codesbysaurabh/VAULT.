// Smoke tests: load each page in jsdom with its real scripts and assert behaviour.
// Run with: npm test
const { test } = require('node:test');
const assert = require('node:assert');
const fs = require('fs');
const path = require('path');
const { JSDOM, VirtualConsole } = require('jsdom');

const ROOT = path.join(__dirname, '..');

async function load(page) {
  const html = fs
    .readFileSync(path.join(ROOT, page), 'utf8')
    .replace(/<link[^>]*>/g, '')
    .replace(/<script src="([^"]+)"><\/script>/g, (_, src) => '<script>' + fs.readFileSync(path.join(ROOT, src), 'utf8') + '</script>');
  const errors = [];
  const vc = new VirtualConsole();
  vc.on('jsdomError', (e) => errors.push(e.message));
  const dom = new JSDOM(html, { runScripts: 'dangerously', url: 'http://localhost/' + page, virtualConsole: vc, pretendToBeVisual: true });
  await new Promise((r) => setTimeout(r, 100));
  dom.window.confirm = () => true;
  return { w: dom.window, q: (s) => dom.window.document.querySelector(s), errors };
}

for (const page of ['index.html', 'transactions.html', 'budget.html', 'insights.html']) {
  test(`${page} renders without script errors`, async () => {
    const { errors } = await load(page);
    assert.deepStrictEqual(errors, []);
  });
}

test('quick add saves a transaction and escapes user text', async () => {
  const { w, q } = await load('index.html');
  const before = w.V.get().txns.length;
  q('#amount').value = '50';
  q('#tag-food').checked = true;
  q('#txn-note').value = 'Test <b>lunch</b>';
  q('#quick-add-form').dispatchEvent(new w.Event('submit', { cancelable: true }));
  assert.strictEqual(w.V.get().txns.length, before + 1);
  assert.ok(!q('#transaction-list').innerHTML.includes('<b>'));
});

test('budget slider persists the new limit', async () => {
  const { w, q } = await load('budget.html');
  const input = q('[data-cat=food]');
  input.value = 400;
  input.dispatchEvent(new w.Event('input', { bubbles: true }));
  assert.strictEqual(w.V.get().budgets.food, 400);
});

test('clear all empties the store and pages still render', async () => {
  const { w, q, errors } = await load('insights.html');
  w.clearAll();
  q('.vm-save').click();
  await new Promise((r) => setTimeout(r, 50));
  assert.strictEqual(w.V.get().txns.length, 0);
  assert.ok(q('#tipt').textContent.length > 0);
  assert.deepStrictEqual(errors, []);
});

test('stats(): budgeted category spend never exceeds total spend', async () => {
  const { w } = await load('index.html');
  const st = w.V.stats(w.V.get());
  assert.ok(st.cats.reduce((a, c) => a + c.sp, 0) <= st.spent + 0.001);
});

test('Add Money opens a dialog (no prompt) and logs income', async () => {
  const { w, q } = await load('index.html');
  let prompted = false;
  w.prompt = () => { prompted = true; return null; };
  q('#btn-add').click();
  assert.ok(q('#money-modal'), 'dialog should open');
  q('[data-q="500"]').click();
  const before = w.V.stats(w.V.get()).balance;
  q('.vm-save').click();
  assert.strictEqual(prompted, false);
  assert.ok(Math.abs(w.V.stats(w.V.get()).balance - (before + 500)) < 0.01);
});

test('Withdraw rejects an amount larger than the balance', async () => {
  const { w, q } = await load('index.html');
  q('#btn-withdraw').click();
  q('#vm-amt').value = '99999999';
  q('.vm-save').click();
  assert.ok(q('#vm-err').textContent.includes('more than your balance'));
});

test('removing a budget deletes only the limit and keeps transactions', async () => {
  const { w, q } = await load('budget.html');
  const n = w.V.get().txns.length;
  q('[data-remove=music]').click();
  q('.vm-save').click();
  await new Promise((r) => setTimeout(r, 50));
  assert.strictEqual(w.V.get().budgets.music, undefined);
  assert.strictEqual(w.V.get().txns.length, n);
  assert.ok(!q('#card-music'));
});

test('the last remaining budget cannot be removed', async () => {
  const { w, q } = await load('budget.html');
  Object.keys(w.V.get().budgets).slice(1).forEach((c) => w.V.removeBudget(c));
  await new Promise((r) => setTimeout(r, 30));
  q('[data-remove]').click();
  assert.ok(!q('.vm-overlay'), 'no dialog when only one budget is left');
  assert.strictEqual(Object.keys(w.V.get().budgets).length, 1);
});
