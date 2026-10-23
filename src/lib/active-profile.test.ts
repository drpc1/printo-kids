import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  clearActiveProfile,
  readActiveProfile,
  writeActiveProfile,
  type ActiveProfileStorage,
} from "./active-profile.ts";

const KEY = "printo-kids:active-profile";

void describe("readActiveProfile", () => {
  void test("a missing key reads null", () => {
    assert.equal(readActiveProfile(memoryStorage(null)), null);
  });

  void test("a stored profile id reads back as that id", () => {
    assert.equal(readActiveProfile(memoryStorage("z1")), "z1");
  });

  void test('the stored "none" reads back as "none"', () => {
    assert.equal(readActiveProfile(memoryStorage("none")), "none");
  });

  void test("an empty string reads null", () => {
    assert.equal(readActiveProfile(memoryStorage("")), null);
  });

  void test("a throwing getItem reads null", () => {
    const storage = blockedStorage();

    assert.equal(readActiveProfile(storage), null);
  });
});

void describe("writeActiveProfile", () => {
  void test("a profile id is stored under the key and reads back", () => {
    const storage = memoryStorage(null);

    writeActiveProfile(storage, "z1");

    assert.equal(storage.items.get(KEY), "z1");
    assert.equal(readActiveProfile(storage), "z1");
  });

  void test('"none" is stored and reads back', () => {
    const storage = memoryStorage("z1");

    writeActiveProfile(storage, "none");

    assert.equal(readActiveProfile(storage), "none");
  });

  void test("a throwing setItem does not throw", () => {
    assert.doesNotThrow(() => {
      writeActiveProfile(blockedStorage(), "z1");
    });
  });
});

void describe("clearActiveProfile", () => {
  void test("clearing removes the stored value", () => {
    const storage = memoryStorage("z1");

    clearActiveProfile(storage);

    assert.equal(storage.items.has(KEY), false);
    assert.equal(readActiveProfile(storage), null);
  });

  void test("a throwing removeItem does not throw", () => {
    assert.doesNotThrow(() => {
      clearActiveProfile(blockedStorage());
    });
  });
});

function memoryStorage(storedValue: string | null): ActiveProfileStorage & { items: Map<string, string> } {
  const items = new Map<string, string>();
  if (storedValue !== null) {
    items.set(KEY, storedValue);
  }

  return {
    items,
    getItem(key: string): string | null {
      return items.get(key) ?? null;
    },
    setItem(key: string, value: string): void {
      items.set(key, value);
    },
    removeItem(key: string): void {
      items.delete(key);
    },
  };
}

function blockedStorage(): ActiveProfileStorage {
  return {
    getItem(): string | null {
      throw new Error("getItem blocked");
    },
    setItem(): void {
      throw new Error("setItem blocked");
    },
    removeItem(): void {
      throw new Error("removeItem blocked");
    },
  };
}
