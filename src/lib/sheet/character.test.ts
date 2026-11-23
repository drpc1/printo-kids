import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import {
  ALLOWED_CHARACTER_IDS,
  CHARACTER_CHOICES,
  characterChoice,
  characterContentLeft,
  characterContentRight,
  characterPickRowsOn,
  characterRow,
  characterSheetSrc,
  OWN_IMAGE_LABEL,
} from "./character.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const catalog = [
  { id: "none", label: "Brak", src: null },
  { id: "balwanek", label: "Bałwanek", src: "/characters/balwanek.webp" },
  { id: "mikolaj", label: "Mikołaj", src: "/characters/mikolaj.webp" },
  { id: "renifer", label: "Renifer", src: "/characters/renifer.webp" },
  { id: "pingwin", label: "Pingwin", src: "/characters/pingwin.webp" },
  { id: "dinozaur", label: "Dinozaur", src: "/characters/dinozaur.webp" },
  { id: "jednorozec", label: "Jednorożec", src: "/characters/jednorozec.webp" },
  { id: "kot", label: "Kot", src: "/characters/kot.webp" },
  { id: "pies", label: "Pies", src: "/characters/pies.webp" },
  { id: "rakieta", label: "Rakieta", src: "/characters/rakieta.webp" },
  { id: "robot", label: "Robot", src: "/characters/robot.webp" },
  { id: "samochodzik", label: "Samochodzik", src: "/characters/samochodzik.webp" },
  { id: "smok", label: "Smok", src: "/characters/smok.webp" },
  { id: "strazak", label: "Strażak", src: "/characters/strazak.webp" },
  { id: "syrenka", label: "Syrenka", src: "/characters/syrenka.webp" },
  { id: "wrozka", label: "Wróżka", src: "/characters/wrozka.webp" },
] as const;

void describe("character catalog", () => {
  void test("lists Brak, the four seasonal characters, then eleven characters in Polish alphabetical order", () => {
    assert.deepEqual(
      CHARACTER_CHOICES.map((row) => ({ id: row.id, label: row.label, src: row.src })),
      [...catalog],
    );
  });

  void test("returns the smok sheet file", () => {
    assert.equal(characterSheetSrc("smok"), "/characters/smok.webp");
  });

  void test("catalog drawings start after the empty left margin of the square file", () => {
    assert.equal(characterContentLeft("kot"), 208 / 1024);
    assert.equal(characterContentLeft("syrenka"), 366 / 1024);
    assert.equal(characterContentLeft("none"), 0);
    assert.equal(characterContentLeft("wlasne"), 0);
  });

  void test("an id outside the catalog is Brak", () => {
    assert.equal(characterSheetSrc("poza-katalogiem"), null);

    const row = characterRow("poza-katalogiem");

    assert.equal(row.id, "none");
    assert.equal(row.label, "Brak");
    assert.equal(row.src, null);
  });

  void test("every catalog sheet file exists under public", () => {
    for (const row of CHARACTER_CHOICES) {
      if (row.src === null) {
        continue;
      }

      const relative = row.src.startsWith("/") ? row.src.slice(1) : row.src;
      assert.equal(existsSync(path.join(repoRoot, "public", relative)), true, row.src);
    }
  });

  void test("the worksheet generator calls characterSheetSrc and does not repeat catalog file paths", () => {
    const generator = readRepoFile("src/components/WorksheetGenerator.tsx");

    assert.equal(generator.includes("characterSheetSrc("), true);

    for (const row of CHARACTER_CHOICES) {
      if (row.src === null) {
        continue;
      }

      assert.equal(generator.includes(row.src), false, row.src);
    }
  });
});

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

void describe("the label the bar shows", () => {
  void test("every catalog id has its own row, so the bar names the chosen character", () => {
    for (const entry of catalog) {
      assert.equal(characterRow(entry.id).label, entry.label, entry.id);
    }
  });

  void test("a parent photo is labelled Własny obrazek", () => {
    assert.equal(OWN_IMAGE_LABEL, "Własny obrazek");
  });
});

