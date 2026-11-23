"use client";

import { ArrowUp } from "lucide-react";
import { scrollToTarget, useLenis } from "@/components/providers/SmoothScroll";

export default function BackToTop({ label }) {
  const lenis = useLenis();
  return (
    <button
      type="button"
      onClick={() => {
        scrollToTarget(lenis, 0);
        document.getElementById("main")?.focus({ preventScroll: true });
      }}
      className="group inline-flex min-h-11 items-center gap-2 self-start text-fg/80 transition-colors hover:text-fg sm:self-auto"
    >
      {label}
      <ArrowUp aria-hidden="true" strokeWidth={1.5} className="size-4 transition-transform duration-200 ease-quint group-hover:-translate-y-0.5" />
    </button>
  );
}
