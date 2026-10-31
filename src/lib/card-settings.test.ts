import assert from "node:assert/strict";
import { describe, test } from "node:test";
import {
  cardSettingsOf,
  CARD_SETTINGS_IDS,
  defaultCardSettings,
  parseCardSettings,
  withCardSettings,
  type CardSettingsMap,
} from "./card-settings.ts";

void describe("defaultCardSettings", () => {
  void test("every card has the defaults its page starts from today", () => {
    assert.deepEqual(defaultCardSettings("symetria"), { level: "lat5", colors: false, category: "wszystkie" });
    assert.deepEqual(defaultCardSettings("sekwencje"), { level: "lat5", colors: false });
    assert.deepEqual(defaultCardSettings("sudoku"), { size: 4, level: "latwy", symbols: "shapes", colors: false });
    assert.deepEqual(defaultCardSettings("nonogram"), { level: "sredni", category: "wszystkie" });
    assert.deepEqual(defaultCardSettings("dyktando"), { level: "lat6", category: "wszystkie" });
    assert.equal(CARD_SETTINGS_IDS.length, 5);
  });

  void test("a default is a copy, so changing it does not change the next default", () => {
    const first = defaultCardSettings("symetria");
    first.colors = true;
    assert.equal(defaultCardSettings("symetria").colors, false);
  });
});

void describe("parseCardSettings", () => {
  void test("anything that is not a record reads as an empty map", () => {
    for (const raw of [undefined, null, "x", 7, [], true]) {
      assert.deepEqual(parseCardSettings(raw), {});
    }
  });

  void test("a card that is absent stays absent, so the page starts from its defaults", () => {
    assert.deepEqual(parseCardSettings({ sekwencje: { level: "lat7" } }), {
      sekwencje: { level: "lat7", colors: false },
    });
  });

  void test("a bad field falls back to its own default and the rest of the card is kept", () => {
    assert.deepEqual(parseCardSettings({ symetria: { level: "lat9", colors: true, category: "kosmos" } }), {
      symetria: { level: "lat5", colors: true, category: "kosmos" },
    });
    assert.deepEqual(parseCardSettings({ dyktando: { level: "lat7", category: "ksztalty" } }), {
      dyktando: { level: "lat7", category: "ksztalty" },
    });
    assert.deepEqual(parseCardSettings({ symetria: { level: "lat7", colors: "tak", category: 3 } }), {
      symetria: { level: "lat7", colors: false, category: "wszystkie" },
    });
    assert.deepEqual(parseCardSettings({ sekwencje: { level: "lat6", colors: "tak" } }), {
      sekwencje: { level: "lat6", colors: false },
    });
  });

  void test("a card that is not a record is dropped", () => {
    assert.deepEqual(parseCardSettings({ nonogram: "x", dyktando: null, sekwencje: [] }), {});
  });

  void test("a level of another card is not accepted: the nonogram takes latwy, sredni, trudny", () => {
    assert.deepEqual(parseCardSettings({ nonogram: { level: "lat5" } }), {
      nonogram: { level: "sredni", category: "wszystkie" },
    });
    assert.deepEqual(parseCardSettings({ dyktando: { level: "lat4" } }), {
      dyktando: { level: "lat6", category: "wszystkie" },
    });
  });

  void test("unknown cards and the maze are ignored", () => {
    assert.deepEqual(parseCardSettings({ labirynt: { level: "lat3" }, inne: { a: 1 } }), {});
  });

  void test("a full valid map reads back unchanged", () => {
    const map: CardSettingsMap = {
      symetria: { level: "lat7", colors: true, category: "zwierzeta" },
      sekwencje: { level: "lat4", colors: false },
      sudoku: { size: 9, level: "trudny", symbols: "digits", colors: false },
      nonogram: { level: "latwy", category: "jedzenie" },
      dyktando: { level: "lat7", category: "budowle" },
    };
    assert.deepEqual(parseCardSettings(JSON.parse(JSON.stringify(map))), map);
  });
});