void describe("characterChoice", () => {
  void test("keeps a catalog id and turns anything else into none", () => {
    assert.equal(characterChoice("kot"), "kot");
    assert.equal(characterChoice("none"), "none");
    assert.equal(characterChoice("kangur"), "none");
    assert.equal(characterChoice(""), "none");
    assert.equal(characterChoice("data:image/png;base64,aaaa"), "none");
  });

  void test("the allowed ids are the catalog ids in catalog order, then wlasne", () => {
    assert.deepEqual(ALLOWED_CHARACTER_IDS, [...CHARACTER_CHOICES.map((option) => option.id), "wlasne"]);
    assert.equal(ALLOWED_CHARACTER_IDS[0], "none");
    const catalogIds: readonly string[] = CHARACTER_CHOICES.map((row) => row.id);
    assert.equal(catalogIds.includes("wlasne"), false);
    assert.equal(characterSheetSrc("wlasne"), null);
    assert.equal(characterChoice("wlasne"), "wlasne");
  });
});

void describe("character drawing margins", () => {
  void test("every catalog character has a drawing narrower than its square file, and own images have no margins", () => {
    for (const row of CHARACTER_CHOICES) {
      if (row.src === null) {
        continue;
      }
      const left = characterContentLeft(row.id);
      const right = characterContentRight(row.id);
      assert.ok(left > 0 && right > 0, `${row.id} has margins on both sides`);
      assert.ok(1 - left - right > 0 && 1 - left - right <= 1, `${row.id} drawing fits the file`);
    }
    assert.equal(characterContentRight("wlasne"), 0);
    assert.equal(characterContentRight("none"), 0);
    assert.equal(characterContentRight("unknown"), 0);
  });

  void test("the right margin of a few characters matches the measured file", () => {
    assert.equal(characterContentRight("dinozaur"), 212 / 1024);
    assert.equal(characterContentRight("samochodzik"), 189 / 1024);
  });
});

void describe("the pick list and the windows of the seasonal characters", () => {
  const ids = (today: Date, selected = "none") => characterPickRowsOn(today, selected).rows.map((row) => row.id);

  void test("15-30 November: Mikołaj and Renifer only (Bałwanek waits for winter), 14 rows, a line after Renifer", () => {
    for (const day of [new Date(2026, 10, 15), new Date(2026, 10, 30, 23, 59)]) {
      const pick = characterPickRowsOn(day, "none");
      assert.equal(pick.rows.length, 14, day.toDateString());
      assert.deepEqual(ids(day).slice(0, 3), ["none", "mikolaj", "renifer"], day.toDateString());
      assert.equal(pick.separatorAfter, "renifer", day.toDateString());
    }
  });

  void test("1 December - 6 January: Christmas and winter characters, 16 rows, a line after Pingwin", () => {
    for (const day of [new Date(2026, 11, 1), new Date(2026, 11, 31), new Date(2027, 0, 6)]) {
      const pick = characterPickRowsOn(day, "none");
      assert.equal(pick.rows.length, 16, day.toDateString());
      assert.deepEqual(ids(day).slice(0, 5), ["none", "balwanek", "mikolaj", "renifer", "pingwin"], day.toDateString());
      assert.equal(pick.separatorAfter, "pingwin", day.toDateString());
    }
  });

  void test("7 January - end of February: only Bałwanek and Pingwin, 14 rows, also on 29 February", () => {
    for (const day of [new Date(2027, 0, 7), new Date(2027, 1, 28), new Date(2028, 1, 29)]) {
      const pick = characterPickRowsOn(day, "none");
      assert.equal(pick.rows.length, 14, day.toDateString());
      assert.deepEqual(ids(day).slice(0, 3), ["none", "balwanek", "pingwin"], day.toDateString());
      assert.equal(pick.separatorAfter, "pingwin", day.toDateString());
    }
  });

  void test("outside every window the list has 12 rows and no line", () => {
    for (const day of [new Date(2026, 10, 14), new Date(2027, 2, 1), new Date(2026, 6, 1)]) {
      const pick = characterPickRowsOn(day, "none");
      assert.equal(pick.rows.length, 12, day.toDateString());
      assert.equal(pick.separatorAfter, null, day.toDateString());
    }
  });

  void test("a selected Christmas character keeps its row outside the window, with the line under it", () => {
    const summer = new Date(2026, 6, 1);
    assert.deepEqual(ids(summer, "mikolaj").slice(0, 3), ["none", "mikolaj", "dinozaur"]);
    assert.equal(characterPickRowsOn(summer, "mikolaj").separatorAfter, "mikolaj");
  });

  void test("the catalog does not depend on the date: a saved Christmas character is never Brak", () => {
    assert.equal(characterChoice("mikolaj"), "mikolaj");
    assert.equal(characterSheetSrc("renifer"), "/characters/renifer.webp");
    assert.equal(ALLOWED_CHARACTER_IDS.includes("balwanek"), true);
    assert.equal(characterChoice("pingwin"), "pingwin");
  });
});
