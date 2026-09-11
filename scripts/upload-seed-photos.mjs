/**
 * Uploads every photo in public/bikes/ into the Supabase "bikes" storage
 * bucket, keeping the filenames exactly as they are — which is what the
 * seeded bike_images rows in 0003_seed.sql point at.
 *
 * Without this, a freshly-seeded database has 19 bikes whose photos all 400,
 * because the rows reference files that were only ever in this repo.
 *
 * Storage writes are admin-only (see 0002_storage.sql), so this signs in as
 * an admin account rather than using the anon key on its own. Credentials are
 * passed as arguments so nothing extra ends up on disk:
 *
 *   node scripts/upload-seed-photos.mjs you@example.com "your-password"
 *
 * Safe to re-run: existing files are overwritten, not duplicated.
 */
import { createClient } from "@supabase/supabase-js";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(HERE, "..");

const CONTENT_TYPES = {
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".avif": "image/avif",
};

/** Reads .env.local by hand — this runs outside Next, so nothing loads it. */
async function readEnvLocal() {
  const raw = await readFile(path.join(ROOT, ".env.local"), "utf8");
  const env = {};
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) env[m[1]] = m[2].trim().replace(/^["']|["']$/g, "");
  }
  return env;
}

async function uploadDir({ supabase, bucket, dir }) {
  const files = (await readdir(dir)).filter((f) =>
    Object.hasOwn(CONTENT_TYPES, path.extname(f).toLowerCase()),
  );

  if (files.length === 0) {
    console.log(`  (no images in ${dir})`);
    return { ok: 0, failed: 0 };
  }

  let ok = 0;
  let failed = 0;

  for (const name of files) {
    const body = await readFile(path.join(dir, name));
    const { error } = await supabase.storage.from(bucket).upload(name, body, {
      contentType: CONTENT_TYPES[path.extname(name).toLowerCase()],
      cacheControl: "31536000",
      upsert: true,
    });

    if (error) {
      failed++;
      console.log(`  ✗ ${name} — ${error.message}`);
    } else {
      ok++;
      console.log(`  ✓ ${name}`);
    }
  }

  return { ok, failed };
}

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.error(
      'Usage: node scripts/upload-seed-photos.mjs <admin-email> "<password>"',
    );
    process.exit(1);
  }

  const env = await readEnvLocal();
  const url = env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    console.error("NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY missing from .env.local");
    process.exit(1);
  }

  const supabase = createClient(url, anon);
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  if (signInError) {
    console.error(`Sign-in failed: ${signInError.message}`);
    process.exit(1);
  }
  console.log(`Signed in as ${email}\n`);

  console.log("bikes bucket:");
  const bikes = await uploadDir({
    supabase,
    bucket: "bikes",
    dir: path.join(ROOT, "public", "bikes"),
  });

  console.log("\nowners bucket:");
  const owners = await uploadDir({
    supabase,
    bucket: "owners",
    dir: path.join(ROOT, "public", "owners"),
  });

  const failed = bikes.failed + owners.failed;
  console.log(`\nUploaded ${bikes.ok + owners.ok} file(s), ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
