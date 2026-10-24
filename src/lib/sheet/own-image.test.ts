import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { deflateSync, inflateSync } from "node:zlib";
import { copyOwnImage, type OwnImageCopy, type OwnImageResult } from "./own-image.ts";

const MAX_FILE_BYTES = 8 * 1024 * 1024;

/**
 * Node's test runner has no createImageBitmap or OffscreenCanvas.
 * Decisions stay in own-image.ts; this stand-in only decodes the fixtures below.
 * EXIF orientation is applied only when imageOrientation is "from-image".
 */

void describe("copyOwnImage", { concurrency: false }, () => {
  void test("scales a 1024 by 512 JPEG to 512 by 256 as a JPEG data URL", async () => {
    const result = await copyOwnImage(jpegFixture(1024, 512));

    assertCopy(result);
    assert.equal(result.width, 512);
    assert.equal(result.height, 256);
    assert.equal(result.href.startsWith("data:image/jpeg"), true);
  });

  void test("leaves a 200 by 100 JPEG at 200 by 100", async () => {
    const result = await copyOwnImage(jpegFixture(200, 100));

    assertCopy(result);
    assert.equal(result.width, 200);
    assert.equal(result.height, 100);
    assert.equal(result.href.startsWith("data:image/jpeg"), true);
  });

  void test("keeps one transparent PNG pixel in a PNG data URL", async () => {
    const pixels = Uint8ClampedArray.of(255, 0, 0, 255, 0, 255, 0, 128, 0, 0, 255, 255, 1, 2, 3, 255);
    const result = await copyOwnImage(new Blob([encodePng(pixels, 2, 2)], { type: "image/jpeg" }));

    assertCopy(result);
    assert.equal(result.href.startsWith("data:image/png"), true);
    assert.equal(result.width, 2);
    assert.equal(result.height, 2);
    assert.deepEqual(Array.from(decodeDataPng(result.href).pixels), Array.from(pixels));
  });

  void test("refuses a GIF as type even when the name and MIME say JPEG", async () => {
    const namedGif = new File([textBytes("GIF89a")], "portrait.jpg", { type: "image/jpeg" });

    assert.deepEqual(await copyOwnImage(namedGif), { reason: "type" });
    assert.deepEqual(await copyOwnImage(new Blob([textBytes("GIF87a")], { type: "image/png" })), { reason: "type" });
  });

  void test("refuses a file larger than 8 MiB as size without decoding it", async () => {
    const oversized = new Uint8Array(MAX_FILE_BYTES + 1);
    oversized[0] = 0xff;
    oversized[1] = 0xd8;
    oversized[2] = 0xff;

    assert.deepEqual(await copyOwnImage(new Blob([oversized], { type: "image/jpeg" })), { reason: "size" });
  });

  void test("a GIF of exactly 8 MiB is refused as type", async () => {
    const exact = new Uint8Array(MAX_FILE_BYTES);
    exact.set(textBytes("GIF89a"));

    assert.deepEqual(await copyOwnImage(new Blob([exact], { type: "image/jpeg" })), { reason: "type" });
  });

  void test("turns an orientation-6 landscape JPEG into gallery portrait", async () => {
    const result = await copyOwnImage(jpegFixture(40, 20, 6));

    assertCopy(result);
    assert.equal(result.width, 20);
    assert.equal(result.height, 40);
    assert.equal(result.href.startsWith("data:image/jpeg"), true);
  });

  void test("refuses HEIC brands when the decoder cannot open them", async () => {
    for (const brand of ["heic", "heix", "hevc", "hevx"]) {
      assert.deepEqual(await copyOwnImage(new Blob([ftyp(brand)], { type: "image/jpeg" })), { reason: "decode" });
    }

    assert.deepEqual(await copyOwnImage(new Blob([ftyp("mif1", ["heic"])])), { reason: "decode" });
    assert.deepEqual(await copyOwnImage(new Blob([ftyp("isom")])), { reason: "type" });
  });

  void test("refuses a JPEG or WebP the decoder cannot open", async () => {
    const webp = new Uint8Array(12);
    webp.set(textBytes("RIFF"));
    webp.set(textBytes("WEBP"), 8);

    assert.deepEqual(await copyOwnImage(new Blob([Uint8Array.of(0xff, 0xd8, 0xff, 0xd9)])), { reason: "decode" });
    assert.deepEqual(await copyOwnImage(new Blob([webp], { type: "image/png" })), { reason: "decode" });
    assert.deepEqual(await copyOwnImage(new Blob([textBytes("not-an-image")], { type: "image/jpeg" })), {
      reason: "type",
    });
  });
});

