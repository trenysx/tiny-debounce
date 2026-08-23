# tiny-debounce

**Tiny debounce & throttle.** ~500 bytes gzipped, TypeScript types included, ESM-only, zero dependencies.

```bash
npm install tiny-debounce
```

```js
import { debounce, throttle } from "tiny-debounce";

const handleResize = debounce(() => { console.log("resized"); }, 150);
window.addEventListener("resize", handleResize);

const handleScroll = throttle(() => { console.log("scrolled"); }, 100);
window.addEventListener("scroll", handleScroll);
```

## Why

Lodash's `debounce`/`throttle` are great but ~2 KB gzipped each with types. Most projects only need the core behavior. This package is:

- **~500 bytes gzipped** (both functions + types)
- **Zero dependencies**
- **ESM-only**, tree-shakeable
- **TypeScript-first** — types included, no `@types/*` needed
- **Same API** as lodash (leading/trailing/maxWait options)

## Install

```bash
npm install tiny-debounce
```

Requires Node ≥ 18 or any modern browser with ES modules.

## API

### `debounce(fn, wait, options?)`

Returns a debounced function.

```ts
type DebouncedFn<T extends (...args: unknown[]) => unknown> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  pending: () => boolean;
};

function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
  options?: {
    leading?: boolean;   // default: false
    trailing?: boolean;  // default: true
    maxWait?: number;    // force invoke at most every maxWait ms
  }
): DebouncedFn<T>;
```

**Options:**
- `leading: true` — invoke on the leading edge
- `trailing: true` — invoke on the trailing edge (default)
- `maxWait: 200` — guarantee invocation at least every `maxWait` ms

**Methods:**
- `cancel()` — cancel any pending invocation
- `flush()` — immediately invoke pending call, return its result
- `pending()` — `true` if a call is waiting

---

### `throttle(fn, wait, options?)`

Returns a throttled function.

```ts
type ThrottledFn<T extends (...args: unknown[]) => unknown> = {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  pending: () => boolean;
};

function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
  options?: {
    leading?: boolean;   // default: true
    trailing?: boolean;  // default: true
  }
): ThrottledFn<T>;
```

**Options:**
- `leading: true` — invoke on the leading edge (default)
- `trailing: true` — invoke on the trailing edge (default)

**Methods:** same as debounce (`cancel`, `flush`, `pending`).

---

## Size

| Package | gzipped |
|---------|---------|
| `lodash.debounce` + `lodash.throttle` | ~2.2 KB |
| `tiny-debounce` (both) | **~0.5 KB** |

## License

[Apache-2.0](LICENSE) © trenysx