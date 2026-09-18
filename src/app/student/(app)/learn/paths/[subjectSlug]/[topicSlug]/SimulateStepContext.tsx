"use client";

import { createContext, useContext } from "react";

// Lets a button rendered inside the (server-built) Learn content advance
// the step rail owned by TopicStepView, without passing a raw function
// prop across the server/client boundary (React Server Components refuse
// to serialize functions as props — only context/composition works here).
export const SimulateStepContext = createContext<{ goToSimulate: () => void } | null>(null);

export function useGoToSimulate() {
  const ctx = useContext(SimulateStepContext);
  return ctx?.goToSimulate ?? (() => {});
}
