import Image from "next/image";
import { site } from "@/content/site";

// Logo files + sizes come from content/data/brand.json → "logos".
const { onDark, onLight, mark } = site.brand.logos;

/**
 * Official Hard2Easy lockup (HE mark + HARD2EASY wordmark + "Solutions").
 * Two renders exist — white "Solutions" for dark surfaces, black for light —
 * and CSS (.theme-dark-only / .theme-light-only) shows the right one, so the
 * server HTML never depends on the visitor's theme.
 *
 * `className` sets the height; width follows the image's own aspect ratio.
 */
export default function Logo({ name, className = "h-9", priority = false }) {
  const size = `${className} w-auto`;
  return (
    <span className="inline-flex items-center">
      <Image
        src={onDark.src}
        width={onDark.width}
        height={onDark.height}
        alt={name}
        priority={priority}
        sizes="240px"
        className={`theme-dark-only ${size}`}
      />
      <Image
        src={onLight.src}
        width={onLight.width}
        height={onLight.height}
        alt=""
        aria-hidden="true"
        priority={priority}
        sizes="240px"
        className={`theme-light-only ${size}`}
      />
    </span>
  );
}

/** The HE mark on its own (works on any background). */
export function LogoMark({ className = "h-8", alt = "" }) {
  return <Image src={mark.src} width={mark.width} height={mark.height} alt={alt} sizes="64px" className={`${className} w-auto`} />;
}
