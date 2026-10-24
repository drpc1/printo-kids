const MAX_FILE_BYTES = 8 * 1024 * 1024;
const MAX_EDGE = 512;
const HEADER_BYTES = 256;

const HEIC_BRANDS: ReadonlySet<string> = new Set(["heic", "heix", "hevc", "hevx"]);

export interface OwnImageCopy {
  href: string;
  width: number;
  height: number;
}

export interface OwnImageRefusal {
  reason: "size" | "type" | "decode";
}

export type OwnImageResult = OwnImageCopy | OwnImageRefusal;

/**
 * Copy a parent photo into a data URL for the sheet, or refuse the file.
 * Bytes are sniffed; the file name and the blob MIME type are ignored.
 * Gallery orientation, the 512 px long edge, and the PNG/JPEG choice happen here.
 * Decoding uses createImageBitmap and OffscreenCanvas when the page provides them.
 */
export async function copyOwnImage(file: Blob): Promise<OwnImageResult> {
  if (file.size > MAX_FILE_BYTES) {
    return { reason: "size" };
  }

  let header: Uint8Array;
  try {
    header = new Uint8Array(await file.slice(0, Math.min(file.size, HEADER_BYTES)).arrayBuffer());
  } catch {
    return { reason: "decode" };
  }
  if (!canDecode(header)) {
    return { reason: "type" };
  }

  return encodeCopy(file);
}

function canDecode(bytes: Uint8Array): boolean {
  return isJpeg(bytes) || isPng(bytes) || isWebp(bytes) || isHeic(bytes);
}

async function encodeCopy(file: Blob): Promise<OwnImageResult> {
  let bitmap: ImageBitmap | undefined;
  try {
    const resize = await resizeForDecode(file);
    if (resize !== undefined && "reason" in resize) {
      return resize;
    }
    bitmap = await globalThis.createImageBitmap(file, {
      imageOrientation: "from-image",
      ...resize,
    });
    if (bitmap.width < 1 || bitmap.height < 1) {
      return { reason: "decode" };
    }

    const scaled = scaleToMaxEdge(bitmap.width, bitmap.height);
    const canvas = new OffscreenCanvas(scaled.width, scaled.height);
    const context = canvas.getContext("2d");
    if (context === null) {
      return { reason: "decode" };
    }

    context.drawImage(bitmap, 0, 0, scaled.width, scaled.height);
    const pixels = context.getImageData(0, 0, scaled.width, scaled.height).data;
    const mime = hasTransparentPixel(pixels) ? "image/png" : "image/jpeg";
    const encoded = await canvas.convertToBlob({ type: mime });
    return {
      href: await blobToDataUrl(encoded, mime),
      width: scaled.width,
      height: scaled.height,
    };
  } catch {
    return { reason: "decode" };
  } finally {
    bitmap?.close();
  }
}

async function resizeForDecode(
  file: Blob,
): Promise<{ resizeWidth: number; resizeHeight: number } | { reason: "decode" } | undefined> {
  const bytes = new Uint8Array(await file.arrayBuffer());
  const display = jpegGallerySize(bytes) ?? pngSize(bytes) ?? webpSize(bytes) ?? heicSize(bytes);
  if (display === null) {
    return { reason: "decode" };
  }

  const scaled = scaleToMaxEdge(display.width, display.height);
  if (scaled.width === display.width && scaled.height === display.height) {
    return undefined;
  }

  return { resizeWidth: scaled.width, resizeHeight: scaled.height };
}