function assertCopy(result: OwnImageResult): asserts result is OwnImageCopy {
  if ("reason" in result) {
    assert.fail(`expected a copy, refused with ${result.reason}`);
  }
}

function jpegFixture(width: number, height: number, orientation?: number): Blob {
  const parts: Uint8Array<ArrayBuffer>[] = [Uint8Array.of(0xff, 0xd8)];
  if (orientation !== undefined) {
    parts.push(exifOrientationSegment(orientation));
  }
  parts.push(sofSegment(width, height));
  parts.push(Uint8Array.of(0xff, 0xd9));
  return new Blob(parts);
}

function sofSegment(width: number, height: number): Uint8Array<ArrayBuffer> {
  const segment = new Uint8Array(19);
  const view = new DataView(segment.buffer);
  segment[0] = 0xff;
  segment[1] = 0xc0;
  view.setUint16(2, 17);
  segment[4] = 8;
  view.setUint16(5, height);
  view.setUint16(7, width);
  segment[9] = 3;
  segment[10] = 1;
  segment[11] = 0x11;
  segment[12] = 0;
  segment[13] = 2;
  segment[14] = 0x11;
  segment[15] = 0;
  segment[16] = 3;
  segment[17] = 0x11;
  segment[18] = 0;
  return segment;
}

function exifOrientationSegment(orientation: number): Uint8Array<ArrayBuffer> {
  const tiff = new Uint8Array(26);
  const tiffView = new DataView(tiff.buffer);
  tiff[0] = 0x49;
  tiff[1] = 0x49;
  tiffView.setUint16(2, 42, true);
  tiffView.setUint32(4, 8, true);
  tiffView.setUint16(8, 1, true);
  tiffView.setUint16(10, 0x0112, true);
  tiffView.setUint16(12, 3, true);
  tiffView.setUint32(14, 1, true);
  tiffView.setUint16(18, orientation, true);
  tiffView.setUint32(22, 0, true);

  const exifHeader = Uint8Array.of(0x45, 0x78, 0x69, 0x66, 0x00, 0x00);
  const segment = new Uint8Array(4 + exifHeader.length + tiff.length);
  const segmentView = new DataView(segment.buffer);
  segment[0] = 0xff;
  segment[1] = 0xe1;
  segmentView.setUint16(2, segment.length - 2);
  segment.set(exifHeader, 4);
  segment.set(tiff, 4 + exifHeader.length);
  return segment;
}

function ftyp(major: string, compatible: readonly string[] = []): Uint8Array<ArrayBuffer> {
  const bytes = new Uint8Array(16 + compatible.length * 4);
  const view = new DataView(bytes.buffer);
  view.setUint32(0, bytes.length);
  writeAscii(bytes, 4, "ftyp");
  writeAscii(bytes, 8, major);
  let brandOffset = 16;
  for (const brand of compatible) {
    writeAscii(bytes, brandOffset, brand);
    brandOffset += 4;
  }
  return bytes;
}

function textBytes(text: string): Uint8Array<ArrayBuffer> {
  const encoded = new TextEncoder().encode(text);
  const copy = new Uint8Array(encoded.byteLength);
  copy.set(encoded);
  return copy;
}

function writeAscii(bytes: Uint8Array, offset: number, text: string): void {
  for (let index = 0; index < text.length; index += 1) {
    bytes[offset + index] = text.charCodeAt(index);
  }
}

function decodeDataPng(href: string): Raster {
  const marker = "data:image/png;base64,";
  assert.equal(href.startsWith(marker), true);
  return decodePng(base64ToBytes(href.slice(marker.length)));
}

