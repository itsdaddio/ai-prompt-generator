"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Structured, secret-free error log for production diagnosis.
    // eslint-disable-next-line no-console
    console.error(
      JSON.stringify({
        ts: new Date().toISOString(),
        event: "client_error_boundary",
        message: error.message?.slice(0, 300),
        digest: error.digest,
      })
    );
  }, [error]);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <AlertTriangle className="h-10 w-10 text-destructive" />
      <h1 className="text-xl font-semibold">Something went wrong</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        We hit an unexpected error generating your prompts. This has been logged — please try
        again.
      </p>
      <Button onClick={reset}>Try again</Button>
    </main>
  );
}
