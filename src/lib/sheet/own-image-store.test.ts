import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { readLastUsed, writeLastUsed, type LastUsedStorage } from "../last-used.ts";
import {
  drawnVisitCharacter,
  isOwnImageDataUrl,
  OWN_IMAGE_KEY,
  readOwnImage,
  recordBarCharacter,
  writeOwnImage,
  type OwnImageStorage,
} from "./own-image-store.ts";

const JPEG = "data:image/jpeg;base64,aaaa";
const PNG = "data:image/png;base64,bbbb";

interface StoredWrite {
  key: string;
  value: string;
}

void describe("readOwnImage", () => {
  void test("a missing key reads as no copy and does not write", () => {
    const storage = memoryStorage(null);
    assert.equal(readOwnImage(storage), null);
    assert.deepEqual(storage.writes, []);
  });

  void test("bad JSON and a non JPEG or PNG href read as no copy and do not write", () => {
    for (const raw of [
      "{",
      "[]",
      "{}",
      '{"href":1}',
      '{"href":"data:image/gif;base64,aaaa"}',
      '{"href":"https://example.test/a.png"}',
    ]) {
      const storage = memoryStorage(raw);
      assert.equal(readOwnImage(storage), null);
      assert.deepEqual(storage.writes, []);
    }
  });

  void test("a JPEG or PNG data URL reads back", () => {
    assert.equal(readOwnImage(memoryStorage(JSON.stringify({ href: JPEG }))), JPEG);
    assert.equal(readOwnImage(memoryStorage(JSON.stringify({ href: PNG }))), PNG);
  });
});

void describe("writeOwnImage", () => {
  void test("a thrown write returns failure and leaves the previous copy", () => {
    const storage = memoryStorage(JSON.stringify({ href: JPEG }));
    storage.throwOnWrite = true;

    assert.equal(writeOwnImage(storage, PNG), false);
    assert.equal(readOwnImage(storage), JPEG);
  });

  void test("a href that is not a JPEG or PNG data URL is not stored", () => {
    const storage = memoryStorage(JSON.stringify({ href: JPEG }));
    assert.equal(writeOwnImage(storage, "data:image/gif;base64,aaaa"), false);
    assert.equal(readOwnImage(storage), JPEG);
    assert.deepEqual(storage.writes, []);
  });

  void test("a kept href is the character id's neighbor, not the id itself", () => {
    const storage = memoryStorage(null);
    assert.equal(writeOwnImage(storage, JPEG), true);
    assert.equal(readOwnImage(storage), JPEG);
    assert.equal(storage.writes[0]?.value.includes('"character"'), false);
  });
});

void describe("recordBarCharacter", () => {
  void test("choosing Kot leaves the device copy and records last-used only without an active profile", () => {
    const storage = memoryStorage(JSON.stringify({ href: JPEG }));
    writeLastUsed(storage, { character: "wlasne", level: "lat5" });
    storage.writes.length = 0;

    recordBarCharacter(storage, null, "kot", "lat6");

    assert.equal(readOwnImage(storage), JPEG);
    assert.deepEqual(readLastUsed(storage, ["none", "kot", "wlasne"]), { character: "kot", level: "lat6", cards: {} });
    assert.equal(
      storage.writes.some((write) => write.key === OWN_IMAGE_KEY),
      false,
    );
  });

  void test("an active profile does not record last-used and still leaves the device copy", () => {
    const storage = memoryStorage(JSON.stringify({ href: JPEG }));
    writeLastUsed(storage, { character: "wlasne", level: "lat5" });
    storage.writes.length = 0;

    recordBarCharacter(storage, "ala", "kot", "lat6");

    assert.equal(readOwnImage(storage), JPEG);
    assert.deepEqual(readLastUsed(storage, ["none", "kot", "wlasne"]), {
      character: "wlasne",
      level: "lat5",
      cards: {},
    });
    assert.deepEqual(storage.writes, []);
  });
});

void describe("drawnVisitCharacter", () => {
  void test("wlasne without a drawable copy is none and nothing is written", () => {
    const storage = memoryStorage("{");
    writeLastUsed(storage, { character: "wlasne", level: "lat7" });
    const before = storage.writes.length;

    assert.deepEqual(drawnVisitCharacter(storage, null, "wlasne"), { character: "none", href: null });
    assert.equal(storage.writes.length, before);
    assert.equal(readLastUsed(storage, ["none", "wlasne"]).character, "wlasne");
  });

  void test("no active profile draws the device copy", () => {
    const storage = memoryStorage(JSON.stringify({ href: PNG }));
    assert.deepEqual(drawnVisitCharacter(storage, null, "wlasne"), { character: "wlasne", href: PNG });
  });

  void test("an active catalog favorite is drawn even when a device copy exists", () => {
    const storage = memoryStorage(JSON.stringify({ href: PNG }));
    assert.deepEqual(drawnVisitCharacter(storage, { character: "kot" }, "wlasne"), { character: "kot", href: null });
    assert.equal(readOwnImage(storage), PNG);
  });

  void test("an active profile snapshot is drawn instead of a later device copy", () => {
    const storage = memoryStorage(JSON.stringify({ href: PNG }));
    assert.deepEqual(drawnVisitCharacter(storage, { character: "wlasne", image: JPEG }, "kot"), {
      character: "wlasne",
      href: JPEG,
    });
  });
});

