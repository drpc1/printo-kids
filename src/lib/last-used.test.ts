import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { readLastUsed, writeLastUsed, writeLastUsedCards, type LastUsed, type LastUsedStorage } from "./last-used.ts";

const KEY = "printo-kids:last-used";
const ALLOWED = ["none", "samochodzik", "rakieta", "dinozaur"];

interface StoredWrite {
  key: string;
  value: string;
}

void describe("readLastUsed", () => {
  void test("a missing key reads none and no cards and does not write", () => {
    assertStoredRead(null, { character: "none" });
  });

  void test("an empty string reads none and no cards and does not write", () => {
    assertStoredRead("", { character: "none" });
  });

  void test("invalid JSON reads none and no cards and does not write", () => {
    assertStoredRead("{", { character: "none" });
  });

  void test('a bare JSON string "rakieta" reads none and no cards and does not write', () => {
    assertStoredRead('"rakieta"', { character: "none" });
  });

  void test("a character outside the allow-list reads none and keeps the stored cards", () => {
    assertStoredRead('{"character":"smok","cards":{"labirynt":{"level":"lat3"}}}', {
      character: "none",
      cards: { labirynt: { level: "lat3" } },
    });
  });

  void test("a stored none reads none and does not write", () => {
    assertStoredRead('{"character":"none"}', { character: "none" });
  });

  void test("a stored samochodzik reads samochodzik and does not write", () => {
    assertStoredRead('{"character":"samochodzik"}', { character: "samochodzik" });
  });

  void test("a stored rakieta reads rakieta and does not write", () => {
    assertStoredRead('{"character":"rakieta"}', { character: "rakieta" });
  });

  void test("a stored dinozaur reads dinozaur and does not write", () => {
    assertStoredRead('{"character":"dinozaur"}', { character: "dinozaur" });
  });

  void test("a throwing getItem reads none and no cards and does not write", () => {
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

    assert.deepEqual(readLastUsed(storage, ALLOWED), { character: "none", cards: {} });
    assert.equal(writes, 0);
  });
});

void describe("readLastUsed with the caller's list", () => {
  void test("keeps wlasne when that id is allowed, and a data URL is not an id", () => {
    const allowed = [...ALLOWED, "wlasne"];
    const wlasne = memoryStorage('{"character":"wlasne"}');
    assert.deepEqual(readLastUsed(wlasne, allowed), { character: "wlasne", cards: {} });
    assert.deepEqual(wlasne.writes, []);

    const dataUrl = memoryStorage('{"character":"data:image/png;base64,aaaa"}');
    assert.deepEqual(readLastUsed(dataUrl, allowed), { character: "none", cards: {} });
    assert.deepEqual(dataUrl.writes, []);
  });
});

void describe("a legacy level moves to cards.labirynt on read", () => {
  void test("a stored level reads as the maze level", () => {
    assertStoredRead('{"character":"none","level":"nastolatek"}', {
      character: "none",
      cards: { labirynt: { level: "nastolatek" } },
    });
    assertStoredRead('{"character":"rakieta","level":"lat6"}', {
      character: "rakieta",
      cards: { labirynt: { level: "lat6" } },
    });
  });

  void test("a missing or unknown level does not create a maze entry", () => {
    assertStoredRead('{"character":"rakieta"}', { character: "rakieta" });
    assertStoredRead('{"character":"rakieta","level":"lat9"}', { character: "rakieta" });
    assertStoredRead('{"character":"rakieta","level":6}', { character: "rakieta" });
  });

  void test("the legacy level joins the cards that are stored", () => {
    assertStoredRead('{"character":"none","level":"lat6","cards":{"sekwencje":{"level":"lat7"}}}', {
      character: "none",
      cards: { sekwencje: { level: "lat7", colors: false }, labirynt: { level: "lat6" } },
    });
  });

  void test("a valid cards.labirynt wins over the legacy level", () => {
    assertStoredRead('{"character":"none","level":"lat6","cards":{"labirynt":{"level":"lat3"}}}', {
      character: "none",
      cards: { labirynt: { level: "lat3" } },
    });
  });

  void test("a cards.labirynt with a bad level falls back to a valid legacy level, then to the default", () => {
    assertStoredRead('{"character":"none","level":"lat6","cards":{"labirynt":{"level":"lat9"}}}', {
      character: "none",
      cards: { labirynt: { level: "lat6" } },
    });
    assertStoredRead('{"character":"none","cards":{"labirynt":{"level":"lat9"}}}', {
      character: "none",
      cards: { labirynt: { level: "lat5" } },
    });
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
      writeLastUsed(storage, { character: "rakieta" });
    });
  });

  void test("writing the character reads it back and stores no level", () => {
    const storage = memoryStorage(null);

    writeLastUsed(storage, { character: "none" });
    assert.deepEqual(readLastUsed(storage, ALLOWED), { character: "none", cards: {} });

    writeLastUsed(storage, { character: "rakieta" });
    assert.deepEqual(readLastUsed(storage, ALLOWED), { character: "rakieta", cards: {} });
    assert.deepEqual(storage.writes, [
      { key: KEY, value: '{"character":"none"}' },
      { key: KEY, value: '{"character":"rakieta"}' },
    ]);
  });

  void test("writing the character on a legacy record keeps its level as cards.labirynt and drops the old field", () => {
    const storage = memoryStorage('{"character":"none","level":"lat6"}');

    writeLastUsed(storage, { character: "rakieta" });

    assert.deepEqual(storage.writes, [
      { key: KEY, value: '{"character":"rakieta","cards":{"labirynt":{"level":"lat6"}}}' },
    ]);
    assert.deepEqual(readLastUsed(storage, ALLOWED), {
      character: "rakieta",
      cards: { labirynt: { level: "lat6" } },
    });
  });
});

