import { useMemo } from "react";
import { useDemo } from "./demo/store";
import { makeT } from "./i18n";

export function useApp() {
  const state = useDemo();
  const t = useMemo(() => makeT(state.lang), [state.lang]);
  return { s: state, t, lang: state.lang };
}

export function formatDate(iso: string, lang: "en" | "hi") {
  return new Date(iso).toLocaleDateString(lang === "hi" ? "hi-IN" : "en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
