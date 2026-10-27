import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const WORKSHEET_HOME = "src/components/GeneratorShell.astro";
const MAZE_PAGE = "src/pages/labirynt.astro";
const WORKSHEET_GENERATOR = "src/components/WorksheetGenerator.tsx";
const CHARACTER_CHOICE_CONTROL = "src/components/CharacterChoiceControl.tsx";
const SYMMETRY_PAGE = "src/pages/symetria.astro";
const SYMMETRY_GENERATOR = "src/components/SymmetryGenerator.tsx";
const SEQUENCE_PAGE = "src/pages/sekwencje.astro";
const SEQUENCE_GENERATOR = "src/components/SequenceGenerator.tsx";
const SUDOKU_PAGE = "src/pages/sudoku.astro";
const SUDOKU_GENERATOR = "src/components/SudokuGenerator.tsx";
const DICTATION_PAGE = "src/pages/dyktando.astro";
const DICTATION_GENERATOR = "src/components/DictationGenerator.tsx";
const NONOGRAM_PAGE = "src/pages/nonogram.astro";
const NONOGRAM_GENERATOR = "src/components/NonogramGenerator.tsx";
const NONOGRAM_SIMPLE_SHEET = "src/components/NonogramSimpleSheet.tsx";
const SPEECH_BAND_COMPONENT = "src/components/SpeechBand.tsx";
const SPEECH_LIB = "src/lib/sheet/speech.ts";
const GLOBAL_CSS = "src/styles/global.css";

