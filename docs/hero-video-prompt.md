# Hero sequence — video generation brief

Produces the source footage for the homepage scroll sequence (Build Manual §01),
which is then exported to a numbered WebP frame set and scrubbed on canvas.

---

## Non-negotiables

These four constraints matter more than anything aesthetic. The footage is
**scrubbed frame by frame under the user's finger**, not played — so:

1. **Locked-off camera.** Tripod. No pan, no zoom, no dolly, no handheld drift,
   no parallax. Any camera movement makes scrubbing feel like a mistake rather
   than a mechanism.
2. **One continuous shot.** No cuts, no dissolves, no scene changes.
3. **No text, logos, watermarks, badges or number plates.** The wordmark is HTML
   on top. Baked-in text cannot be translated or restyled and will fight the
   real type.
4. **No people.** No rider, no hands, no reflections of a crew. The bike is the
   subject.

Frame the bike **centred with generous headroom above it** — the overhead lamp
needs somewhere to live, and the wordmark overlays the upper-middle third.

---

## Master prompt (single 8-second shot)

Paste this as-is. Works for Veo, Sora, Kling, Runway, Hailuo, Luma.

```
Locked-off static camera on a tripod, single continuous 8-second shot, no camera
movement whatsoever.

A single superbike stands alone on a polished dark concrete floor in a large
empty service bay. Three-quarter front view from slightly below eye level. Deep
matte black surroundings, the far wall lost in darkness.

The shot begins almost entirely black — only a thin cold specular highlight
traces the top edge of the fuel tank and one fork leg, so the machine's mass is
sensed rather than seen.

A single industrial pendant lamp high above slowly ignites, warm sodium amber. A
hard cone of light opens downward and pools on the floor around the tyres. The
bike resolves out of the darkness: chrome catches the light, the tank paint
gains depth, fine dust drifts through the beam.

The headlight snaps on, blooming hot white. The engine starts — a faint heat
shimmer rises from the exhaust, the whole machine trembles almost
imperceptibly, then settles.

The bike pulls away from the camera, receding into the darkness at the back of
the bay, shrinking toward a vanishing point while directional motion blur
streaks along its flanks. Its red taillight stretches into a long thin streak
that fades. The overhead lamp cone lifts and narrows behind it.

The shot ends on an empty pool of amber light on bare concrete, dust still
settling, total darkness beyond.

Cinematic automotive commercial lighting, shallow depth of field, photoreal,
volumetric light shafts, film grain, anamorphic. No text, no logos, no people,
no camera motion.
```

### Negative prompt

```
camera movement, panning, zooming, dolly, handheld, shaky, cuts, jump cuts,
scene change, text, letters, words, logos, watermark, subtitles, number plate,
people, person, rider, hands, crowd, multiple motorcycles, cartoon, anime,
illustration, low quality, blurry, distorted wheels, warped frame, extra wheels,
melting geometry, daylight, bright background, white background
```

---

## Segmented route (more reliable)

Most models struggle to hold a four-beat narrative across one clip. If the
master prompt drifts, generate three clips against the same seed and reference
image, then concatenate. Each shares the non-negotiables above.

**Segment A — reveal (3s).** `Locked static camera. A superbike stands in a pitch-black service bay, barely visible as a thin rim highlight. An overhead industrial lamp slowly ignites in warm sodium amber, its cone opening downward and pooling on the concrete floor, revealing the bike in three-quarter front view. Dust drifts through the beam. The bike does not move.`

**Segment B — ignition (2s).** `Locked static camera. A superbike stands lit from above by a warm sodium overhead lamp in a dark service bay. Its headlight snaps on and blooms hot white. Heat shimmer rises from the exhaust pipes. The machine trembles faintly as the engine catches, then settles. The bike stays in place.`

**Segment C — departure (3s).** `Locked static camera. A lit superbike pulls away from the camera into the darkness at the back of an empty service bay, shrinking toward a vanishing point with directional motion blur along its flanks and a red taillight stretching into a fading streak. The overhead lamp cone lifts and narrows. The shot ends on an empty pool of amber light on bare concrete.`

Concatenate:

```bash
printf "file 'a.mp4'\nfile 'b.mp4'\nfile 'c.mp4'\n" > list.txt
ffmpeg -f concat -safe 0 -i list.txt -c copy hero.mp4
```

---

## Output settings

| Setting | Desktop | Mobile |
| --- | --- | --- |
| Aspect | 16:9 | 9:16 |
| Generate at | 1920×1080 | 1080×1920 |
| Export frames at | 1600×900 | 900×1600 |
| Duration | 6 s | 6 s |
| Frame rate | 25 fps → **150 frames** | 15 fps → **90 frames** |
| Seed | fix it, reuse across retries | same seed |

Generate the desktop pass first, get it approved, then run the mobile pass with
the same seed and reference frame so the two read as the same machine.

---

## Converting to WebP frames

From the project root, with `hero.mp4` alongside:

```bash
# Desktop — 150 frames
ffmpeg -i hero.mp4 -vf "fps=25,scale=1600:-2" \
  -c:v libwebp -quality 78 -compression_level 6 -preset picture \
  -an -fps_mode passthrough \
  public/hero/desktop/frame_%04d.webp

# Mobile — 90 frames
ffmpeg -i hero.mp4 -vf "fps=15,scale=900:-2" \
  -c:v libwebp -quality 74 -compression_level 6 -preset picture \
  -an -fps_mode passthrough \
  public/hero/mobile/frame_%04d.webp
```

Check the result:

```bash
ls public/hero/desktop | wc -l          # expect 150
du -sh public/hero/desktop              # target under 8 MB
```

If the clip runs longer than 6 s, trim before converting rather than dropping
the fps — uneven frame spacing shows up as stutter when scrubbing:

```bash
ffmpeg -i hero.mp4 -t 6 -c copy hero-6s.mp4
```

If the count comes out at 149 or 151, that's fine — `HeroSequence.tsx` reads
`FRAME_COUNT`; just update the constant to match what you actually have.

---

## Dropping it in

`src/components/HeroSequence.tsx` probes for `/hero/desktop/frame_0001.webp` on
mount. The moment that file exists the canvas scrubber takes over and the
placeholder composition disappears. Nothing else needs changing.

Adjust in that file if needed:

- `FRAME_COUNT` / `MOBILE_COUNT` — actual frame counts
- `h-[380svh]` on the wrapper — total scroll distance
- the `0.74` and `0.9` timeline positions — when the wordmark and CTAs appear,
  as a fraction of scroll progress

---

## Fallback if generation never lands

A real shoot beats generated footage for a business selling real machines —
buyers notice. If you go that route the same spec applies: locked tripod, one
continuous take, overhead key light only, bike on a paddock stand so the lean
angle stays constant, and a black seamless or the actual workshop bay.