function jpegGallerySize(bytes: Uint8Array): { width: number; height: number } | null {
  if (!isJpeg(bytes)) {
    return null;
  }

  let offset = 2;
  let width = 0;
  let height = 0;
  let orientation = 1;
  let foundFrame = false;

  while (offset < bytes.length) {
    if (bytes[offset] !== 0xff) {
      return null;
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
      return null;
    }

    const segmentLength = (bytes[offset] << 8) | bytes[offset + 1];
    if (segmentLength < 2 || offset + segmentLength > bytes.length) {
      return null;
    }

    const payload = bytes.subarray(offset + 2, offset + segmentLength);
    if (marker === 0xe1) {
      const parsed = exifOrientation(payload);
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
    return null;
  }
  if (orientation >= 5 && orientation <= 8) {
    return { width: height, height: width };
  }
  return { width, height };
}

function exifOrientation(payload: Uint8Array): number | undefined {
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

function pngSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (!isPng(bytes) || bytes.length < 24 || !hasAscii(bytes, 12, "IHDR")) {
    return null;
  }

  const view = new DataView(bytes.buffer, bytes.byteOffset + 16, 8);
  const width = view.getUint32(0);
  const height = view.getUint32(4);
  if (width < 1 || height < 1) {
    return null;
  }
  return { width, height };
}

function scaleToMaxEdge(width: number, height: number): { width: number; height: number } {
  const longEdge = Math.max(width, height);
  if (longEdge <= MAX_EDGE) {
    return { width, height };
  }

  return {
    width: width === longEdge ? MAX_EDGE : Math.max(1, Math.round((width * MAX_EDGE) / longEdge)),
    height: height === longEdge ? MAX_EDGE : Math.max(1, Math.round((height * MAX_EDGE) / longEdge)),
  };
}

function hasTransparentPixel(pixels: Uint8ClampedArray): boolean {
  for (let index = 3; index < pixels.length; index += 4) {
    if (pixels[index] < 255) {
      return true;
    }
  }
  return false;
}

async function blobToDataUrl(blob: Blob, mime: "image/png" | "image/jpeg"): Promise<string> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  return `data:${mime};base64,${encodeBase64(bytes)}`;
}

function encodeBase64(bytes: Uint8Array): string {
  const parts: string[] = [];
  const chunkSize = 0x8000;
  for (let start = 0; start < bytes.length; start += chunkSize) {
    const end = Math.min(bytes.length, start + chunkSize);
    let chunk = "";
    for (let index = start; index < end; index += 1) {
      chunk += String.fromCharCode(bytes[index]);
    }
    parts.push(chunk);
  }
  return btoa(parts.join(""));
}

function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPng(bytes: Uint8Array): boolean {
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

function webpSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (!isWebp(bytes)) {
    return null;
  }

  let offset = 12;
  while (offset + 8 <= bytes.length) {
    const fourcc = readAscii(bytes, offset, 4);
    const size = readUint32LE(bytes, offset + 4);
    const payload = offset + 8;
    if (size > bytes.length - payload) {
      return null;
    }

    const display = webpChunkSize(fourcc, bytes, payload, size);
    if (display !== null) {
      return display;
    }

    offset = payload + size + (size % 2);
  }
  return null;
}

function webpChunkSize(
  fourcc: string,
  bytes: Uint8Array,
  payload: number,
  size: number,
): { width: number; height: number } | null {
  if (fourcc === "VP8 ") {
    return vp8Size(bytes, payload, size);
  }
  if (fourcc === "VP8L") {
    return vp8lSize(bytes, payload, size);
  }
  if (fourcc === "VP8X") {
    return vp8xSize(bytes, payload, size);
  }
  return null;
}

function vp8Size(bytes: Uint8Array, payload: number, size: number): { width: number; height: number } | null {
  if (size < 10 || (bytes[payload] & 1) !== 0) {
    return null;
  }
  if (bytes[payload + 3] !== 0x9d || bytes[payload + 4] !== 0x01 || bytes[payload + 5] !== 0x2a) {
    return null;
  }

  const width = readUint16LE(bytes, payload + 6) & 0x3fff;
  const height = readUint16LE(bytes, payload + 8) & 0x3fff;
  if (width < 1 || height < 1) {
    return null;
  }
  return { width, height };
}

