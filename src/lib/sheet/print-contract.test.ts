import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const WORKSHEET_HOME = "src/components/GeneratorShell.astro";
const SITE_FOOTER = "src/components/SiteFooter.astro";
const MAZE_PAGE = "src/pages/maze.astro";
const WORKSHEET_GENERATOR = "src/components/WorksheetGenerator.tsx";
const CHARACTER_CHOICE_CONTROL = "src/components/CharacterChoiceControl.tsx";
const SYMMETRY_PAGE = "src/pages/symmetry.astro";
const SYMMETRY_GENERATOR = "src/components/SymmetryGenerator.tsx";
const SEQUENCE_PAGE = "src/pages/sequences.astro";
const SEQUENCE_GENERATOR = "src/components/SequenceGenerator.tsx";
const MONEY_PAGE = "src/pages/money.astro";
const MONEY_GENERATOR = "src/components/MoneyGenerator.tsx";
const ODD_ONE_OUT_PAGE = "src/pages/odd-one-out.astro";
const ODD_ONE_OUT_GENERATOR = "src/components/OddOneOutGenerator.tsx";
const SUDOKU_PAGE = "src/pages/sudoku.astro";
const SUDOKU_GENERATOR = "src/components/SudokuGenerator.tsx";
const DICTATION_PAGE = "src/pages/dictation.astro";
const DICTATION_GENERATOR = "src/components/DictationGenerator.tsx";
const NONOGRAM_PAGE = "src/pages/nonogram.astro";
const NONOGRAM_GENERATOR = "src/components/NonogramGenerator.tsx";
const NONOGRAM_SIMPLE_SHEET = "src/components/NonogramSimpleSheet.tsx";
const COPY_DRAWING_PAGE = "src/pages/copy-drawing.astro";
const COPY_DRAWING_GENERATOR = "src/components/CopyDrawingGenerator.tsx";
const COPY_DRAWING_SHEET = "src/components/CopyDrawingSheet.tsx";
const PATTERN_LINES_PAGE = "src/pages/patterns.astro";
const PATTERN_LINES_GENERATOR = "src/components/PatternLinesGenerator.tsx";
const PATTERN_LINES_SHEET = "src/components/PatternLinesSheet.tsx";
const MATH_CROSSWORD_PAGE = "src/pages/math-crossword.astro";
const MATH_CROSSWORD_GENERATOR = "src/components/MathCrosswordGenerator.tsx";
const MATH_CROSSWORD_SHEET = "src/components/MathCrosswordSheet.tsx";
const CLOCK_PAGE = "src/pages/clock.astro";
const CLOCK_GENERATOR = "src/components/ClockGenerator.tsx";
const CLOCK_SHEET = "src/components/ClockSheet.tsx";
const CODING_PAGE = "src/pages/coding.astro";
const CODING_GENERATOR = "src/components/CodingGenerator.tsx";
const CODING_SHEET = "src/components/CodingSheet.tsx";
const SIZE_ORDER_PAGE = "src/pages/size-order.astro";
const SIZE_ORDER_GENERATOR = "src/components/SizeOrderGenerator.tsx";
const SIZE_ORDER_SHEET_COMPONENT = "src/components/SizeOrderSheet.tsx";
const NUMBER_MAZE_PAGE = "src/pages/number-maze.astro";
const NUMBER_MAZE_GENERATOR = "src/components/NumberMazeGenerator.tsx";
const NUMBER_MAZE_SHEET_COMPONENT = "src/components/NumberMazeSheet.tsx";
const SHADOWS_PAGE = "src/pages/shadows.astro";
const SHADOWS_GENERATOR = "src/components/ShadowsGenerator.tsx";
const SHADOWS_SHEET_COMPONENT = "src/components/ShadowsSheet.tsx";
const CARD_PAGE = "src/components/CardPage.tsx";
const CARD_PAGE_HOOK = "src/hooks/useCardPage.ts";
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

  void test("a phone print sizes the sheet by the page width, and a desktop print keeps 100vh", () => {
    // iOS print measures vh against the browser window, so a vh limit changed with the browser's toolbars
    // (108vh printed two pages in Brave iOS); 94% of the page width fits one A4 page on an iPhone.
    // hover: none and the narrow width keep a desktop with a hover pointer and a 210 mm page on 100vh.
    const home = readRepoFile(WORKSHEET_HOME);
    const phonePrint = extractBlock(home, "@media print and (hover: none) and (max-width: 175mm)");
    assert.match(
      phonePrint,
      /#worksheet-home svg\s*\{\s*width:\s*94%\s*;\s*height:\s*auto\s*;\s*max-height:\s*none\s*;\s*\}/,
    );
    assert.equal(/\d\s*vh\b/.test(phonePrint), false);
    assert.equal(home.match(/@media print\b/g)?.length, 2);
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
    // The bar and its buttons are CardPage's; the maze keeps only its level dialog.
    assert.deepEqual(classNamesContaining(generator, "print:hidden"), ["max-h-[calc(100dvh-2rem)] print:hidden"]);
    assertCardPageShell(generator);
    // A level change the maze cannot lay out leaves the bar without a card; Drukuj must stay off then.
    assert.match(generator, /printDisabled={view.kind !== "showing"}/);
    assert.deepEqual(classNamesContaining(readRepoFile(CARD_PAGE), "print:hidden"), [
      "flex w-full flex-col gap-3 print:hidden",
      "flex flex-col items-center gap-6 print:hidden",
    ]);
    // The character list dialog moved to the shared control the maze page imports.
    assert.deepEqual(classNamesContaining(readRepoFile(CHARACTER_CHOICE_CONTROL), "print:hidden"), [
      "max-h-[calc(100dvh-2rem)] print:hidden",
    ]);
  });

  void test("the footer link to the how-it-works page stays out of the print", () => {
    assert.match(readRepoFile(SITE_FOOTER), /<footer\s+class="[^"]*\bprint:hidden\b[^"]*"/);
    // The shell renders it inside #worksheet-home, so the print rules above reach the footer's link too.
    assert.match(readRepoFile(WORKSHEET_HOME), /<SiteFooter\s*\/>/);
  });

  void test("the card page shell hides its controls in print", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(CARD_PAGE), "print:hidden"), [
      "flex w-full flex-col gap-3 print:hidden",
      "flex flex-col items-center gap-6 print:hidden",
    ]);
  });

  void test("the maze page lives under /maze and uses the shared shell", () => {
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
    assert.deepEqual(classNamesContaining(readRepoFile(SYMMETRY_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(SYMMETRY_GENERATOR));
  });

  void test("the symmetry page lives under /symmetry and uses the shared shell", () => {
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
    assert.deepEqual(classNamesContaining(readRepoFile(SEQUENCE_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(SEQUENCE_GENERATOR));
  });

  void test("the sequence page lives under /sequences and uses the shared shell", () => {
    const page = readRepoFile(SEQUENCE_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    // The island reads localStorage on its first render, so it must never render on the server.
    assert.match(page, /<SequenceGenerator\s+client:only="react"\s*\/>/);
  });

  void test("the printed money SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(MONEY_GENERATOR));

    assert.ok(svgClass.includes("print:w-[210mm]"));
    assert.ok(svgClass.includes("print:h-[297mm]"));
    assert.ok(svgClass.includes("print:overflow-hidden"));
    assert.ok(svgClass.includes("print:block"));
    assert.ok(svgClass.includes("print:max-h-[297mm]"));
    assert.ok(svgClass.includes("print:ring-0"));
  });

  void test("print hides the money controls", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(MONEY_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(MONEY_GENERATOR));
  });

  void test("the money page lives under /money and uses the shared shell", () => {
    const page = readRepoFile(MONEY_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<MoneyGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
  });

  void test("the printed odd-one-out SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(ODD_ONE_OUT_GENERATOR));

    assert.ok(svgClass.includes("print:w-[210mm]"));
    assert.ok(svgClass.includes("print:h-[297mm]"));
    assert.ok(svgClass.includes("print:overflow-hidden"));
    assert.ok(svgClass.includes("print:block"));
    assert.ok(svgClass.includes("print:max-h-[297mm]"));
    assert.ok(svgClass.includes("print:ring-0"));
  });

  void test("print hides the odd-one-out controls", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(ODD_ONE_OUT_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(ODD_ONE_OUT_GENERATOR));
  });

  void test("the odd-one-out page lives under /odd-one-out and uses the shared shell", () => {
    const page = readRepoFile(ODD_ONE_OUT_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<OddOneOutGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
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
    assert.deepEqual(classNamesContaining(readRepoFile(SUDOKU_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(SUDOKU_GENERATOR));
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
    assert.deepEqual(classNamesContaining(generator, "print:hidden"), ["print:hidden"]);
    assertCardPageShell(generator);
    // The stroke sits on the solution group. Prettier wraps the <g> tag, so the two fragments stay separate.
    assert.ok(generator.includes('className={cn("print:hidden")}') && generator.includes("data-solution"));
  });

  void test("the dictation page lives under /dictation, uses the shared shell, and has no @page of its own", () => {
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
    assert.deepEqual(classNamesContaining(readRepoFile(NONOGRAM_GENERATOR), "print:hidden"), ["print:hidden"]);
    assertCardPageShell(readRepoFile(NONOGRAM_GENERATOR));
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

  void test("the printed copy-drawing SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(COPY_DRAWING_SHEET));

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
  });

  void test("print hides no part of the copy-drawing card: the silhouette grid prints, and the controls live in CardPage", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(COPY_DRAWING_SHEET), "print:hidden"), []);
    assert.deepEqual(classNamesContaining(readRepoFile(COPY_DRAWING_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(COPY_DRAWING_GENERATOR));
  });

  void test("the copy-drawing page lives under /copy-drawing, uses the shared shell, and has no @page of its own", () => {
    const page = readRepoFile(COPY_DRAWING_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<CopyDrawingGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
  });

  void test("the printed pattern-lines SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(PATTERN_LINES_SHEET));

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
  });

  void test("print hides no part of the pattern-lines card: the help lines and the ruling are part of the task", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(PATTERN_LINES_SHEET), "print:hidden"), []);
    assert.deepEqual(classNamesContaining(readRepoFile(PATTERN_LINES_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(PATTERN_LINES_GENERATOR));
  });

  void test("the pattern-lines page lives under /patterns, uses the shared shell, and has no @page of its own", () => {
    const page = readRepoFile(PATTERN_LINES_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<PatternLinesGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
  });

  void test("the printed math-crossword SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(MATH_CROSSWORD_SHEET));

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
  });

  void test("print hides only the math-crossword solution group, so a switch left on never prints the answer", () => {
    const sheet = readRepoFile(MATH_CROSSWORD_SHEET);
    assert.deepEqual(classNamesContaining(sheet, "print:hidden"), ["print:hidden"]);
    assert.ok(sheet.includes('className={cn("print:hidden")} fill="var(--muted-foreground)" data-solution>'));
    assert.deepEqual(classNamesContaining(readRepoFile(MATH_CROSSWORD_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(MATH_CROSSWORD_GENERATOR));
  });

  void test("the math-crossword page lives under /math-crossword, uses the shared shell, and has no @page of its own", () => {
    const page = readRepoFile(MATH_CROSSWORD_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<MathCrosswordGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
  });

  void test("the printed clock SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(CLOCK_SHEET));

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
  });

  void test("the clock card has no answer on screen, so neither its sheet nor its generator hides anything in print", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(CLOCK_SHEET), "print:hidden"), []);
    assert.deepEqual(classNamesContaining(readRepoFile(CLOCK_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(CLOCK_GENERATOR));
  });

  void test("the clock page lives under /clock, uses the shared shell, and has no @page of its own", () => {
    const page = readRepoFile(CLOCK_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<ClockGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
  });

  void test("the printed coding SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(CODING_SHEET));

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
  });

  void test("the coding card has no answer on screen, so neither its sheet nor its generator hides anything in print", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(CODING_SHEET), "print:hidden"), []);
    assert.deepEqual(classNamesContaining(readRepoFile(CODING_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(CODING_GENERATOR));
  });

  void test("the coding page lives under /coding, uses the shared shell, and has no @page of its own", () => {
    const page = readRepoFile(CODING_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<CodingGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
  });

  void test("the printed size-order SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(SIZE_ORDER_SHEET_COMPONENT));

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
  });

  void test("the size-order card has no answer on screen, so neither its sheet nor its generator hides anything in print", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(SIZE_ORDER_SHEET_COMPONENT), "print:hidden"), []);
    assert.deepEqual(classNamesContaining(readRepoFile(SIZE_ORDER_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(SIZE_ORDER_GENERATOR));
  });

  void test("the size-order page lives under /size-order, uses the shared shell, and has no @page of its own", () => {
    const page = readRepoFile(SIZE_ORDER_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<SizeOrderGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
  });

  void test("the printed number-maze SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(NUMBER_MAZE_SHEET_COMPONENT));

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
  });

  void test("the number-maze card has no answer on screen, so neither its sheet nor its generator hides anything in print", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(NUMBER_MAZE_SHEET_COMPONENT), "print:hidden"), []);
    assert.deepEqual(classNamesContaining(readRepoFile(NUMBER_MAZE_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(NUMBER_MAZE_GENERATOR));
  });

  void test("the number-maze page lives under /number-maze, uses the shared shell, and has no @page of its own", () => {
    const page = readRepoFile(NUMBER_MAZE_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<NumberMazeGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
  });

  void test("the printed shadows SVG is 210mm wide and 297mm tall with overflow hidden", () => {
    const svgClass = svgClassName(readRepoFile(SHADOWS_SHEET_COMPONENT));

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
  });

  void test("the shadows card has no answer on screen, so neither its sheet nor its generator hides anything in print", () => {
    assert.deepEqual(classNamesContaining(readRepoFile(SHADOWS_SHEET_COMPONENT), "print:hidden"), []);
    assert.deepEqual(classNamesContaining(readRepoFile(SHADOWS_GENERATOR), "print:hidden"), []);
    assertCardPageShell(readRepoFile(SHADOWS_GENERATOR));
  });

  void test("the shadows page lives under /shadows, uses the shared shell, and has no @page of its own", () => {
    const page = readRepoFile(SHADOWS_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<ShadowsGenerator\s+client:only="react"\s*\/>/);
    assert.equal(page.includes("@page"), false);
  });

  void test("every card page except the maze has the Postać bar and draws the character beside the instruction", () => {
    for (const path of [
      SYMMETRY_GENERATOR,
      SEQUENCE_GENERATOR,
      MONEY_GENERATOR,
      ODD_ONE_OUT_GENERATOR,
      SUDOKU_GENERATOR,
      NONOGRAM_GENERATOR,
      NONOGRAM_SIMPLE_SHEET,
      DICTATION_GENERATOR,
      COPY_DRAWING_SHEET,
      PATTERN_LINES_SHEET,
      MATH_CROSSWORD_SHEET,
      CLOCK_SHEET,
      CODING_SHEET,
      SIZE_ORDER_SHEET_COMPONENT,
      NUMBER_MAZE_SHEET_COMPONENT,
      SHADOWS_SHEET_COMPONENT,
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
      MONEY_GENERATOR,
      ODD_ONE_OUT_GENERATOR,
      SUDOKU_GENERATOR,
      NONOGRAM_GENERATOR,
      DICTATION_GENERATOR,
      COPY_DRAWING_GENERATOR,
      PATTERN_LINES_GENERATOR,
      MATH_CROSSWORD_GENERATOR,
      CLOCK_GENERATOR,
      CODING_GENERATOR,
      SIZE_ORDER_GENERATOR,
      NUMBER_MAZE_GENERATOR,
      SHADOWS_GENERATOR,
    ]) {
      const source = readRepoFile(path);
      assert.match(source, /<CharacterChoiceControl\b/, `${path} has the Postać button`);
      assert.match(source, /useCardPage\(/, `${path} keeps the bar character through useCardPage`);
    }
    assert.match(readRepoFile(CARD_PAGE_HOOK), /useBarCharacter\(/, "useCardPage keeps the bar character");
  });

  void test("every card's printed SVG asks the printer to keep the character's colors", () => {
    for (const path of [
      SYMMETRY_GENERATOR,
      SEQUENCE_GENERATOR,
      MONEY_GENERATOR,
      ODD_ONE_OUT_GENERATOR,
      SUDOKU_GENERATOR,
      NONOGRAM_GENERATOR,
      NONOGRAM_SIMPLE_SHEET,
      DICTATION_GENERATOR,
      COPY_DRAWING_SHEET,
      PATTERN_LINES_SHEET,
      MATH_CROSSWORD_SHEET,
      CLOCK_SHEET,
      CODING_SHEET,
      SIZE_ORDER_SHEET_COMPONENT,
      NUMBER_MAZE_SHEET_COMPONENT,
      SHADOWS_SHEET_COMPONENT,
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

// The settings row, Generuj and Drukuj live in CardPage, so a card that renders it has no controls of its own to print.
function assertCardPageShell(source: string): void {
  // The card hands CardPage its controls, its sheet and what Generuj does; the bar and the buttons are CardPage's.
  for (const prop of ["controls", "sheet", "onGenerate"]) {
    assert.match(source, new RegExp(`<CardPage\\b[\\s\\S]*\\b${prop}=\\{`), `a card passes ${prop} to CardPage`);
  }
}

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
  for (const match of source.matchAll(/className=\{cn\(\s*"([^"]+)",?\s*\)\}/g)) {
    const className = match[1];
    if (className.includes(token)) {
      names.push(className);
    }
  }
  return names;
}
