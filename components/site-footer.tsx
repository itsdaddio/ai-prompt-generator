"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { trackEvent } from "@/lib/track";

export function SiteFooter() {
  return (
    <footer className="mx-auto mt-16 w-full max-w-2xl border-t border-muted-foreground/10 px-4 py-8 text-center text-xs text-muted-foreground">
      <div className="mb-3 flex items-center justify-center gap-1.5">
        <Sparkles className="h-3.5 w-3.5" />
        <span>
          A free tool by{" "}
          <a
            href="https://itsdad.io"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-foreground hover:underline"
          >
            ItsDad
          </a>
        </span>
      </div>
      <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
        <Link href="/terms" className="hover:underline">
          Terms
        </Link>
        <Link href="/privacy" className="hover:underline">
          Privacy
        </Link>
        <a
          href="mailto:itsdad@itsdad.io?subject=AI%20Prompt%20Generator%20Pro%20interest"
          onClick={() => trackEvent("upgrade_cta_click", { placement: "footer" })}
          className="hover:underline"
        >
          Interested in Pro / unlimited generations?
        </a>
      </nav>
    </footer>
  );
}
