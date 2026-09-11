/**
 * The site's icon set.
 *
 * One shared geometry so they read as a family: 24px grid, no fill, 1.6
 * stroke in currentColor, round caps and joins. Every icon takes its colour
 * and size from the element around it.
 *
 * These exist because the site previously drew the same motorcycle glyph
 * beside every feature, which told the reader nothing — an icon that doesn't
 * mean its label is just decoration taking up the space where meaning should
 * be. Each one below is picked for the specific copy it sits next to.
 */

type IconProps = { className?: string; size?: number };

function Svg({
  className = "",
  size = 24,
  children,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      {children}
    </svg>
  );
}

/* ------------------------------------------------ selling / commerce ---- */

/** Outright sale — cash in hand, not consignment. */
export function RupeeNoteIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <path d="M9.5 9.5h5M9.5 12h5M13.5 9.5c1.2 0 1.8.8 1.8 1.6 0 1.1-.9 1.7-2.3 1.7h-1.2l3 3.2" />
    </Svg>
  );
}

/**
 * Deal done — the count of bikes actually sold. A rosette rather than the
 * handshake this replaced: two clasped hands need more detail than 30px can
 * carry, and it came out as a scribble.
 */
export function SoldBadgeIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <circle cx="12" cy="10" r="6.2" />
      <path d="m9.4 10 1.9 1.9 3.3-3.4" />
      <path d="m8.2 15.4-1.4 5.1 5.2-2.2 5.2 2.2-1.4-5.1" />
    </Svg>
  );
}

/** Best offer — the number on the ticket. */
export function PriceTagIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M20.5 12.5 12 21l-8.5-8.5V4H12l8.5 8.5Z" />
      <circle cx="8" cy="8" r="1.5" />
    </Svg>
  );
}

/** Hassle-free processing — the paperwork, handled. */
export function PaperworkIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="m9 14 2 2 3.5-3.5" />
    </Svg>
  );
}

/* ----------------------------------------------------- the database ----- */

/** Full inspection report. */
export function ChecklistIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <path d="m8 9 1.6 1.6L13 7.2" />
      <path d="m8 16 1.6 1.6L13 14.2" />
      <path d="M16 10h1M16 17h1" />
    </Svg>
  );
}

/** Compare two machines side by side. */
export function CompareIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="3" y="5" width="7" height="14" rx="1.4" />
      <rect x="14" y="5" width="7" height="14" rx="1.4" />
      <path d="M12 4v16" strokeDasharray="2 2.5" />
    </Svg>
  );
}

/** In-depth specifications for every bike. */
export function SpecsIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M4 7c0-1.7 3.6-3 8-3s8 1.3 8 3-3.6 3-8 3-8-1.3-8-3Z" />
      <path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3" />
      <path d="M4 7v10c0 1.7 3.6 3 8 3s8-1.3 8-3V7" />
    </Svg>
  );
}

/* -------------------------------------------------------- contact ------- */

export function PinIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.6" />
    </Svg>
  );
}

export function MailIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <rect x="2.5" y="5" width="19" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </Svg>
  );
}

export function PhoneIcon(p: IconProps) {
  return (
    <Svg {...p}>
      <path d="M6.5 3h3l1.5 4.5-2 1.4a12 12 0 0 0 5.1 5.1l1.4-2 4.5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.2 2 2 0 0 1 6.5 3Z" />
    </Svg>
  );
}

/* --------------------------------------------------------- social ------- */
/* Brand marks are filled, not stroked — they are recognised by silhouette. */

export function InstagramIcon({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className={className} aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.7" />
      <circle cx="17.2" cy="6.8" r="1.2" fill="currentColor" />
    </svg>
  );
}

export function FacebookIcon({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6A22 22 0 0 0 14.3 3.5c-2.4 0-4 1.45-4 4.1v2.3H7.6V13h2.7v8h3.2Z" />
    </svg>
  );
}

export function YoutubeIcon({ className = "", size = 18 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M21.6 7.2a2.5 2.5 0 0 0-1.75-1.77C18.28 5 12 5 12 5s-6.28 0-7.85.43A2.5 2.5 0 0 0 2.4 7.2 26 26 0 0 0 2 12a26 26 0 0 0 .4 4.8 2.5 2.5 0 0 0 1.75 1.77C5.72 19 12 19 12 19s6.28 0 7.85-.43a2.5 2.5 0 0 0 1.75-1.77A26 26 0 0 0 22 12a26 26 0 0 0-.4-4.8ZM10 15.1V8.9l5.2 3.1-5.2 3.1Z" />
    </svg>
  );
}

/* ----------------------------------------------------- testimonials ----- */

export function StarIcon({ className = "", size = 15 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="m12 3.5 2.6 5.5 5.9.85-4.3 4.2 1.02 6L12 17.2l-5.22 2.85 1.02-6-4.3-4.2 5.9-.85L12 3.5Z" />
    </svg>
  );
}

export function QuoteMarkIcon({ className = "", size = 40 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" fill="currentColor" className={className} aria-hidden>
      <path d="M20 12v9.5c0 7.4-4.2 12.4-11 14.5l-1.7-3.6c4-1.4 6.2-3.8 6.7-7.1H8V12h12Zm20 0v9.5c0 7.4-4.2 12.4-11 14.5l-1.7-3.6c4-1.4 6.2-3.8 6.7-7.1H28V12h12Z" />
    </svg>
  );
}
