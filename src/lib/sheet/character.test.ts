import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { CHARACTER_CHOICES, characterRow, characterSheetSrc } from "./character.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const catalog = [
  { id: "none", label: "Bez postaci", src: null },
  { id: "dinozaur", label: "Dinozaur", src: "/characters/dinozaur.png" },
  { id: "jednorozec", label: "Jednorożec", src: "/characters/jednorozec.png" },
  { id: "kot", label: "Kot", src: "/characters/kot.png" },
  { id: "pies", label: "Pies", src: "/characters/pies.png" },
  { id: "rakieta", label: "Rakieta", src: "/characters/rakieta.png" },
  { id: "robot", label: "Robot", src: "/characters/robot.png" },
  { id: "samochodzik", label: "Samochodzik", src: "/characters/samochodzik.png" },
  { id: "smok", label: "Smok", src: "/characters/smok.png" },
  { id: "strazak", label: "Strażak", src: "/characters/strazak.png" },
  { id: "syrenka", label: "Syrenka", src: "/characters/syrenka.png" },
  { id: "wrozka", label: "Wróżka", src: "/characters/wrozka.png" },
] as const;

void describe("character catalog", () => {
  void test("lists Bez postaci and eleven characters in Polish alphabetical order", () => {
    assert.deepEqual(
      CHARACTER_CHOICES.map((row) => ({ id: row.id, label: row.label, src: row.src })),
      [...catalog],
    );
  });

  void test("returns the smok sheet file", () => {
    assert.equal(characterSheetSrc("smok"), "/characters/smok.png");
  });

  void test("an id outside the catalog is Bez postaci", () => {
    assert.equal(characterSheetSrc("poza-katalogiem"), null);

    const row = characterRow("poza-katalogiem");

    assert.equal(row.id, "none");
    assert.equal(row.label, "Bez postaci");
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
