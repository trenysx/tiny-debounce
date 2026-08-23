import test from "node:test";
import assert from "node:assert/strict";
import { debounce, throttle } from "../dist/index.js";

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

test("debounce: trailing (default) fires after wait", async () => {
  let calls = 0;
  const d = debounce(() => { calls++; }, 50);
  d(); d(); d();
  assert.equal(calls, 0);
  await delay(60);
  assert.equal(calls, 1);
});

test("debounce: leading fires immediately", async () => {
  let calls = 0;
  const d = debounce(() => { calls++; }, 50, { leading: true, trailing: false });
  d(); d(); d();
  assert.equal(calls, 1);
  await delay(60);
  assert.equal(calls, 1);
});

test("debounce: leading + trailing fires both", async () => {
  let calls = 0;
  const d = debounce(() => { calls++; }, 50, { leading: true, trailing: true });
  d();
  assert.equal(calls, 1);
  await delay(60);
  assert.equal(calls, 2);
});

test("debounce: cancel prevents trailing call", async () => {
  let calls = 0;
  const d = debounce(() => { calls++; }, 50);
  d(); d.cancel(); await delay(60);
  assert.equal(calls, 0);
});

test("debounce: flush invokes pending immediately", async () => {
  let calls = 0;
  const d = debounce(() => { calls++; }, 50);
  d(); d.flush(); assert.equal(calls, 1);
  await delay(60); assert.equal(calls, 1);
});

test("debounce: pending reports correctly", async () => {
  const d = debounce(() => {}, 50);
  assert.equal(d.pending(), false);
  d(); assert.equal(d.pending(), true);
  await delay(60); assert.equal(d.pending(), false);
});

test("debounce: maxWait forces invocation", async () => {
  let calls = 0;
  const d = debounce(() => { calls++; }, 50, { maxWait: 20 });
  d();
  await delay(30);
  assert.equal(calls, 1);
});

test("throttle: leading (default) fires immediately", async () => {
  let calls = 0;
  const t = throttle(() => { calls++; }, 50);
  t(); t(); t();
  assert.equal(calls, 1);
  await delay(60);
  t();
  assert.equal(calls, 2);
});

test("throttle: trailing fires after wait", async () => {
  let calls = 0;
  const t = throttle(() => { calls++; }, 50, { leading: false, trailing: true });
  t(); t();
  assert.equal(calls, 0);
  await delay(60);
  assert.equal(calls, 1);
});

test("throttle: cancel prevents trailing", async () => {
  let calls = 0;
  const t = throttle(() => { calls++; }, 50, { leading: false, trailing: true });
  t(); t.cancel(); await delay(60);
  assert.equal(calls, 0);
});

test("throttle: flush invokes pending", async () => {
  let calls = 0;
  const t = throttle(() => { calls++; }, 50, { leading: false, trailing: true });
  t(); t.flush(); assert.equal(calls, 1);
  await delay(60); assert.equal(calls, 1);
});

test("throttle: pending reports correctly", async () => {
  const t = throttle(() => {}, 50, { leading: false, trailing: true });
  assert.equal(t.pending(), false);
  t(); assert.equal(t.pending(), true);
  await delay(60); assert.equal(t.pending(), false);
});

test("debounce: returns last result from flush", () => {
  const d = debounce((x) => x * 2, 50);
  d(3); assert.equal(d.flush(), 6);
});

test("throttle: returns last result from flush", () => {
  const t = throttle((x) => x * 2, 50, { leading: false });
  t(3); assert.equal(t.flush(), 6);
});

test("debounce: arguments preserved on trailing", async () => {
  let last = null;
  const d = debounce((x) => { last = x; }, 50);
  d(1); d(2); d(3);
  await delay(60);
  assert.equal(last, 3);
});

test("throttle: arguments preserved on trailing", async () => {
  let last = null;
  const t = throttle((x) => { last = x; }, 50, { leading: false });
  t(1); t(2); t(3);
  await delay(60);
  assert.equal(last, 3);
});