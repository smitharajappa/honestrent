import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchIcon } from "@/components/ui/icons";

export const metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16">
      <Card className="p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-muted text-text-muted">
          <SearchIcon className="size-6" />
        </span>
        <h1 className="mt-4 text-lg font-semibold">We couldn&apos;t find that page</h1>
        <p className="mt-1 text-sm text-text-muted">The link may be old or mistyped.</p>
        <ButtonLink href="/" className="mt-5">
          Search apartments
        </ButtonLink>
      </Card>
    </main>
  );
}
