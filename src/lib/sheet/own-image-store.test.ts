import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { readLastUsed, writeLastUsed, type LastUsedStorage } from "../last-used.ts";
import {
  drawnVisitCharacter,
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
