import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { readLastUsed, writeLastUsed, type LastUsedStorage } from "./last-used.ts";

const KEY = "printo-kids:last-used";
const ALLOWED = ["none", "samochodzik", "rakieta", "dinozaur"];

interface StoredWrite {
  key: string;
  value: string;
}

void describe("readLastUsed", () => {
  void test("a missing key reads none and does not write", () => {
    assertStoredRead(null, "none");
  });

  void test("an empty string reads none and does not write", () => {
    assertStoredRead("", "none");
  });

  void test("invalid JSON reads none and does not write", () => {
    assertStoredRead("{", "none");
  });

  void test('a bare JSON string "rakieta" reads none and does not write', () => {
    assertStoredRead('"rakieta"', "none");
  });

  void test("a character outside the allow-list reads none and does not write", () => {
    assertStoredRead('{"character":"smok"}', "none");
  });

  void test("a stored none reads none and does not write", () => {
    assertStoredRead('{"character":"none"}', "none");
  });

  void test("a stored samochodzik reads samochodzik and does not write", () => {
    assertStoredRead('{"character":"samochodzik"}', "samochodzik");
  });

  void test("a stored rakieta reads rakieta and does not write", () => {
    assertStoredRead('{"character":"rakieta"}', "rakieta");
  });

  void test("a stored dinozaur reads dinozaur and does not write", () => {
    assertStoredRead('{"character":"dinozaur"}', "dinozaur");
  });

  void test("a throwing getItem reads none and does not write", () => {
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

    assert.equal(readLastUsed(storage, ALLOWED), "none");
    assert.equal(writes, 0);
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
      writeLastUsed(storage, "rakieta");
    });
  });

  void test("writing none and rakieta reads each value back", () => {
    const storage = memoryStorage(null);

    writeLastUsed(storage, "none");
    assert.equal(readLastUsed(storage, ALLOWED), "none");

    writeLastUsed(storage, "rakieta");
    assert.equal(readLastUsed(storage, ALLOWED), "rakieta");
    assert.deepEqual(storage.writes, [
      { key: KEY, value: '{"character":"none"}' },
      { key: KEY, value: '{"character":"rakieta"}' },
    ]);
  });
});

function assertStoredRead(stored: string | null, expected: string): void {
  const storage = memoryStorage(stored);

  assert.equal(readLastUsed(storage, ALLOWED), expected);
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