function base64ToBytes(data: string): Uint8Array {
  const binary = atob(data);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

interface Raster {
  width: number;
  height: number;
  pixels: Uint8ClampedArray;
}

const rasterPixels = new WeakMap<object, Raster>();

function installOwnImagePolyfill(): void {
  globalThis.createImageBitmap = fixtureCreateImageBitmap;
  globalThis.OffscreenCanvas = FixtureOffscreenCanvas as unknown as typeof OffscreenCanvas;
}

function fixtureCreateImageBitmap(
  image: ImageBitmapSource,
  sxOrOptions?: number | ImageBitmapOptions,
  _sy?: number,
  _sw?: number,
  _sh?: number,
  bitmapOptions?: ImageBitmapOptions,
): Promise<ImageBitmap> {
  const options = typeof sxOrOptions === "number" ? bitmapOptions : sxOrOptions;
  return decodeFixture(image, options);
}

async function decodeFixture(image: ImageBitmapSource, options: ImageBitmapOptions | undefined): Promise<ImageBitmap> {
  if (!(image instanceof Blob)) {
    throw new Error("unsupported image source");
  }
  if (image.size > MAX_FILE_BYTES) {
    throw new Error("fixture decoder was asked to decode an oversized blob");
  }

  const bytes = new Uint8Array(await image.arrayBuffer());
  const applyOrientation = options?.imageOrientation === "from-image";
  if (isPngSignature(bytes)) {
    const decoded = decodePng(bytes);
    return rasterBitmap(decoded.width, decoded.height, decoded.pixels);
  }
  if (isJpegSignature(bytes)) {
    const frame = readJpeg(bytes);
    const oriented = orientedSize(frame.width, frame.height, applyOrientation ? frame.orientation : 1);
    return rasterBitmap(oriented.width, oriented.height, opaqueRgba(oriented.width, oriented.height));
  }
  throw new Error("unsupported image");
}

function isJpegSignature(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPngSignature(bytes: Uint8Array): boolean {
  return (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  );
}

function rasterBitmap(width: number, height: number, pixels: Uint8ClampedArray): ImageBitmap {
  const bitmap: ImageBitmap = {
    width,
    height,
    close() {
      rasterPixels.delete(bitmap);
    },
  };
  rasterPixels.set(bitmap, { width, height, pixels });
  return bitmap;
}

function orientedSize(width: number, height: number, orientation: number): { width: number; height: number } {
  if (orientation >= 5 && orientation <= 8) {
    return { width: height, height: width };
  }
  return { width, height };
}

function opaqueRgba(width: number, height: number): Uint8ClampedArray {
  const pixels = new Uint8ClampedArray(width * height * 4);
  for (let index = 3; index < pixels.length; index += 4) {
    pixels[index] = 255;
  }
  return pixels;
}

function readJpeg(bytes: Uint8Array): { width: number; height: number; orientation: number } {
  if (!isJpegSignature(bytes)) {
    throw new Error("jpeg");
  }

  let offset = 2;
  let width = 0;
  let height = 0;
  let orientation = 1;
  let foundFrame = false;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      throw new Error("jpeg marker");
    }
    while (offset < bytes.length && bytes[offset] === 0xff) {
      offset += 1;
    }
    if (offset >= bytes.length) {
      break;
    }
    const marker = bytes[offset];
    offset += 1;
    if (marker === 0xd9 || marker === 0xda) {
      break;
    }
    if (marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) {
      continue;
    }
    if (offset + 2 > bytes.length) {
      throw new Error("jpeg segment");
    }
    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      throw new Error("jpeg segment");
    }
    const payload = bytes.subarray(offset + 2, offset + segmentLength);
    if (marker === 0xe1) {
      const parsed = readExifOrientation(payload);
      if (parsed !== undefined) {
        orientation = parsed;
      }
    }
    if ((marker === 0xc0 || marker === 0xc1 || marker === 0xc2) && payload.length >= 5) {
      height = (payload[1] << 8) | payload[2];
      width = (payload[3] << 8) | payload[4];
      foundFrame = width > 0 && height > 0;
    }
    offset += segmentLength;
  }

  if (!foundFrame) {
    throw new Error("jpeg frame");
  }
  return { width, height, orientation };
}

