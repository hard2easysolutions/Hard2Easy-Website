"use client";

import { Moon, Sun } from "lucide-react";
import { setTheme, useTheme } from "@/components/providers/theme";
import { site } from "@/content/site";

export default function ThemeToggle({ className = "" }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const label = next === "light" ? site.ui.themeToLight : site.ui.themeToDark;

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={label}
      title={label}
      className={`group relative flex size-11 cursor-pointer items-center justify-center rounded-btn text-fg/80 transition-colors duration-200 hover:text-fg ${className}`}
    >
      {/* Both icons render; CSS shows the right one so server HTML never mismatches. */}
      <Sun
        aria-hidden="true"
        strokeWidth={1.5}
        className="theme-icon-sun size-[18px] transition-transform duration-[400ms] ease-quint group-hover:rotate-45"
      />
      <Moon
        aria-hidden="true"
        strokeWidth={1.5}
        className="theme-icon-moon size-[18px] transition-transform duration-[400ms] ease-quint group-hover:-rotate-12"
      />
    </button>
  );
}