function memoryStorage(
  stored: string | null,
): OwnImageStorage & LastUsedStorage & { writes: StoredWrite[]; throwOnWrite: boolean } {
  const items = new Map<string, string>();
  const writes: StoredWrite[] = [];
  if (stored !== null) {
    items.set(OWN_IMAGE_KEY, stored);
  }

  return {
    writes,
    throwOnWrite: false,
    getItem(key: string): string | null {
      return items.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      if (this.throwOnWrite && key === OWN_IMAGE_KEY) {
        throw new Error("setItem blocked");
      }
      writes.push({ key, value });
      items.set(key, value);
    },
  };
}

void describe("the device copy key and the shape of a stored href", () => {
  void test("the copy lives under the key earlier visits used, so an existing photo is still found", () => {
    assert.equal(OWN_IMAGE_KEY, "printo-kids:own-image");
    const storage = memoryStorage(null);
    writeOwnImage(storage, JPEG);

    assert.deepEqual(storage.writes, [{ key: "printo-kids:own-image", value: JSON.stringify({ href: JPEG }) }]);
  });

  void test("only a whole JPEG or PNG data URL is an own image: no text before, after or inside, no padding of three", () => {
    for (const good of [
      JPEG,
      PNG,
      "data:image/png;base64,AZaz09+/",
      "data:image/png;base64,aa==",
      "data:image/png;base64,aaa=",
    ]) {
      assert.equal(isOwnImageDataUrl(good), true, good);
    }
    for (const bad of [
      "x" + JPEG,
      JPEG + "!",
      JPEG + " ",
      JPEG + "\n",
      "data:image/png;base64,",
      "data:image/png;base64,aaa===",
      "data:image/webp;base64,aaaa",
      "data:image/png;base64,aa aa",
      "javascript:alert(1)",
      "",
    ]) {
      assert.equal(isOwnImageDataUrl(bad), false, bad);
    }
  });

  void test("something that is not a string is not an own image, even when it prints as one", () => {
    for (const value of [null, undefined, 5, {}, [JPEG], { toString: () => JPEG }]) {
      assert.equal(isOwnImageDataUrl(value), false);
    }
    assert.equal(readOwnImage(memoryStorage(JSON.stringify({ href: [JPEG] }))), null);
  });

  void test("a stored href with text around it reads as no copy, and is not written", () => {
    assert.equal(readOwnImage(memoryStorage(JSON.stringify({ href: JPEG + "!" }))), null);
    assert.equal(readOwnImage(memoryStorage(JSON.stringify({ href: "x" + JPEG }))), null);
    const storage = memoryStorage(null);
    assert.equal(writeOwnImage(storage, JPEG + "!"), false);
    assert.deepEqual(storage.writes, []);
  });
});

void describe("drawnVisitCharacter picks only what it may draw", () => {
  void test("an active catalog character with an image field is still the catalog character", () => {
    const storage = memoryStorage(null);

    assert.deepEqual(drawnVisitCharacter(storage, { character: "kot", image: JPEG }, "wlasne"), {
      character: "kot",
      href: null,
    });
  });

  void test("an active own image without a drawable snapshot is none, whatever the device holds", () => {
    const storage = memoryStorage(JSON.stringify({ href: PNG }));

    for (const active of [
      { character: "wlasne" },
      { character: "wlasne", image: "https://example.test/a.png" },
      { character: "wlasne", image: JPEG + "!" },
    ]) {
      assert.deepEqual(drawnVisitCharacter(storage, active, "kot"), { character: "none", href: null });
    }
  });

  void test("with nobody active a catalog character from last-used is drawn as it is, even when a device copy exists", () => {
    const storage = memoryStorage(JSON.stringify({ href: PNG }));

    assert.deepEqual(drawnVisitCharacter(storage, null, "kot"), { character: "kot", href: null });
    assert.deepEqual(drawnVisitCharacter(storage, null, "none"), { character: "none", href: null });
    assert.deepEqual(drawnVisitCharacter(memoryStorage(null), null, "kot"), { character: "kot", href: null });
  });
});
