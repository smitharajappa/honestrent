"use client";

import { createContext, useContext, useState } from "react";
import type { ApprovalProfile } from "@/lib/approval";

type Answers = Partial<ApprovalProfile>;
type ContextValue = { answers: Answers; setAnswers: (a: Answers) => void };

const ApprovalContext = createContext<ContextValue | null>(null);

/**
 * Holds the renter's approval answers in memory on their device only.
 * Nothing here is sent to the server, put in the URL, or saved.
 */
export function ApprovalProvider({ children }: { children: React.ReactNode }) {
  const [answers, setAnswers] = useState<Answers>({});
  return (
    <ApprovalContext.Provider value={{ answers, setAnswers }}>
      {children}
    </ApprovalContext.Provider>
  );
}

export function useApproval(): ContextValue {
  const value = useContext(ApprovalContext);
  if (!value) throw new Error("useApproval must be used inside ApprovalProvider");
  return value;
}
