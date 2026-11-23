/**
 * Mono uppercase label preceded by a 6×6 cyan square.
 * `tone="dark"` for dark sections, `tone="light"` for paper sections.
 */
export default function Eyebrow({ as: Tag = "p", tone = "dark", className = "", children, ...props }) {
  const color = "text-mute";
  return (
    <Tag className={`text-label flex items-center gap-3 ${color} ${className}`} {...props}>
      <span aria-hidden="true" className="size-1.5 shrink-0 bg-brand" />
      <span>{children}</span>
    </Tag>
  );
}
