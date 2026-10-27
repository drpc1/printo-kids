import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { catalogBadges } from "./catalog-badges.ts";

const PROFILES_KEY = "printo-kids:child-profiles";
const ACTIVE_KEY = "printo-kids:active-profile";

const ANIA = {
  id: "profile-ania",
  name: "Ania",
  character: "kot",
  level: "lat6",
  cards: {
    nonogram: { level: "sredni", category: "zwierzeta" },
    sudoku: { size: 6, level: "sredni", symbols: "shapes", colors: false },
  },
};
const ZOSIA = { id: "profile-zosia", name: "Zosia", character: "none", level: "lat3" };

function storage(profiles: unknown[], active?: string) {
  const data = new Map<string, string>();
  if (profiles.length > 0) {
    data.set(PROFILES_KEY, JSON.stringify({ profiles }));
  }
  if (active !== undefined) {
    data.set(ACTIVE_KEY, active);
  }
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
  };
}

void describe("catalogBadges", () => {
  void test("the chosen profile shows a badge on every card it used and none on the others", () => {
    const result = catalogBadges(storage([ANIA, ZOSIA], ANIA.id));
    assert.equal(result.profileName, "Ania");
    assert.deepEqual(result.badges, { labirynt: "poz. 4", sudoku: "6×6 · średni", nonogram: "średni" });
  });

  void test("the only profile counts as chosen without a stored choice", () => {
    const result = catalogBadges(storage([ZOSIA]));
    assert.equal(result.profileName, "Zosia");
    assert.deepEqual(result.badges, { labirynt: "poz. 1" });
  });

  void test("several profiles and no choice, or an explicit no profile, leave the catalog plain", () => {
    for (const result of [catalogBadges(storage([ANIA, ZOSIA])), catalogBadges(storage([ANIA, ZOSIA], "none"))]) {
      assert.deepEqual(result, { profileName: null, badges: {} });
    }
  });

  void test("no profiles at all leave the catalog plain", () => {
    assert.deepEqual(catalogBadges(storage([])), { profileName: null, badges: {} });
  });

  void test("a stored choice of a deleted profile falls back to the opening rule", () => {
    const result = catalogBadges(storage([ANIA], "profile-gone"));
    assert.equal(result.profileName, "Ania");
  });
});
