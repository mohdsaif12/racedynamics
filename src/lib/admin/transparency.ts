/**
 * Whether an image file has any see-through pixels.
 *
 * The inventory stage floats the cover photo over a lit platform with no frame
 * around it, so a cover with its original background reads as a photo pasted
 * on the page. The client can't be expected to know that, so the upload form
 * checks and says so rather than letting it reach the live site.
 *
 * Advisory only — it never blocks an upload. A false negative (a cut-out whose
 * subject happens to touch all four edges) should not stop someone publishing
 * a bike.
 */
export async function hasTransparency(file: File): Promise<boolean> {
  // JPEG has no alpha channel at all, so there's nothing to sample.
  if (file.type === "image/jpeg" || file.type === "image/jpg") return false;

  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);

    // Downscale before sampling: a 4000px photo would mean 16M pixels of work
    // to answer a yes/no question, and transparency survives the scale.
    const size = 96;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return true; // can't tell — don't cry wolf

    ctx.drawImage(img, 0, 0, size, size);
    const { data } = ctx.getImageData(0, 0, size, size);

    let clear = 0;
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 250) clear++;
    }
    // A stray anti-aliased edge isn't a cut-out; a real one clears a good
    // part of the frame.
    return clear > size * size * 0.05;
  } catch {
    return true; // failed to decode — let the upload through unremarked
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
