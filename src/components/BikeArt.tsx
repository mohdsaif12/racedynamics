/**
 * Stand-in artwork for the showcase stage.
 *
 * Build Manual §04 calls for a background-removed cut-out photograph per bike,
 * shot at an identical camera angle across a whole category. Until that
 * photography exists this draws an abstract side profile so the stage, the
 * transition and the lighting can all be built and reviewed for real. Swapping
 * it for <Image> later touches only this file and Bike.image.
 */
export default function BikeArt({
  tint,
  className,
  theme = "dark",
}: {
  tint: string;
  className?: string;
  /** "light" swaps the chassis greys so the art reads on white cards. */
  theme?: "dark" | "light";
}) {
  const wheel = theme === "light" ? "#E9E9EC" : "#100E0C";
  const rim = theme === "light" ? "#C9C9CF" : "#2A2622";
  const frame = theme === "light" ? "#A8A8B0" : "#3A3531";
  const block = theme === "light" ? "#D2D2D8" : "#241F1B";
  const fork = theme === "light" ? "#8E8E97" : "#6E655C";
  const hub = theme === "light" ? "#B4B4BC" : "#2A2622";

  return (
    <svg
      viewBox="0 0 420 230"
      className={className}
      role="img"
      aria-label="Placeholder motorcycle illustration"
      fill="none"
    >
      {/* rear wheel */}
      <circle cx="84" cy="158" r="52" fill={wheel} stroke={rim} strokeWidth="3" />
      <circle cx="84" cy="158" r="30" fill="none" stroke={tint} strokeWidth="4" />
      <circle cx="84" cy="158" r="8" fill={hub} />

      {/* front wheel */}
      <circle cx="336" cy="158" r="52" fill={wheel} stroke={rim} strokeWidth="3" />
      <circle cx="336" cy="158" r="30" fill="none" stroke={tint} strokeWidth="4" />
      <circle cx="336" cy="158" r="8" fill={hub} />

      {/* swingarm */}
      <path
        d="M84 158 L176 146"
        stroke={frame}
        strokeWidth="11"
        strokeLinecap="round"
      />

      {/* engine block */}
      <path
        d="M168 118 L232 114 L242 158 L182 164 Z"
        fill={block}
        stroke={frame}
        strokeWidth="2"
      />

      {/* exhaust */}
      <path
        d="M182 164 L128 176 L112 172"
        stroke={frame}
        strokeWidth="9"
        strokeLinecap="round"
      />

      {/* tank + seat unit — the tinted body panel */}
      <path
        d="M150 104 L188 78 L262 68 L296 84 L288 106 L232 114 L168 118 Z"
        fill={tint}
      />
      {/* highlight along the tank crown */}
      <path
        d="M188 78 L262 68 L296 84"
        stroke="rgba(255,255,255,0.28)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {/* tail */}
      <path
        d="M150 104 L112 96 L108 84 L156 88 Z"
        fill={tint}
        opacity="0.75"
      />

      {/* forks */}
      <path
        d="M336 158 L306 88"
        stroke={fork}
        strokeWidth="8"
        strokeLinecap="round"
      />
      {/* front fender */}
      <path
        d="M306 116 Q336 106 364 128"
        stroke={frame}
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* screen / cowl */}
      <path
        d="M296 84 L318 62 L338 70 L322 92 Z"
        fill={tint}
        opacity="0.85"
      />
      {/* headlight */}
      <ellipse cx="334" cy="86" rx="11" ry="8" fill="#F2E4C6" opacity="0.9" />

      {/* bar end */}
      <path
        d="M300 74 L282 62"
        stroke={fork}
        strokeWidth="6"
        strokeLinecap="round"
      />
    </svg>
  );
}