function vp8lSize(bytes: Uint8Array, payload: number, size: number): { width: number; height: number } | null {
  if (size < 5 || bytes[payload] !== 0x2f) {
    return null;
  }

  const bits = bytes[payload + 1] | (bytes[payload + 2] << 8) | (bytes[payload + 3] << 16) | (bytes[payload + 4] << 24);
  const width = (bits & 0x3fff) + 1;
  const height = ((bits >>> 14) & 0x3fff) + 1;
  if (width < 1 || height < 1) {
    return null;
  }
  return { width, height };
}

function vp8xSize(bytes: Uint8Array, payload: number, size: number): { width: number; height: number } | null {
  if (size < 10) {
    return null;
  }

  const width = 1 + bytes[payload + 4] + (bytes[payload + 5] << 8) + (bytes[payload + 6] << 16);
  const height = 1 + bytes[payload + 7] + (bytes[payload + 8] << 8) + (bytes[payload + 9] << 16);
  if (width < 1 || height < 1) {
    return null;
  }
  return { width, height };
}

function heicSize(bytes: Uint8Array): { width: number; height: number } | null {
  if (!isHeic(bytes)) {
    return null;
  }

  let largest: { width: number; height: number } | null = null;
  let quarterTurn = false;
  for (let typeAt = 4; typeAt + 4 <= bytes.length; typeAt += 1) {
    const type = readAscii(bytes, typeAt, 4);
    if (type === "ispe" && typeAt + 16 <= bytes.length) {
      const width = readUint32BE(bytes, typeAt + 8);
      const height = readUint32BE(bytes, typeAt + 12);
      const longEdge = Math.max(width, height);
      const largestEdge = largest === null ? 0 : Math.max(largest.width, largest.height);
      if (width > 0 && height > 0 && longEdge >= largestEdge) {
        largest = { width, height };
      }
    }
    if (type === "irot") {
      const angle = bytes[typeAt + 8] & 0x03;
      if (angle === 1 || angle === 3) {
        quarterTurn = true;
      }
    }
  }

  if (largest === null) {
    return null;
  }
  if (quarterTurn) {
    return { width: largest.height, height: largest.width };
  }
  return largest;
}

function isWebp(bytes: Uint8Array): boolean {
  return hasAscii(bytes, 0, "RIFF") && hasAscii(bytes, 8, "WEBP");
}

function isHeic(bytes: Uint8Array): boolean {
  if (bytes.length < 12 || !hasAscii(bytes, 4, "ftyp")) {
    return false;
  }

  const declaredSize = readUint32BE(bytes, 0);
  const boxEnd = declaredSize === 0 ? bytes.length : Math.min(bytes.length, declaredSize);
  if (boxEnd < 12) {
    return false;
  }
  if (hasHeicBrand(bytes, 8)) {
    return true;
  }
  for (let offset = 16; offset + 4 <= boxEnd; offset += 4) {
    if (hasHeicBrand(bytes, offset)) {
      return true;
    }
  }
  return false;
}

function hasHeicBrand(bytes: Uint8Array, offset: number): boolean {
  return HEIC_BRANDS.has(readAscii(bytes, offset, 4));
}

function hasAscii(bytes: Uint8Array, offset: number, text: string): boolean {
  if (offset < 0 || offset + text.length > bytes.length) {
    return false;
  }
  return readAscii(bytes, offset, text.length) === text;
}

function readAscii(bytes: Uint8Array, offset: number, length: number): string {
  let text = "";
  for (let index = 0; index < length; index += 1) {
    text += String.fromCharCode(bytes[offset + index]);
  }
  return text;
}

function readUint32BE(bytes: Uint8Array, offset: number): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 4);
  return view.getUint32(0);
}

function readUint32LE(bytes: Uint8Array, offset: number): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 4);
  return view.getUint32(0, true);
}

function readUint16LE(bytes: Uint8Array, offset: number): number {
  const view = new DataView(bytes.buffer, bytes.byteOffset + offset, 2);
  return view.getUint16(0, true);
}
