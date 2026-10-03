/**
 * The homepage's autoplaying showcase-card videos, served from /public — i.e.
 * Vercel's CDN — not from Supabase Storage.
 *
 * They used to stream straight out of the "bike videos" Supabase bucket at
 * full 720p (~35 MB for all five), so every visitor who scrolled past the
 * strip spent ~35 MB of the free plan's 5 GB monthly egress: a few hundred
 * visitors a month would have exhausted it. The cards are at most 224px
 * wide, so these are re-encoded copies at 432px wide (2x for retina), no
 * audio track (the cards are always muted) — ~9 MB total — each with a
 * poster frame so a card isn't blank while its video loads.
 *
 * To change a video: re-encode the new clip the same way, e.g.
 *   ffmpeg -i in.mp4 -an -vf "scale=432:-2,fps=30" -c:v libx264 -preset slow \
 *     -crf 30 -pix_fmt yuv420p -movflags +faststart public/showcase/N.mp4
 *   ffmpeg -ss 1 -i public/showcase/N.mp4 -frames:v 1 -q:v 4 public/showcase/N.jpg
 * and list it below.
 */
export type ShowcaseVideo = { src: string; poster: string };

const SHOWCASE = [1, 2, 3, 4, 5];

export async function getShowcaseVideos(): Promise<ShowcaseVideo[]> {
  return SHOWCASE.map((n) => ({
    src: `/showcase/${n}.mp4`,
    poster: `/showcase/${n}.jpg`,
  }));
}
