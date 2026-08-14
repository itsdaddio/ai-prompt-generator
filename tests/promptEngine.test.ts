import { generatePrompts, getToneLabel, TONE_OPTIONS } from "../lib/promptEngine";
import { test, assert, assertEqual, report } from "./test-utils";
import type { PromptTone } from "../types";

async function main() {
  console.log("promptEngine.test.ts");

  await test("returns exactly 5 prompts for a normal topic", () => {
    const prompts = generatePrompts("launching a small coffee brand", "professional", 0);
    assertEqual(prompts.length, 5);
  });

  await test("every prompt references the topic and has required fields", () => {
    const topic = "learning to play guitar";
    const prompts = generatePrompts(topic, "casual", 0);
    for (const p of prompts) {
      assert(p.prompt.toLowerCase().includes(topic.toLowerCase()), "prompt should mention topic");
      assert(p.title.length > 0, "title should not be empty");
      assert(p.tag.length > 0, "tag should not be empty");
      assert(p.id.length > 0, "id should not be empty");
    }
  });

  await test("produces a different set of tags when the variant changes (shuffle)", () => {
    const topic = "training for a marathon";
    const first = generatePrompts(topic, "cinematic", 0).map((p) => p.tag);
    const second = generatePrompts(topic, "cinematic", 1).map((p) => p.tag);
    assert(JSON.stringify(first) !== JSON.stringify(second), "variant 0 and 1 should differ");
  });

  await test("is deterministic for the same topic + tone + variant", () => {
    const a = generatePrompts("small coffee brand", "funny", 2).map((p) => p.tag);
    const b = generatePrompts("small coffee brand", "funny", 2).map((p) => p.tag);
    assertEqual(a, b);
  });

  await test("falls back to a safe default when given an empty topic", () => {
    const prompts = generatePrompts("   ", "professional", 0);
    assertEqual(prompts.length, 5);
    assert(prompts[0].prompt.includes("this topic"), "should use fallback topic text");
  });

  await test("falls back to the professional tone profile for an unknown tone value", () => {
    const prompts = generatePrompts("a topic", "not-a-real-tone" as PromptTone, 0);
    assertEqual(prompts.length, 5);
  });

  await test("exposes every tone as a selectable option with a human label", () => {
    assert(TONE_OPTIONS.length >= 6, "should have at least 6 tone options");
    for (const option of TONE_OPTIONS) {
      assertEqual(getToneLabel(option.value), option.label);
    }
  });

  report();
}

main();
