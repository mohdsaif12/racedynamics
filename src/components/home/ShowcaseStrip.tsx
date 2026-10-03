import NextImage from "next/image";
import ShowcaseVideo from "@/components/home/ShowcaseVideo";

export type ShowcaseItem =
  | { kind: "video"; src: string; poster?: string }
  | { kind: "image"; src: string; alt: string };

/**
 * The tilted row of showcase cards. Display only — the cards autoplay and
 * can't be tapped, opened or controlled, at the client's request.
 *
 * Every card fits on screen at once, phone included — the row used to be a
 * sideways scroller of big cards with nothing to tell you it scrolled, so
 * most people only ever saw one or two.
 */
export default function ShowcaseStrip({ items }: { items: ShowcaseItem[] }) {
  const cols = Math.min(items.length, 5);

  return (
    <ul
      className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-center gap-2 px-3 sm:gap-5 sm:px-5 lg:px-10"
      style={{ "--cols": cols } as React.CSSProperties}
    >
      {items.map((item, i) => (
        <li
          key={item.src}
          className="w-[calc((100%_-_(var(--cols)_-_1)*0.5rem)/var(--cols))] sm:w-1/5 sm:max-w-56"
        >
          <div
            className={`pointer-events-none grid aspect-[3/5] w-full -rotate-[8deg] select-none place-items-center overflow-hidden bg-mist shadow-sm ${
              i % 2 ? "translate-y-[14px] sm:translate-y-[34px]" : ""
            }`}
          >
            {item.kind === "video" ? (
              <ShowcaseVideo src={item.src} poster={item.poster} />
            ) : (
              <NextImage
                src={item.src}
                alt={item.alt}
                width={1400}
                height={900}
                draggable={false}
                className="h-auto w-[165%] max-w-none"
              />
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
