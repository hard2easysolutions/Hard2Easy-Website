import { isPlaceholder } from "@/content/derive";
import { site } from "@/content/site";

// lucide-react v1 ships no brand icons, so these are simple inline marks.
const ICONS = {
  linkedin: (
    <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.6h.06c.53-1 1.83-2.06 3.77-2.06 4.03 0 4.77 2.65 4.77 6.1V21h-4v-4.95c0-1.18-.02-2.7-1.65-2.7-1.65 0-1.9 1.29-1.9 2.62V21h-4V9.75Z" />
  ),
  x: <path d="M17.75 3h3.07l-6.7 7.66L22 21h-6.17l-4.83-6.32L5.47 21H2.4l7.17-8.2L2 3h6.33l4.37 5.77L17.75 3Zm-1.08 16.2h1.7L7.4 4.73H5.58L16.67 19.2Z" />,
  instagram: (
    <path d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Zm0 7.9a3.1 3.1 0 1 1 0-6.2 3.1 3.1 0 0 1 0 6.2Zm5-9.25a1.12 1.12 0 1 0 0 2.25 1.12 1.12 0 0 0 0-2.25ZM12 2.5c-2.58 0-2.9.01-3.92.06-3.47.16-5.4 2.08-5.56 5.56C2.51 9.1 2.5 9.42 2.5 12s.01 2.9.06 3.92c.16 3.47 2.08 5.4 5.56 5.56 1.02.05 1.34.06 3.92.06s2.9-.01 3.92-.06c3.47-.16 5.4-2.08 5.56-5.56.05-1.02.06-1.34.06-3.92s-.01-2.9-.06-3.92c-.16-3.47-2.08-5.4-5.56-5.56C14.9 2.51 14.58 2.5 12 2.5Z" />
  ),
};

const LABELS = site.ui.socialNames;

/** Round social icon links, opening in a new tab. Networks without a real URL yet are hidden. */
export default function SocialLinks({ social, className = "" }) {
  const links = Object.entries(social).filter(([, url]) => !isPlaceholder(url));
  if (links.length === 0) return null;

  return (
    <ul className={`flex flex-wrap items-center gap-2 ${className}`}>
      {links.map(([key, url]) => (
        <li key={key}>
          <a
            href={url}
            aria-label={LABELS[key]}
            title={LABELS[key]}
            target="_blank"
            rel="noopener noreferrer"
            className="flex size-11 cursor-pointer items-center justify-center rounded-full border border-line-strong text-fg/80 transition-[transform,color,border-color] duration-200 ease-quint hover:-translate-y-0.5 hover:border-fg/40 hover:text-fg"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" fillRule="evenodd" aria-hidden="true" className="size-4">
              {ICONS[key]}
            </svg>
          </a>
        </li>
      ))}
    </ul>
  );
}
