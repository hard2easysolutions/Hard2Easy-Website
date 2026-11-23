import { ArrowRight } from "lucide-react";

const sizes = {
  md: "min-h-12 px-5 text-[14px] sm:px-6 sm:text-[15px]",
  sm: "min-h-11 px-4 text-[14px]",
};

/**
 * variant: "primary" (blue fill) | "outline" (hairline, dark bg) | "text" (underline grows from left)
 * tone (text variant only): "dark" | "light"
 */
export default function Button({
  href,
  variant = "primary",
  size = "md",
  tone = "dark",
  arrow = false,
  className = "",
  children,
  ...props
}) {
  const Tag = href ? "a" : "button";
  const tagProps = href ? { href } : { type: props.type ?? "button" };

  if (variant === "text") {
    const rest = "bg-line-strong";
    const active = "bg-accent";
    return (
      <Tag
        {...tagProps}
        {...props}
        className={`group inline-flex min-h-11 cursor-pointer items-center gap-2 text-[15px] font-medium ${className}`}
      >
        <span className="relative py-1">
          {children}
          <span aria-hidden="true" className={`absolute inset-x-0 bottom-0 h-px ${rest}`} />
          <span
            aria-hidden="true"
            className={`absolute inset-x-0 bottom-0 h-px origin-left scale-x-0 transition-transform duration-[250ms] ease-quint group-hover:scale-x-100 group-focus-visible:scale-x-100 ${active}`}
          />
        </span>
        {arrow && <Arrow />}
      </Tag>
    );
  }

  const look =
    variant === "outline"
      ? "border border-line-strong text-fg hover:border-fg/40"
      : "bg-green text-ink hover:bg-lime";

  return (
    <Tag
      {...tagProps}
      {...props}
      className={`group inline-flex cursor-pointer items-center justify-center gap-2.5 rounded-btn font-medium transition-colors duration-200 ease-quint ${sizes[size]} ${look} ${className}`}
    >
      <span>{children}</span>
      {arrow && <Arrow />}
    </Tag>
  );
}

function Arrow() {
  return (
    <ArrowRight
      aria-hidden="true"
      strokeWidth={1.5}
      className="size-4 shrink-0 transition-transform duration-200 ease-quint group-hover:translate-x-1"
    />
  );
}
