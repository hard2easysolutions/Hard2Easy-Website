/**
 * Decorative brand orbit: a gradient ring (hard → easy) with an optional
 * soft disc inside and optional satellite dots. Position and size come from
 * `className` (e.g. "-right-40 -bottom-40 w-[720px]").
 */
export default function Orbit({ className = "", disc = false, dots = false, speed, trackSpeed }) {
  const style = {};
  if (speed) style["--orbit-speed"] = speed;
  if (trackSpeed) style["--track-speed"] = trackSpeed;
  return (
    <div aria-hidden="true" style={style} className={`orbit pointer-events-none absolute aspect-square ${className}`}>
      {disc && <span className="orbit-disc" />}
      <span className="orbit-ring" />
      {dots && (
        <span className="orbit-track">
          <span className="orbit-dot orbit-dot--easy" />
          <span className="orbit-dot orbit-dot--hard" />
        </span>
      )}
    </div>
  );
}
