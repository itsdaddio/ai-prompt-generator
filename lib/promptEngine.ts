import { GeneratedPrompt, PromptTone } from "@/types";

interface ToneProfile {
  label: string;
  voice: string;
  styleNote: string;
  closer: string;
}

const TONE_PROFILES: Record<PromptTone, ToneProfile> = {
  professional: {
    label: "Professional",
    voice: "Respond in a polished, business-appropriate tone with clear structure.",
    styleNote: "Use precise language, headers where useful, and avoid slang.",
    closer: "Keep the response concise, well-organized, and action-oriented.",
  },
  casual: {
    label: "Casual",
    voice: "Respond in a relaxed, conversational tone, like you're chatting with a friend.",
    styleNote: "Use everyday language and keep things approachable and easy to skim.",
    closer: "Keep it friendly and down-to-earth.",
  },
  funny: {
    label: "Funny",
    voice: "Respond with a witty, humorous tone — throw in clever jokes or playful analogies.",
    styleNote: "Don't be afraid to be a little silly, but keep the actual information useful.",
    closer: "End with a light, funny one-liner if it fits naturally.",
  },
  cinematic: {
    label: "Cinematic",
    voice: "Respond with vivid, dramatic, scene-setting language, like narrating a movie.",
    styleNote: "Use sensory detail, pacing, and evocative imagery throughout.",
    closer: "Build toward a memorable, impactful closing line.",
  },
  technical: {
    label: "Technical",
    voice: "Respond with precise, detail-oriented, expert-level technical language.",
    styleNote: "Include specifics, edge cases, and terminology appropriate for a subject-matter expert.",
    closer: "Back up claims with concrete reasoning or examples.",
  },
  creative: {
    label: "Creative",
    voice: "Respond with imaginative, original, out-of-the-box thinking.",
    styleNote: "Favor novel angles, metaphors, and unexpected connections over the obvious answer.",
    closer: "Push past the first idea that comes to mind — surprise me.",
  },
};

interface PromptTemplate {
  tag: string;
  title: (topic: string) => string;
  build: (topic: string, tone: ToneProfile) => string;
}

const TEMPLATES: PromptTemplate[] = [
  {
    tag: "Explainer",
    title: (t) => `Explain ${t}`,
    build: (topic, tone) =>
      `Explain "${topic}" as if teaching someone with no prior background. Break it into the 3-5 most important ideas, use a simple analogy for the trickiest part, and end with a one-sentence summary. ${tone.voice} ${tone.styleNote}`,
  },
  {
    tag: "Brainstorm",
    title: (t) => `Brainstorm ideas about ${t}`,
    build: (topic, tone) =>
      `Brainstorm 10 original, non-obvious ideas related to "${topic}". Group them into 2-3 themes, and flag which single idea has the most potential and why. ${tone.voice} ${tone.styleNote}`,
  },
  {
    tag: "Step-by-Step Guide",
    title: (t) => `Step-by-step plan for ${t}`,
    build: (topic, tone) =>
      `Create a step-by-step action plan for "${topic}". Include realistic timeframes, common pitfalls to avoid at each step, and one quick win I could achieve in the first 24 hours. ${tone.voice} ${tone.closer}`,
  },
  {
    tag: "Expert Persona",
    title: (t) => `Ask an expert about ${t}`,
    build: (topic, tone) =>
      `Act as a world-class expert on "${topic}". Give me your single most contrarian, high-value piece of advice, explain the reasoning behind it, and note the most common mistake beginners make. ${tone.voice} ${tone.styleNote}`,
  },
  {
    tag: "Compare & Contrast",
    title: (t) => `Compare options for ${t}`,
    build: (topic, tone) =>
      `Compare the top approaches, tools, or schools of thought related to "${topic}" in a clear table (pros, cons, best-for). Then give a direct recommendation for a beginner versus an advanced user. ${tone.voice} ${tone.styleNote}`,
  },
  {
    tag: "Creative Angle",
    title: (t) => `Reimagine ${t}`,
    build: (topic, tone) =>
      `Reimagine "${topic}" from a completely unexpected angle — as a story, metaphor, or thought experiment. Make it memorable enough that I'd repeat it to a friend. ${tone.voice} ${tone.closer}`,
  },
  {
    tag: "Deep Dive",
    title: (t) => `Deep dive into ${t}`,
    build: (topic, tone) =>
      `Do a deep dive into "${topic}": cover its history or origin in 2 sentences, the current state of the art, and where it's likely heading in the next 2-3 years. ${tone.voice} ${tone.styleNote}`,
  },
  {
    tag: "Critique",
    title: (t) => `Critique my approach to ${t}`,
    build: (topic, tone) =>
      `Play devil's advocate on "${topic}". Poke holes in the most common assumptions people make about it, then tell me what a smarter approach would look like. ${tone.voice} ${tone.closer}`,
  },
];

function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function cleanTopic(raw: string): string {
  return raw.trim().replace(/\s+/g, " ").replace(/[."']+$/g, "");
}

/**
 * Deterministically shuffles an array given a numeric seed (Fisher-Yates
 * with a simple linear congruential generator so results are reproducible
 * per seed but different across seeds).
 */
function seededShuffle<T>(items: T[], seed: number): T[] {
  const result = [...items];
  let state = seed || 1;
  const next = () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function generatePrompts(
  rawTopic: string,
  tone: PromptTone,
  variant: number = 0
): GeneratedPrompt[] {
  const topic = cleanTopic(rawTopic) || "this topic";
  const toneProfile = TONE_PROFILES[tone] ?? TONE_PROFILES.professional;

  // Combine the topic hash with the variant number so "Regenerate" (which
  // bumps variant) reliably surfaces a different set of 5 templates instead
  // of repeating the same ones for the same topic.
  const seed = hashString(topic.toLowerCase()) + variant * 97;
  const shuffled = seededShuffle(TEMPLATES, seed);

  const selected = shuffled.slice(0, 5);

  return selected.map((template, index) => ({
    id: `${variant}-${index}-${template.tag}`,
    title: template.title(topic),
    prompt: template.build(topic, toneProfile),
    tag: template.tag,
  }));
}

export function getToneLabel(tone: PromptTone): string {
  return (TONE_PROFILES[tone] ?? TONE_PROFILES.professional).label;
}

export const TONE_OPTIONS: { value: PromptTone; label: string }[] = (
  Object.keys(TONE_PROFILES) as PromptTone[]
).map((value) => ({ value, label: TONE_PROFILES[value].label }));
