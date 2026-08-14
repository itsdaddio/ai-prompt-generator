import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for the AI Prompt Generator by ItsDad.",
};

export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: [OWNER TO CONFIRM DATE] — DRAFT, pending legal/owner review.
      </p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-lg font-semibold">1. What this tool does with your input</h2>
          <p>
            When you enter a topic and generate prompts, that text is sent to a third-party AI
            provider (Anthropic, maker of Claude) to generate the results. Your input is{" "}
            <strong>not</strong> stored on ItsDad&apos;s own servers by default — it is processed
            in-memory for the duration of the request. Anthropic&apos;s own data-handling terms
            apply to that processing; see{" "}
            <a href="https://www.anthropic.com/legal/privacy" target="_blank" rel="noreferrer">
              Anthropic&apos;s Privacy Policy
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. What we store locally on your device</h2>
          <p>
            Your &quot;recent generations&quot; history and first-touch campaign attribution
            (UTM parameters) are stored only in your browser&apos;s local storage. This data is
            not transmitted to ItsDad and is not visible to us unless a future signed-in sync
            feature is explicitly enabled and disclosed.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Analytics</h2>
          <p>
            We use privacy-respecting web analytics (Vercel Analytics) to understand aggregate
            usage — page views, feature usage, and campaign performance. We do not collect
            unnecessary personally identifiable information, and we do not sell your data.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. Third-party services</h2>
          <p>
            This application relies on Anthropic (AI generation), Vercel (hosting and analytics),
            and GitHub (source code hosting). Each provider has its own privacy practices,
            governed by their respective policies.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Children&apos;s privacy</h2>
          <p>This tool is not directed at children under 13 and does not knowingly collect their data.</p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Contact</h2>
          <p>
            Questions about this policy: [OWNER TO CONFIRM CONTACT EMAIL/ADDRESS].
          </p>
        </section>

        <p className="rounded-md border border-amber-300/50 bg-amber-50 p-3 text-xs text-amber-900">
          This page is a starting draft, not finished legal advice. Please have it reviewed by a
          qualified professional before relying on it for a live product handling real user data.
        </p>
      </div>
    </main>
  );
}