void describe("sudoku settings are normalized to a state the page can show", () => {
  void test("4×4 has only shapes and keeps the stored level, which the bar hides", () => {
    assert.deepEqual(parseCardSettings({ sudoku: { size: 4, level: "trudny", symbols: "digits", colors: true } }), {
      sudoku: { size: 4, level: "trudny", symbols: "shapes", colors: true },
    });
  });

  void test("digits keep the stored colors, so shapes bring them back as they were", () => {
    assert.deepEqual(parseCardSettings({ sudoku: { size: 6, level: "sredni", symbols: "digits", colors: true } }), {
      sudoku: { size: 6, level: "sredni", symbols: "digits", colors: true },
    });
  });

  void test("6×6 and 9×9 keep their level, symbols and colors", () => {
    assert.deepEqual(parseCardSettings({ sudoku: { size: 9, level: "trudny", symbols: "shapes", colors: true } }), {
      sudoku: { size: 9, level: "trudny", symbols: "shapes", colors: true },
    });
  });

  void test("an unknown size falls back to 4×4", () => {
    assert.deepEqual(parseCardSettings({ sudoku: { size: 5, level: "sredni" } }), {
      sudoku: { size: 4, level: "sredni", symbols: "shapes", colors: false },
    });
  });
});

void describe("withCardSettings and cardSettingsOf", () => {
  void test("a patch on a card the map does not have starts from the defaults", () => {
    const next = withCardSettings({}, "nonogram", { level: "trudny" });
    assert.deepEqual(next, { nonogram: { level: "trudny", category: "wszystkie" } });
  });

  void test("a patch keeps the other fields and the other cards, and does not change the input", () => {
    const map: CardSettingsMap = {
      symetria: { level: "lat6", colors: true, category: "kosmos" },
      sekwencje: { level: "lat4", colors: false },
    };
    const next = withCardSettings(map, "symetria", { level: "lat7" });
    assert.deepEqual(next, {
      symetria: { level: "lat7", colors: true, category: "kosmos" },
      sekwencje: { level: "lat4", colors: false },
    });
    assert.deepEqual(map.symetria, { level: "lat6", colors: true, category: "kosmos" });
  });

  void test("a sudoku patch that makes an impossible state is normalized", () => {
    const map: CardSettingsMap = { sudoku: { size: 9, level: "trudny", symbols: "shapes", colors: true } };
    assert.deepEqual(withCardSettings(map, "sudoku", { size: 4 }).sudoku, {
      size: 4,
      level: "trudny",
      symbols: "shapes",
      colors: true,
    });
    assert.deepEqual(withCardSettings(map, "sudoku", { symbols: "digits" }).sudoku, {
      size: 9,
      level: "trudny",
      symbols: "digits",
      colors: true,
    });
  });

  void test("cardSettingsOf returns the stored settings or the defaults", () => {
    assert.deepEqual(cardSettingsOf({}, "dyktando"), defaultCardSettings("dyktando"));
    assert.deepEqual(cardSettingsOf({ dyktando: { level: "lat7", category: "jedzenie" } }, "dyktando"), {
      level: "lat7",
      category: "jedzenie",
    });
  });
});

void describe("the symbols of a sudoku card", () => {
  void test("only shapes and digits are accepted; any other value falls back to shapes", () => {
    const read = (symbols: unknown): unknown =>
      (
        parseCardSettings({ sudoku: { size: 6, level: "sredni", symbols, colors: false } }).sudoku as {
          symbols: unknown;
        }
      ).symbols;

    assert.equal(read("digits"), "digits");
    assert.equal(read("shapes"), "shapes");
    assert.equal(read("hexagons"), "shapes");
    assert.equal(read(""), "shapes");
    assert.equal(read(6), "shapes");
    assert.equal(read(null), "shapes");
  });
});
