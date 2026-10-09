import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";
import { CHARACTER_CHOICES, characterSheetSrc } from "./character.ts";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

void describe("characterSheetSrc", () => {
  void test("the four catalog ids keep their labels and sheet files", () => {
    assert.deepEqual(
      CHARACTER_CHOICES.map((row) => ({ id: row.id, label: row.label, src: row.src })),
      [
        { id: "none", label: "Bez postaci", src: null },
        { id: "samochodzik", label: "Samochodzik", src: "/characters/samochodzik.png" },
        { id: "rakieta", label: "Rakieta", src: "/characters/rakieta.png" },
        { id: "dinozaur", label: "Dinozaur", src: "/characters/dinozaur.png" },
      ],
    );
    assert.equal(characterSheetSrc("none"), null);
    assert.equal(characterSheetSrc("samochodzik"), "/characters/samochodzik.png");
    assert.equal(characterSheetSrc("rakieta"), "/characters/rakieta.png");
    assert.equal(characterSheetSrc("dinozaur"), "/characters/dinozaur.png");
  });

  void test("a string outside the four ids is not a character", () => {
    assert.equal(characterSheetSrc("smok"), null);
  });

  void test("the worksheet generator calls characterSheetSrc and does not repeat the file paths", () => {
    const generator = readRepoFile("src/components/WorksheetGenerator.tsx");

    assert.equal(generator.includes("/characters/samochodzik.png"), false);
    assert.equal(generator.includes("/characters/rakieta.png"), false);
    assert.equal(generator.includes("/characters/dinozaur.png"), false);
    assert.equal(generator.includes("characterSheetSrc("), true);
  });
});

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}
