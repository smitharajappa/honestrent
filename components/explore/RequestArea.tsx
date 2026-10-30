"use client";

import { useActionState } from "react";
import { requestArea, type AreaRequestState } from "@/app/actions/area";
import { Button, ButtonLink } from "../ui/Button";
import { Card } from "../ui/Card";
import { CheckIcon, MapPinIcon } from "../ui/icons";

/** Shown when the searched area has no buildings yet. */
export function RequestArea({
  area,
  coveredHref,
}: {
  area: string;
  coveredHref: string;
}) {
  const [state, action, pending] = useActionState<AreaRequestState, FormData>(
    requestArea,
    {
      status: "idle",
    },
  );

  return (
    <Card
      as="section"
      aria-labelledby="area-heading"
      className="mt-10 p-6 text-center sm:p-8"
    >
      <span className="mx-auto grid size-12 place-items-center rounded-full bg-surface-muted text-text-muted">
        <MapPinIcon className="size-6" />
      </span>
      <h2 id="area-heading" className="mt-4 text-xl font-bold">
        We&apos;re not in {area} yet
      </h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-text-muted">
        Swelt checks every building by hand, starting with Richardson and Plano. Tell us
        you want {area} and we&apos;ll prioritise it.
      </p>

      {state.status === "done" ? (
        <p
          role="status"
          className="mx-auto mt-5 inline-flex items-center gap-2 rounded-full bg-success-soft px-4 py-2 text-sm font-semibold text-success-text"
        >
          <CheckIcon className="size-4" />
          Thanks! We&apos;ve noted {area}.
        </p>
      ) : (
        <form
          action={action}
          className="mt-5 flex flex-col justify-center gap-2 sm:flex-row"
        >
          <input type="hidden" name="area" value={area} />
          <Button type="submit" disabled={pending} aria-busy={pending}>
            {pending ? "Sending…" : `Request ${area}`}
          </Button>
          <ButtonLink href={coveredHref} variant="secondary">
            See Richardson &amp; Plano
          </ButtonLink>
        </form>
      )}
      {state.status === "error" && (
        <p role="alert" className="mt-3 text-sm text-danger-text">
          {state.message}
        </p>
      )}
      <p className="mt-4 text-xs text-text-muted">
        We save only the area name and the date.
      </p>
    </Card>
  );
}
