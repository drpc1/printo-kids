import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";

const faviconPath = path.join(import.meta.dirname, "..", "public", "favicon.png");

test("public/favicon.png is a 32 by 32 PNG", () => {
  const bytes = readFileSync(faviconPath);
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(bytes.toString("ascii", 12, 16), "IHDR");
  assert.equal(bytes.readUInt32BE(16), 32);
  assert.equal(bytes.readUInt32BE(20), 32);
});

function assertPngSize(relativePath, width, height) {
  const bytes = readFileSync(path.join(import.meta.dirname, "..", relativePath));
  assert.equal(bytes.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
  assert.equal(bytes.toString("ascii", 12, 16), "IHDR");
  assert.equal(bytes.readUInt32BE(16), width);
  assert.equal(bytes.readUInt32BE(20), height);
}

test("apple-touch and manifest icons are the phase 2 PNG sizes", () => {
  assertPngSize("public/apple-touch-icon.png", 180, 180);
  assertPngSize("public/icon-192.png", 192, 192);
  assertPngSize("public/icon-512.png", 512, 512);
});

test("public/site.webmanifest keeps the site in the browser", () => {
  const manifest = JSON.parse(readFileSync(path.join(import.meta.dirname, "..", "public", "site.webmanifest"), "utf8"));
  assert.equal(manifest.name, "PrintoKids");
  assert.equal(manifest.short_name, "PrintoKids");
  assert.equal(manifest.start_url, "/");
  assert.equal(manifest.display, "browser");
  assert.deepEqual(manifest.icons, [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
  ]);
});

test("layout links the apple-touch icon and the manifest", () => {
  const layout = readFileSync(path.join(import.meta.dirname, "..", "src", "layouts", "Layout.astro"), "utf8");
  assert.match(layout, /rel="icon" type="image\/png" href="\/favicon\.png"/);
  assert.match(layout, /rel="apple-touch-icon" href="\/apple-touch-icon\.png"/);
  assert.match(layout, /rel="manifest" href="\/site\.webmanifest"/);
});