void describe("card settings in last-used", () => {
  void test("an old record without cards reads empty cards", () => {
    assertStoredRead('{"character":"rakieta"}', { character: "rakieta" });
  });

  void test("stored cards read back and a bad field falls back inside its card", () => {
    assertStoredRead(
      '{"character":"none","cards":{"nonogram":{"level":"trudny","category":"zwierzeta"},"sekwencje":{"level":"lat99"}}}',
      {
        character: "none",
        cards: {
          nonogram: { level: "trudny", category: "zwierzeta" },
          sekwencje: { level: "lat5", colors: false },
        },
      },
    );
  });

  void test("writing the character keeps the stored cards", () => {
    const storage = memoryStorage('{"character":"none","cards":{"sekwencje":{"level":"lat7"}}}');
    writeLastUsed(storage, { character: "rakieta" });
    assert.deepEqual(readLastUsed(storage, ALLOWED), {
      character: "rakieta",
      cards: { sekwencje: { level: "lat7", colors: false } },
    });
  });

  void test("writing the cards keeps the stored character", () => {
    const storage = memoryStorage('{"character":"rakieta"}');
    assert.equal(writeLastUsedCards(storage, { dyktando: { level: "lat5", category: "wszystkie" } }), true);
    assert.deepEqual(readLastUsed(storage, ALLOWED), {
      character: "rakieta",
      cards: { dyktando: { level: "lat5", category: "wszystkie" } },
    });
  });

  void test("writing the cards over a legacy record drops the old level field", () => {
    const storage = memoryStorage('{"character":"rakieta","level":"lat6"}');
    const cards = readLastUsed(storage, ALLOWED).cards;

    assert.equal(writeLastUsedCards(storage, { ...cards, sekwencje: { level: "lat7", colors: false } }), true);

    const written = JSON.parse(storage.writes[0]?.value ?? "null") as Record<string, unknown>;
    assert.equal("level" in written, false);
    assert.deepEqual(readLastUsed(storage, ALLOWED), {
      character: "rakieta",
      cards: { labirynt: { level: "lat6" }, sekwencje: { level: "lat7", colors: false } },
    });
  });

  void test("a blocked store makes writeLastUsedCards return false", () => {
    const storage: LastUsedStorage = {
      getItem: () => null,
      setItem(): void {
        throw new Error("blocked");
      },
    };
    assert.equal(writeLastUsedCards(storage, {}), false);
  });
});

function assertStoredRead(
  stored: string | null,
  expected: Omit<LastUsed, "cards"> & { cards?: LastUsed["cards"] },
): void {
  const storage = memoryStorage(stored);

  assert.deepEqual(readLastUsed(storage, ALLOWED), { ...expected, cards: expected.cards ?? {} });
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
