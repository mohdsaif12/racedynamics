# Stand-in imagery — test build only

Every photograph under `public/bikes/`, `public/owners/` and `public/about/` is
a placeholder for the local test build. **None of it is cleared for launch.**

## Where it came from

- `panigale-v4`, `s1000rr`, `rsv4-factory` — RACEDYNAMICS RD-1000 renders
  supplied by the client. These three are the only images here that are yours.
- `ninja-1000sx`, `z900`, `about/workshop` — photos supplied by the client.
- Everything else — Wikimedia Commons, listed in `CREDITS.json` with the file
  title, author and licence. `CREDITS.json` covers the later batches only; the
  first nine were fetched before credit-writing was added, so treat the whole
  set as unattributed and replace it wholesale.

## Why it has to be replaced

The Commons files carry CC licences that require attribution, and several are
the wrong model for the listing they sit on (a Dyna standing in for a Fat Bob,
an Electra Glide for a Road Glide, and so on). They exist so the layout can be
reviewed against real machines, nothing more.

## Replacing them

Drop new photographs into `refs/` and run the cut-out pipeline:

```bash
pip install "rembg[cpu]"
```

Then background-remove, keep the largest connected shape, and place each bike
on a 1400x900 bottom-aligned transparent canvas so every machine meets the
platform on the same line. Save as WebP with alpha (`-c:v libwebp`, quality 82).

Filenames must match the `image:` paths in `src/lib/inventory.ts`.

## Known-imperfect cut-outs

- `r1300gs-adventure-2025` — a stray wheel fragment beside the machine
- `roadglide-117-2025` — rear three-quarter view rather than side-on
