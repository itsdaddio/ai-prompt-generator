/**
 * Minimal zero-dependency test harness (avoids the vitest/postcss ESM
 * conflict in this CommonJS Next.js project). Each test file exports a
 * default async function that registers assertions via `test()` and
 * `assertEqual()`/`assert()`; `runTests` executes them and exits non-zero on
 * any failure so it works cleanly in CI.
 */

let passCount = 0;
let failCount = 0;
const failures: string[] = [];

export async function test(name: string, fn: () => void | Promise<void>) {
  try {
    await fn();
    passCount += 1;
    console.log(`  ✓ ${name}`);
  } catch (err) {
    failCount += 1;
    const message = err instanceof Error ? err.message : String(err);
    failures.push(`${name}: ${message}`);
    console.log(`  ✗ ${name} — ${message}`);
  }
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

export function assertEqual<T>(actual: T, expected: T, message?: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) {
    throw new Error(message ?? `expected ${e} but got ${a}`);
  }
}

export function report(): never {
  console.log(`\n${passCount} passed, ${failCount} failed`);
  if (failCount > 0) {
    console.log("\nFailures:");
    failures.forEach((f) => console.log(`  - ${f}`));
    process.exit(1);
  }
  process.exit(0);
}
