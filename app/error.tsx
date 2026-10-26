"use client";

import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { AlertIcon } from "@/components/ui/icons";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16">
      <Card className="p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-danger-soft text-danger-text">
          <AlertIcon className="size-6" />
        </span>
        <h1 className="mt-4 text-lg font-semibold">Something went wrong</h1>
        <p className="mt-1 text-sm text-text-muted">
          It&apos;s not you. Please try again.
        </p>
        <Button onClick={reset} className="mt-5">
          Try again
        </Button>
      </Card>
    </main>
  );
}