void describe("print contract", () => {
  void test("worksheet @page is A4 with margin 0", () => {
    const home = readRepoFile(WORKSHEET_HOME);
    assert.deepEqual(home.match(/@page\b/g), ["@page"]);

    const pageRule = extractBlock(home, "@page");
    assert.match(pageRule, /size:\s*A4\s*;/);
    assert.match(pageRule, /margin:\s*0\s*;/);
  });

  void test("global.css contains no @page", () => {
    const css = readRepoFile(GLOBAL_CSS);
    assert.equal(css.includes("@page"), false);
  });

  void test("the printed SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const generator = readRepoFile(WORKSHEET_GENERATOR);
    const svgClass = svgClassName(generator);

    assert.ok(svgClass.includes("print:w-[210mm]"));
    assert.ok(svgClass.includes("print:h-[297mm]"));
    assert.ok(svgClass.includes("print:overflow-hidden"));
  });

  void test("the printed SVG shrinks into the printable area when the browser adds printer margins", () => {
    // iOS print ignores @page margin: 0; without the clamp the 210 by 297 mm sheet spills onto a second page.
    const printCss = extractBlock(readRepoFile(WORKSHEET_HOME), "@media print");
    assert.match(printCss, /#worksheet-home svg\s*\{[^}]*max-width:\s*100%\s*;/);
    assert.match(printCss, /#worksheet-home svg\s*\{[^}]*max-height:\s*100vh\s*;/);
  });

  void test("print drops the screen background around the scaled-down sheet", () => {
    // Safari on iOS prints backgrounds, so the screen color showed as strips inside the printer margins.
    const printCss = extractBlock(readRepoFile(WORKSHEET_HOME), "@media print");
    assert.match(printCss, /html,\s*body\s*\{[^}]*background:\s*none\s*;/);
    assert.match(printCss, /#worksheet-home\.has-sheet\s*\{[^}]*background:\s*none\s*;/);
  });

  void test("print hides the heading, the purpose line, and the controls", () => {
    const home = readRepoFile(WORKSHEET_HOME);
    assert.match(home, /<h1\b/);
    assert.match(home, /<p\b/);

    const printCss = extractBlock(home, "@media print");
    assert.match(
      printCss,
      /#worksheet-home h1,\s*#worksheet-home p,\s*#worksheet-home a,\s*#worksheet-home button\s*\{[^}]*display:\s*none\s*;/,
    );

    const generator = readRepoFile(WORKSHEET_GENERATOR);
    assert.deepEqual(classNamesContaining(generator, "print:hidden"), [
      "flex w-full flex-col gap-3 print:hidden",
      "flex flex-col items-center gap-6 print:hidden",
      "max-h-[calc(100dvh-2rem)] print:hidden",
    ]);
    // The character list dialog moved to the shared control the maze page imports.
    assert.deepEqual(classNamesContaining(readRepoFile(CHARACTER_CHOICE_CONTROL), "print:hidden"), [
      "max-h-[calc(100dvh-2rem)] print:hidden",
    ]);
  });

  void test("the maze page lives under /labirynt and uses the shared shell", () => {
    const page = readRepoFile(MAZE_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<WorksheetGenerator\b/);
  });

  void test("the printed symmetry SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(SYMMETRY_GENERATOR));

    assert.ok(svgClass.includes("print:w-[210mm]"));
    assert.ok(svgClass.includes("print:h-[297mm]"));
    assert.ok(svgClass.includes("print:overflow-hidden"));
    // Without these the printed sheet could keep the screen ring, stay inline, or grow past one page.
    assert.ok(svgClass.includes("print:block"));
    assert.ok(svgClass.includes("print:max-h-[297mm]"));
    assert.ok(svgClass.includes("print:ring-0"));
  });

  void test("the symmetry SVG asks the printer to keep its colors", () => {
    const source = readRepoFile(SYMMETRY_GENERATOR);

    assert.match(source, /printColorAdjust:\s*"exact"/);
    assert.match(source, /WebkitPrintColorAdjust:\s*"exact"/);
  });

  void test("print hides the symmetry controls", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(SYMMETRY_GENERATOR), "print:hidden"), [
      "flex w-full flex-col gap-3 print:hidden",
      "flex flex-col items-center gap-6 print:hidden",
    ]);
  });

  void test("the symmetry page lives under /symetria and uses the shared shell", () => {
    const page = readRepoFile(SYMMETRY_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    // The island reads localStorage on its first render, so it must never render on the server.
    assert.match(page, /<SymmetryGenerator\s+client:only="react"\s*\/>/);
  });

  void test("the printed sequence SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(SEQUENCE_GENERATOR));

    assert.ok(svgClass.includes("print:w-[210mm]"));
    assert.ok(svgClass.includes("print:h-[297mm]"));
    assert.ok(svgClass.includes("print:overflow-hidden"));
    // Without these the printed sheet could keep the screen ring, stay inline, or grow past one page.
    assert.ok(svgClass.includes("print:block"));
    assert.ok(svgClass.includes("print:max-h-[297mm]"));
    assert.ok(svgClass.includes("print:ring-0"));
  });

  void test("print hides the sequence controls", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(SEQUENCE_GENERATOR), "print:hidden"), [
      "flex w-full flex-col gap-3 print:hidden",
      "flex flex-col items-center gap-6 print:hidden",
    ]);
  });

  void test("the sequence page lives under /sekwencje and uses the shared shell", () => {
    const page = readRepoFile(SEQUENCE_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    // The island reads localStorage on its first render, so it must never render on the server.
    assert.match(page, /<SequenceGenerator\s+client:only="react"\s*\/>/);
  });

  void test("the printed sudoku SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(SUDOKU_GENERATOR));

    assert.ok(svgClass.includes("print:w-[210mm]"));
    assert.ok(svgClass.includes("print:h-[297mm]"));
    assert.ok(svgClass.includes("print:overflow-hidden"));
    assert.ok(svgClass.includes("print:block"));
    assert.ok(svgClass.includes("print:max-h-[297mm]"));
    assert.ok(svgClass.includes("print:ring-0"));
  });

  void test("the sudoku SVG asks the printer to keep its colors", () => {
    const source = readRepoFile(SUDOKU_GENERATOR);

    assert.match(source, /printColorAdjust:\s*"exact"/);
    assert.match(source, /WebkitPrintColorAdjust:\s*"exact"/);
  });

  void test("print hides the sudoku controls", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(SUDOKU_GENERATOR), "print:hidden"), [
      "flex w-full flex-col gap-3 print:hidden",
      "flex flex-col items-center gap-6 print:hidden",
    ]);
  });

  void test("the sudoku choice dialog is hidden in print", () => {
    assert.deepEqual(classNamesContaining(readRepoFile("src/components/SudokuChoice.tsx"), "print:hidden"), [
      "max-h-[calc(100dvh-2rem)] print:hidden",
    ]);
  });

  void test("the sudoku page lives under /sudoku, uses the shared shell, and has no @page of its own", () => {
    const page = readRepoFile(SUDOKU_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<SudokuGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
  });

  void test("the printed dictation SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(DICTATION_GENERATOR));

    assert.ok(svgClass.includes("print:w-[210mm]"));
    assert.ok(svgClass.includes("print:h-[297mm]"));
    assert.ok(svgClass.includes("print:overflow-hidden"));
    assert.ok(svgClass.includes("print:block"));
    assert.ok(svgClass.includes("print:max-h-[297mm]"));
    assert.ok(svgClass.includes("print:ring-0"));
  });

  void test("print hides the dictation controls", () => {
    const generator = readRepoFile(DICTATION_GENERATOR);
    assert.deepEqual(classNamesContaining(generator, "print:hidden"), [
      "flex w-full flex-col gap-3 print:hidden",
      "flex flex-col items-center gap-6 print:hidden",
      "print:hidden",
    ]);
    // The stroke sits on the solution group. Prettier wraps the <g> tag, so the two fragments stay separate.
    assert.ok(generator.includes('className={cn("print:hidden")}') && generator.includes("data-solution"));
  });

  void test("the dictation page lives under /dyktando, uses the shared shell, and has no @page of its own", () => {
    const page = readRepoFile(DICTATION_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<DictationGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
  });

  void test("the printed nonogram SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(NONOGRAM_GENERATOR));

    assert.ok(svgClass.includes("print:w-[210mm]"));
    assert.ok(svgClass.includes("print:h-[297mm]"));
    assert.ok(svgClass.includes("print:overflow-hidden"));
    assert.ok(svgClass.includes("print:block"));
    assert.ok(svgClass.includes("print:max-h-[297mm]"));
    assert.ok(svgClass.includes("print:ring-0"));
  });

  void test("the nonogram SVG asks the printer to keep its colors", () => {
    const source = readRepoFile(NONOGRAM_GENERATOR);

    assert.match(source, /printColorAdjust:\s*"exact"/);
    assert.match(source, /WebkitPrintColorAdjust:\s*"exact"/);
  });

  void test("print hides the nonogram controls and the solution group", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(NONOGRAM_GENERATOR), "print:hidden"), [
      "flex w-full flex-col gap-3 print:hidden",
      "flex flex-col items-center gap-6 print:hidden",
      "print:hidden",
    ]);
    // The third one must sit on the solution group itself, so a switch left on never prints the answer.
    assert.ok(
      readRepoFile(NONOGRAM_GENERATOR).includes(
        '<g className={cn("print:hidden")} fill="var(--foreground)" data-solution>',
      ),
    );
  });

  void test("the printed chip nonogram SVG is 210mm wide and 297mm tall, keeps its colors, and hides its solution", () => {
    const source = readRepoFile(NONOGRAM_SIMPLE_SHEET);
    const svgClass = svgClassName(source);

    for (const token of [
      "print:w-[210mm]",
      "print:h-[297mm]",
      "print:overflow-hidden",
      "print:block",
      "print:max-h-[297mm]",
      "print:ring-0",
    ]) {
      assert.ok(svgClass.includes(token), token);
    }
    assert.match(source, /printColorAdjust:\s*"exact"/);
    assert.match(source, /WebkitPrintColorAdjust:\s*"exact"/);
    assert.deepEqual(classNamesContaining(source, "print:hidden"), ["print:hidden"]);
    assert.ok(source.includes('<g className={cn("print:hidden")} data-solution>'));
  });

  void test("the nonogram page lives under /nonogram, uses the shared shell, and has no @page of its own", () => {
    const page = readRepoFile(NONOGRAM_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<NonogramGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
  });

  void test("every card page except the maze has the Postać bar and draws the character beside the instruction", () => {
    for (const path of [
      SYMMETRY_GENERATOR,
      SEQUENCE_GENERATOR,
      SUDOKU_GENERATOR,
      NONOGRAM_GENERATOR,
      NONOGRAM_SIMPLE_SHEET,
      DICTATION_GENERATOR,
    ]) {
      const source = readRepoFile(path);
      assert.match(source, /<CharacterInstruction\b/, `${path} draws the speech band`);
      assert.doesNotMatch(
        source,
        /It has no (colors or )?character (bar|controls)/,
        `${path} still says it has no bar`,
      );
    }
    for (const path of [
      SYMMETRY_GENERATOR,
      SEQUENCE_GENERATOR,
      SUDOKU_GENERATOR,
      NONOGRAM_GENERATOR,
      DICTATION_GENERATOR,
    ]) {
      const source = readRepoFile(path);
      assert.match(source, /<CharacterChoiceControl\b/, `${path} has the Postać button`);
      assert.match(source, /useBarCharacter\(/, `${path} keeps the bar character`);
    }
  });

  void test("every card's printed SVG asks the printer to keep the character's colors", () => {
    for (const path of [
      SYMMETRY_GENERATOR,
      SEQUENCE_GENERATOR,
      SUDOKU_GENERATOR,
      NONOGRAM_GENERATOR,
      NONOGRAM_SIMPLE_SHEET,
      DICTATION_GENERATOR,
    ]) {
      assert.match(readRepoFile(path), /printColorAdjust:\s*"exact"/, path);
    }
  });

  void test("the speech band uses the screen tokens and no color literal", () => {
    for (const path of [SPEECH_BAND_COMPONENT, SPEECH_LIB]) {
      const source = readRepoFile(path);
      assert.doesNotMatch(source, /#[0-9a-fA-F]{3,8}\b/, `${path} has a hex color`);
      assert.doesNotMatch(source, /\b(rgb|hsl|oklch)a?\(/, `${path} has a color function`);
    }
    assert.match(readRepoFile(SPEECH_BAND_COMPONENT), /var\(--foreground\)/);
    assert.match(readRepoFile(SPEECH_BAND_COMPONENT), /var\(--card\)/);
  });

  void test("the screen-only padding tweak stays inside @media screen", () => {
    const home = readRepoFile(WORKSHEET_HOME);
    const screenCss = extractBlock(home, "@media screen");
    assert.match(screenCss, /#worksheet-home\.has-sheet\s*\{\s*padding-top:\s*2rem;\s*padding-bottom:\s*2rem;\s*}/);

    const withoutScreen = removeBlock(home, "@media screen");
    assert.equal(withoutScreen.includes("padding-top: 2rem"), false);
    assert.equal(withoutScreen.includes("padding-bottom: 2rem"), false);
  });
});

function readRepoFile(relativePath: string): string {
  return readFileSync(path.join(repoRoot, relativePath), "utf8");
}

function extractBlock(source: string, atRule: string): string {
  const bounds = blockBounds(source, atRule);
  return source.slice(bounds.open + 1, bounds.close);
}

function removeBlock(source: string, atRule: string): string {
  const bounds = blockBounds(source, atRule);
  return `${source.slice(0, bounds.start)}${source.slice(bounds.close + 1)}`;
}

function blockBounds(source: string, atRule: string): { start: number; open: number; close: number } {
  const start = source.indexOf(atRule);
  assert.ok(start >= 0, `missing ${atRule}`);
  const open = source.indexOf("{", start);
  assert.ok(open >= 0, `missing opening brace for ${atRule}`);

  let depth = 0;
  for (let index = open; index < source.length; index += 1) {
    const char = source.charAt(index);
    if (char === "{") {
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0) {
        return { start, open, close: index };
      }
    }
  }

  assert.fail(`unclosed ${atRule}`);
}

function svgClassName(source: string): string {
  const match = /<svg\b[\s\S]*?className=\{cn\(\s*"([^"]+)"/.exec(source);
  assert.ok(match, "worksheet SVG is missing a class name");
  return match[1];
}

function classNamesContaining(source: string, token: string): string[] {
  const names: string[] = [];
  for (const match of source.matchAll(/className=\{cn\(\s*"([^"]+)"\s*\)\}/g)) {
    const className = match[1];
    if (className.includes(token)) {
      names.push(className);
    }
  }
  return names;
}
