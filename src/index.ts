export interface DebouncedFn<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  pending: () => boolean;
}

export interface ThrottledFn<T extends (...args: unknown[]) => unknown> {
  (...args: Parameters<T>): void;
  cancel: () => void;
  flush: () => ReturnType<T> | undefined;
  pending: () => boolean;
}

function now(): number {
  return Date.now();
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean; maxWait?: number }
): DebouncedFn<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let maxTimer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime = 0;
  let result: ReturnType<T> | undefined;
  let firstCall = true;
  const { leading = false, trailing = true, maxWait } = options ?? {};

  const invoke = () => {
    timer = null;
    if (lastArgs) {
      result = fn(...lastArgs) as ReturnType<T>;
      lastArgs = null;
    }
  };

  const maxInvoke = () => {
    maxTimer = null;
    if (lastArgs) {
      result = fn(...lastArgs) as ReturnType<T>;
      lastArgs = null;
    }
  };

const debounced = function (this: unknown, ...args: Parameters<T>) {
    const currentTime = now();
    lastArgs = args;

    const isFirstCall = firstCall;
    if (firstCall) {
      lastCallTime = currentTime;
      firstCall = false;
    }

    const elapsed = currentTime - lastCallTime;
    const remaining = wait - elapsed;

    // Leading fires on first call OR when enough time has passed
    const shouldFireLeading = leading && (isFirstCall || elapsed >= wait);
    const shouldFireTrailing = trailing && (remaining <= 0 || remaining > wait);

    if (shouldFireLeading) {
      if (timer) { clearTimeout(timer); timer = null; }
      if (maxTimer) { clearTimeout(maxTimer); maxTimer = null; }
      lastCallTime = currentTime;
      result = fn(...args) as ReturnType<T>;
      if (trailing) {
        timer = setTimeout(invoke, wait);
      }
    } else if (shouldFireTrailing) {
      if (timer) { clearTimeout(timer); timer = null; }
      if (maxTimer) { clearTimeout(maxTimer); maxTimer = null; }
      lastCallTime = currentTime;
      if (lastArgs) {
        result = fn(...lastArgs) as ReturnType<T>;
        lastArgs = null;
      }
    } else if (!timer && trailing) {
      timer = setTimeout(invoke, remaining);
    }

    if (maxWait && currentTime - lastCallTime >= maxWait) {
      if (timer) { clearTimeout(timer); timer = null; }
      if (maxTimer) { clearTimeout(maxTimer); maxTimer = null; }
      lastCallTime = currentTime;
      if (lastArgs) {
        result = fn(...lastArgs) as ReturnType<T>;
        lastArgs = null;
      }
    } else if (maxWait && !maxTimer) {
      const maxRemaining = maxWait - (currentTime - lastCallTime);
      if (maxRemaining > 0) {
        maxTimer = setTimeout(maxInvoke, maxRemaining);
      }
    }

    return result;
  } as DebouncedFn<T>;

  debounced.cancel = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (maxTimer) { clearTimeout(maxTimer); maxTimer = null; }
    lastArgs = null;
  };

  debounced.flush = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (maxTimer) { clearTimeout(maxTimer); maxTimer = null; }
    if (lastArgs) { result = fn(...lastArgs) as ReturnType<T>; lastArgs = null; }
    return result;
  };

  debounced.pending = () => timer !== null || maxTimer !== null || lastArgs !== null;

  return debounced;
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  fn: T,
  wait: number,
  options?: { leading?: boolean; trailing?: boolean }
): ThrottledFn<T> {
  let timer: ReturnType<typeof setTimeout> | null = null;
  let lastArgs: Parameters<T> | null = null;
  let lastCallTime = 0;
  let result: ReturnType<T> | undefined;
  let firstCall = true;
  const { leading = true, trailing = true } = options ?? {};

  const invoke = () => {
    timer = null;
    lastCallTime = now();
    if (lastArgs) {
      result = fn(...lastArgs) as ReturnType<T>;
      lastArgs = null;
    }
  };

  const throttled = function (this: unknown, ...args: Parameters<T>) {
    const currentTime = now();

    const isFirstCall = firstCall;
    if (firstCall) {
      lastCallTime = currentTime;
      firstCall = false;
    }

    const elapsed = currentTime - lastCallTime;
    const remaining = wait - elapsed;

    const shouldFireLeading = leading && (isFirstCall || elapsed >= wait);
    const shouldFireTrailing = trailing && (remaining <= 0 || remaining > wait);

    if (shouldFireLeading) {
      if (timer) { clearTimeout(timer); timer = null; }
      lastCallTime = currentTime;
      result = fn(...args) as ReturnType<T>;
      if (trailing) {
        timer = setTimeout(invoke, wait);
      }
    } else if (shouldFireTrailing) {
      if (timer) { clearTimeout(timer); timer = null; }
      lastCallTime = currentTime;
      if (lastArgs) {
        result = fn(...lastArgs) as ReturnType<T>;
        lastArgs = null;
      }
    } else if (!timer && trailing) {
      timer = setTimeout(invoke, remaining);
    }

    lastArgs = args;
    return result;
  } as ThrottledFn<T>;

  throttled.cancel = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    lastArgs = null;
  };

  throttled.flush = () => {
    if (timer) { clearTimeout(timer); timer = null; }
    if (lastArgs) { result = fn(...lastArgs) as ReturnType<T>; lastArgs = null; }
    return result;
  };

  throttled.pending = () => timer !== null || lastArgs !== null;

  return throttled;
}