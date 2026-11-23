/**
 * Infinite horizontal loop (CSS transform). The track is duplicated so the
 * -50% translate loops seamlessly. Pauses on hover; stops under reduced motion.
 */
export default function Marquee({ children, duration = 40, className = "" }) {
  return (
    <div
      className={`marquee relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,#000_12%,#000_88%,transparent)] ${className}`}
    >
      <div className="marquee-track flex w-max" style={{ "--marquee-duration": `${duration}s` }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden="true" className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
