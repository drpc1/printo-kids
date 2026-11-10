// Shrinks character images to 512 px WebP (q85, alpha q90) in public/characters/ (GitHub 343).
// Source PNGs (any size) go in context/ideas/postacie/<id>.png; output is public/characters/<id>.webp.
// A new character: drop its PNG into the source folder and run: node scripts/characters-webp.mjs
// Resize only, no cropping, so contentLeft / contentRight in src/lib/sheet/character.ts stay fractions of the side.
import { mkdirSync, readdirSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import sharp from "sharp";

const SRC = fileURLToPath(new URL("../context/ideas/postacie/", import.meta.url));
const OUT = fileURLToPath(new URL("../public/characters/", import.meta.url));
const SIZE = 512;

mkdirSync(OUT, { recursive: true });
for (const file of readdirSync(SRC).filter((f) => f.endsWith(".png"))) {
  const name = file.replace(/\.png$/, "");
  await sharp(SRC + file)
    .resize(SIZE, SIZE, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 85, alphaQuality: 90 })
    .toFile(`${OUT}${name}.webp`);
  console.log(`${name}.webp`);
}
