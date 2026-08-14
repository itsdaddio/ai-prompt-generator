import { test, assert, assertEqual, report } from "./test-utils";
import { checkRateLimit, getClientIdentifier } from "../lib/rateLimit";

// Note: these tests run against a single shared in-memory store (as it would
// in a real running server), so each test uses its own unique client-id
// namespace rather than resetting global state between tests.
let counter = 0;
function uniqueClient(prefix: string) {
  counter += 1;
  return `${prefix}-${counter}-${Date.now()}`;
}

async function main() {
  console.log("rateLimit.test.ts");

  await test("allows requests up to the configured daily limit (default 10/day)", () => {
    const client = uniqueClient("limit-test");
    const results = Array.from({ length: 10 }, () => checkRateLimit(client));
    assert(
      results.every((r) => r.allowed),
      "all 10 requests within the default limit should be allowed"
    );
    assertEqual(results[9].remaining, 0);
  });

  await test("blocks the request once the limit is exceeded", () => {
    const client = uniqueClient("block-test");
    for (let i = 0; i < 10; i++) checkRateLimit(client);
    const eleventh = checkRateLimit(client);
    assertEqual(eleventh.allowed, false);
    assertEqual(eleventh.remaining, 0);
  });

  await test("tracks separate clients independently", () => {
    const clientA = uniqueClient("independent-a");
    const clientB = uniqueClient("independent-b");
    const resultA = checkRateLimit(clientA);
    const resultB = checkRateLimit(clientB);
    assert(resultA.allowed && resultB.allowed, "independent clients should each get their own quota");
  });

  await test("getClientIdentifier prefers the first entry of x-forwarded-for", () => {
    const request = new Request("https://example.com", {
      headers: { "x-forwarded-for": "203.0.113.5, 70.41.3.18" },
    });
    assertEqual(getClientIdentifier(request), "203.0.113.5");
  });

  await test("getClientIdentifier falls back to x-real-ip", () => {
    const request = new Request("https://example.com", {
      headers: { "x-real-ip": "198.51.100.7" },
    });
    assertEqual(getClientIdentifier(request), "198.51.100.7");
  });

  await test("getClientIdentifier returns 'unknown' with no IP headers", () => {
    const request = new Request("https://example.com");
    assertEqual(getClientIdentifier(request), "unknown");
  });

  report();
}

main();
