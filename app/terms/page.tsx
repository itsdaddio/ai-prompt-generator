import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "Terms of Use for the AI Prompt Generator by ItsDad.",
};

export default function TermsPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Terms of Use</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Last updated: [OWNER TO CONFIRM DATE] — DRAFT, pending legal/owner review.
      </p>

      <div className="prose prose-sm mt-8 max-w-none space-y-6 text-sm leading-relaxed text-foreground">
        <section>
          <h2 className="text-lg font-semibold">1. Acceptance</h2>
          <p>
            By using this AI Prompt Generator (&quot;the Service&quot;), operated by ItsDad LLC,
            you agree to these Terms of Use. If you don&apos;t agree, please don&apos;t use the
            Service.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">2. What the Service does</h2>
          <p>
            The Service accepts a topic you provide and generates prompt suggestions using a
            third-party AI model (Anthropic&apos;s Claude). Free usage is limited to a daily
            number of generations per user/IP; this limit may change over time.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">3. Acceptable use</h2>
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc pl-5">
            <li>Generate content intended to harm, harass, defraud, or deceive others</li>
            <li>Attempt to bypass usage limits, rate limits, or security controls</li>
            <li>Send automated bulk traffic intended to abuse or overload the Service</li>
            <li>Attempt to extract, reverse-engineer, or misuse the underlying AI system prompts</li>
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-semibold">4. No warranty</h2>
          <p>
            The Service and generated output are provided &quot;as is,&quot; without warranties
            of any kind. AI-generated prompts may be inaccurate, incomplete, or unsuitable for
            your specific purpose — review output before relying on it.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">5. Third-party AI processing</h2>
          <p>
            Topics you submit are transmitted to Anthropic to generate results. Do not submit
            confidential, sensitive, or personal information you would not want processed by a
            third-party AI provider.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">6. Changes</h2>
          <p>
            These Terms, pricing, and usage limits may change. Continued use after changes take
            effect constitutes acceptance of the updated Terms.
          </p>
        </section>

        <section>
          <h2 className="text-lg font-semibold">7. Contact</h2>
          <p>Questions: [OWNER TO CONFIRM CONTACT EMAIL/ADDRESS].</p>
        </section>

        <p className="rounded-md border border-amber-300/50 bg-amber-50 p-3 text-xs text-amber-900">
          This page is a starting draft, not finished legal advice. Please have it reviewed by a
          qualified professional before relying on it for a live product.
        </p>
      </div>
    </main>
  );
}
