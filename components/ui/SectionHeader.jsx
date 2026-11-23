import Eyebrow from "./Eyebrow";
import Reveal from "./Reveal";
import SplitText from "./SplitText";

/**
 * Asymmetric section header: heading in columns 1–7, intro offset to 8–12.
 */
export default function SectionHeader({ id, eyebrow, title, intro, className = "" }) {
  return (
    <div className={`grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 ${className}`}>
      <div className="lg:col-span-7">
        {eyebrow && (
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
          </Reveal>
        )}
        <SplitText id={id} text={title} className={`text-h2 max-w-[18ch] text-balance ${eyebrow ? "mt-6" : ""}`} />
      </div>
      {intro && (
        <Reveal delay={0.15} className="self-end lg:col-span-5 lg:col-start-8">
          <p className="text-body max-w-[46ch] text-mute">{intro}</p>
        </Reveal>
      )}
    </div>
  );
}
