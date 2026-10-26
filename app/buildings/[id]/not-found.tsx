import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { SearchIcon } from "@/components/ui/icons";

export default function BuildingNotFound() {
  return (
    <main className="mx-auto w-full max-w-2xl px-4 py-16">
      <Card className="p-6 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-muted text-text-muted">
          <SearchIcon className="size-6" />
        </span>
        <h1 className="mt-4 text-lg font-semibold">
          We couldn&apos;t find that apartment
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          It may have been removed, or the link is incomplete.
        </p>
        <ButtonLink href="/" className="mt-5">
          Search apartments
        </ButtonLink>
      </Card>
    </main>
  );
}