function readExifOrientation(payload: Uint8Array): number | undefined {
  if (!hasAscii(payload, 0, "Exif\0\0") || payload.length < 14) {
    return undefined;
  }
  const tiff = payload.subarray(6);
  const littleEndian = tiff[0] === 0x49 && tiff[1] === 0x49;
  const bigEndian = tiff[0] === 0x4d && tiff[1] === 0x4d;
  if (!littleEndian && !bigEndian) {
    return undefined;
  }
  const view = new DataView(tiff.buffer, tiff.byteOffset, tiff.byteLength);
  if (view.getUint16(2, littleEndian) !== 42) {
    return undefined;
  }
  const ifdOffset = view.getUint32(4, littleEndian);
  if (ifdOffset + 2 > tiff.length) {
    return undefined;
  }
  const count = view.getUint16(ifdOffset, littleEndian);
  for (let index = 0; index < count; index += 1) {
    const entry = ifdOffset + 2 + index * 12;
    if (entry + 12 > tiff.length) {
      return undefined;
    }
    if (view.getUint16(entry, littleEndian) !== 0x0112) {
      continue;
    }
    return view.getUint16(entry + 8, littleEndian);
  }
  return undefined;
}

function hasAscii(bytes: Uint8Array, offset: number, text: string): boolean {
  if (offset < 0 || offset + text.length > bytes.length) {
    return false;
  }
  for (let index = 0; index < text.length; index += 1) {
    if (bytes[offset + index] !== text.charCodeAt(index)) {
      return false;
    }
  }
  return true;
}

class FixtureOffscreenCanvas {
  readonly width: number;
  readonly height: number;
  pixels: Uint8ClampedArray<ArrayBuffer>;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.pixels = new Uint8ClampedArray(width * height * 4);
  }

  getContext(kind: string): FixtureContext | null {
    if (kind !== "2d") {
      return null;
    }
    return new FixtureContext(this);
  }

  convertToBlob(options?: { type?: string }): Promise<Blob> {
    if (options?.type === "image/jpeg") {
      return Promise.resolve(new Blob([Uint8Array.of(0xff, 0xd8, 0xff, 0xd9)], { type: "image/jpeg" }));
    }
    return Promise.resolve(new Blob([encodePng(this.pixels, this.width, this.height)], { type: "image/png" }));
  }
}

class FixtureContext {
  private readonly canvas: FixtureOffscreenCanvas;

  constructor(canvas: FixtureOffscreenCanvas) {
    this.canvas = canvas;
  }

  drawImage(image: CanvasImageSource, _dx: number, _dy: number, dw?: number, dh?: number): void {
    const raster = rasterPixels.get(image);
    if (raster === undefined) {
      throw new Error("unsupported image");
    }
    const targetWidth = dw ?? raster.width;
    const targetHeight = dh ?? raster.height;
    this.canvas.pixels = scaleNearest(raster.pixels, raster.width, raster.height, targetWidth, targetHeight);
  }

  getImageData(_sx: number, _sy: number, _sw: number, _sh: number): ImageData {
    return {
      colorSpace: "srgb",
      data: this.canvas.pixels,
      height: this.canvas.height,
      width: this.canvas.width,
    };
  }
}

function scaleNearest(
  source: Uint8ClampedArray,
  sourceWidth: number,
  sourceHeight: number,
  targetWidth: number,
  targetHeight: number,
): Uint8ClampedArray<ArrayBuffer> {
  if (sourceWidth === targetWidth && sourceHeight === targetHeight) {
    const copy = new Uint8ClampedArray(source.length);
    copy.set(source);
    return copy;
  }
  const target = new Uint8ClampedArray(targetWidth * targetHeight * 4);
  for (let y = 0; y < targetHeight; y += 1) {
    const sourceY = Math.min(sourceHeight - 1, Math.floor((y * sourceHeight) / targetHeight));
    for (let x = 0; x < targetWidth; x += 1) {
      const sourceX = Math.min(sourceWidth - 1, Math.floor((x * sourceWidth) / targetWidth));
      const sourceIndex = (sourceY * sourceWidth + sourceX) * 4;
      const targetIndex = (y * targetWidth + x) * 4;
      target[targetIndex] = source[sourceIndex];
      target[targetIndex + 1] = source[sourceIndex + 1];
      target[targetIndex + 2] = source[sourceIndex + 2];
      target[targetIndex + 3] = source[sourceIndex + 3];
    }
  }
  return target;
}

