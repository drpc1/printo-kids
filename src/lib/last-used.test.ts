import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { readLastUsed, writeLastUsed, type LastUsed, type LastUsedStorage } from "./last-used.ts";

const KEY = "printo-kids:last-used";
const ALLOWED = ["none", "samochodzik", "rakieta", "dinozaur"];

interface StoredWrite {
  key: string;
  value: string;
}

void describe("readLastUsed", () => {
  void test("a missing key reads none and lat5 and does not write", () => {
    assertStoredRead(null, { character: "none", level: "lat5" });
  });

  void test("an empty string reads none and lat5 and does not write", () => {
    assertStoredRead("", { character: "none", level: "lat5" });
  });

  void test("invalid JSON reads none and lat5 and does not write", () => {
    assertStoredRead("{", { character: "none", level: "lat5" });
  });

  void test('a bare JSON string "rakieta" reads none and lat5 and does not write', () => {
    assertStoredRead('"rakieta"', { character: "none", level: "lat5" });
  });

  void test("a character outside the allow-list reads none and keeps the stored level", () => {
    assertStoredRead('{"character":"smok","level":"lat3"}', { character: "none", level: "lat3" });
  });

  void test("a stored none reads none and does not write", () => {
    assertStoredRead('{"character":"none","level":"lat5"}', { character: "none", level: "lat5" });
  });

  void test("a stored samochodzik reads samochodzik and does not write", () => {
    assertStoredRead('{"character":"samochodzik","level":"lat5"}', { character: "samochodzik", level: "lat5" });
  });

  void test("a stored rakieta reads rakieta and does not write", () => {
    assertStoredRead('{"character":"rakieta","level":"lat5"}', { character: "rakieta", level: "lat5" });
  });

  void test("a stored dinozaur reads dinozaur and does not write", () => {
    assertStoredRead('{"character":"dinozaur","level":"lat5"}', { character: "dinozaur", level: "lat5" });
  });

  void test("an old record without level keeps the character and reads lat5", () => {
    assertStoredRead('{"character":"rakieta"}', { character: "rakieta", level: "lat5" });
  });

  void test("an unknown level keeps the character and reads lat5", () => {
    assertStoredRead('{"character":"rakieta","level":"lat9"}', { character: "rakieta", level: "lat5" });
    assertStoredRead('{"character":"rakieta","level":6}', { character: "rakieta", level: "lat5" });
  });

  void test("a stored level from the table reads back", () => {
    assertStoredRead('{"character":"none","level":"nastolatek"}', { character: "none", level: "nastolatek" });
  });

  void test("a throwing getItem reads none and lat5 and does not write", () => {
    let writes = 0;
    const storage: LastUsedStorage = {
      getItem(): string | null {
        throw new Error("getItem blocked");
      },
      setItem(): void {
        writes += 1;
        throw new Error("setItem blocked");
      },
    };

    assert.deepEqual(readLastUsed(storage, ALLOWED), { character: "none", level: "lat5" });
    assert.equal(writes, 0);
  });
});

void describe("readLastUsed with the caller's list", () => {
  void test("keeps wlasne when that id is allowed, and a data URL is not an id", () => {
    const allowed = [...ALLOWED, "wlasne"];
    const wlasne = memoryStorage('{"character":"wlasne","level":"lat6"}');
    assert.deepEqual(readLastUsed(wlasne, allowed), { character: "wlasne", level: "lat6" });
    assert.deepEqual(wlasne.writes, []);

    const dataUrl = memoryStorage('{"character":"data:image/png;base64,aaaa","level":"lat6"}');
    assert.deepEqual(readLastUsed(dataUrl, allowed), { character: "none", level: "lat6" });
    assert.deepEqual(dataUrl.writes, []);
  });
});

void describe("writeLastUsed", () => {
  void test("a throwing setItem returns normally", () => {
    const storage: LastUsedStorage = {
      getItem(): string | null {
        return null;
      },
      setItem(): void {
        throw new Error("setItem blocked");
      },
    };

    assert.doesNotThrow(() => {
      writeLastUsed(storage, { character: "rakieta", level: "lat5" });
    });
  });

  void test("writing character and level reads each value back", () => {
    const storage = memoryStorage(null);

    writeLastUsed(storage, { character: "none", level: "lat5" });
    assert.deepEqual(readLastUsed(storage, ALLOWED), { character: "none", level: "lat5" });

    writeLastUsed(storage, { character: "rakieta", level: "lat6" });
    assert.deepEqual(readLastUsed(storage, ALLOWED), { character: "rakieta", level: "lat6" });
    assert.deepEqual(storage.writes, [
      { key: KEY, value: '{"character":"none","level":"lat5"}' },
      { key: KEY, value: '{"character":"rakieta","level":"lat6"}' },
    ]);
  });
});

function assertStoredRead(stored: string | null, expected: LastUsed): void {
  const storage = memoryStorage(stored);

  assert.deepEqual(readLastUsed(storage, ALLOWED), expected);
  assert.deepEqual(storage.writes, []);
}

function memoryStorage(stored: string | null): LastUsedStorage & { writes: StoredWrite[] } {
  const items = new Map<string, string>();
  const writes: StoredWrite[] = [];
  if (stored !== null) {
    items.set(KEY, stored);
  }

  return {
    writes,
    getItem(key: string): string | null {
      return items.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      writes.push({ key, value });
      items.set(key, value);
    },
  };
}
