import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-4xl font-bold">404</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        This page doesn&apos;t exist. Head back to the AI Prompt Generator homepage.
      </p>
      <Button asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </main>
  );
}
