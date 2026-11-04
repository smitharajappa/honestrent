import type { Metadata } from "next";
import { Checkout } from "@/components/plus/Checkout";
import { isPassId } from "@/lib/plus";

export const metadata: Metadata = {
  title: "Checkout (demo)",
  description:
    "A demo checkout for Honest Rent Plus. No card is used and nothing is charged.",
  robots: { index: false },
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ pass?: string }>;
}) {
  const { pass } = await searchParams;
  return (
    <main className="page-container max-w-3xl py-10">
      <Checkout initialPass={isPassId(pass) ? pass : "tour"} />
    </main>
  );
}