const CRC_TABLE = buildCrcTable();

function buildCrcTable(): Uint32Array {
  const table = new Uint32Array(256);
  for (let value = 0; value < 256; value += 1) {
    let crc = value;
    for (let bit = 0; bit < 8; bit += 1) {
      if ((crc & 1) === 1) {
        crc = 0xedb88320 ^ (crc >>> 1);
      } else {
        crc >>>= 1;
      }
    }
    table[value] = crc;
  }
  return table;
}

function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc = (CRC_TABLE[(crc ^ byte) & 0xff] ^ (crc >>> 8)) >>> 0;
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function encodePng(pixels: Uint8ClampedArray, width: number, height: number): Uint8Array<ArrayBuffer> {
  const stride = width * 4;
  const raw = new Uint8Array((stride + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const row = y * (stride + 1);
    raw[row] = 0;
    raw.set(pixels.subarray(y * stride, (y + 1) * stride), row + 1);
  }

  const ihdr = new Uint8Array(13);
  const header = new DataView(ihdr.buffer);
  header.setUint32(0, width);
  header.setUint32(4, height);
  ihdr[8] = 8;
  ihdr[9] = 6;

  return concatBytes([
    Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10),
    pngChunk("IHDR", ihdr),
    pngChunk("IDAT", copyBytes(deflateSync(raw))),
    pngChunk("IEND", new Uint8Array()),
  ]);
}

function pngChunk(type: string, data: Uint8Array): Uint8Array<ArrayBuffer> {
  const typeBytes = textBytes(type);
  const chunk = new Uint8Array(12 + data.length);
  const view = new DataView(chunk.buffer);
  view.setUint32(0, data.length);
  chunk.set(typeBytes, 4);
  chunk.set(data, 8);
  view.setUint32(8 + data.length, crc32(chunk.subarray(4, 8 + data.length)));
  return chunk;
}

function decodePng(bytes: Uint8Array): Raster {
  if (!isPngSignature(bytes)) {
    throw new Error("png signature");
  }

  let offset = 8;
  let width = 0;
  let height = 0;
  let sawHeader = false;
  const idat: Uint8Array[] = [];

  while (offset + 8 <= bytes.length) {
    const length = new DataView(bytes.buffer, bytes.byteOffset + offset, 4).getUint32(0);
    const type = readAscii(bytes, offset + 4, 4);
    const dataStart = offset + 8;
    const dataEnd = dataStart + length;
    if (dataEnd + 4 > bytes.length) {
      throw new Error("png chunk");
    }
    const data = bytes.subarray(dataStart, dataEnd);
    if (type === "IHDR") {
      const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
      width = view.getUint32(0);
      height = view.getUint32(4);
      if (data[8] !== 8 || data[9] !== 6 || data[10] !== 0) {
        throw new Error("png format");
      }
      sawHeader = true;
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
    offset = dataEnd + 4;
  }

  if (!sawHeader || width < 1 || height < 1) {
    throw new Error("png header");
  }

  const raw = inflateSync(concatBytes(idat));
  const pixels = new Uint8ClampedArray(width * height * 4);
  const stride = width * 4;
  for (let y = 0; y < height; y += 1) {
    const row = y * (stride + 1);
    if (raw[row] !== 0) {
      throw new Error("png filter");
    }
    pixels.set(raw.subarray(row + 1, row + 1 + stride), y * stride);
  }
  return { width, height, pixels };
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  let text = "";
  for (let index = 0; index < length; index += 1) {
    text += String.fromCharCode(bytes[offset + index]);
  }
  return text;
}

function copyBytes(bytes: Uint8Array): Uint8Array<ArrayBuffer> {
  const copy = new Uint8Array(bytes.byteLength);
  copy.set(bytes);
  return copy;
}

function concatBytes(parts: readonly Uint8Array[]): Uint8Array<ArrayBuffer> {
  let total = 0;
  for (const part of parts) {
    total += part.length;
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const part of parts) {
    out.set(part, offset);
    offset += part.length;
  }
  return out;
}

installOwnImagePolyfill();
