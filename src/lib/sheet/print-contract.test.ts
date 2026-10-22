import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, test } from "node:test";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");

const WORKSHEET_HOME = "src/components/GeneratorShell.astro";
const MAZE_PAGE = "src/pages/labirynt.astro";
const WORKSHEET_GENERATOR = "src/components/WorksheetGenerator.tsx";
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
    assert.match(printCss, /#worksheet-home\.has-maze\s*\{[^}]*background:\s*none\s*;/);
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
      "max-h-[calc(100dvh-2rem)] print:hidden",
    ]);
  });

  void test("the maze page lives under /labirynt and uses the shared shell", () => {
    const page = readRepoFile(MAZE_PAGE);
    assert.match(page, /<GeneratorShell\b/);
    assert.match(page, /<WorksheetGenerator\b/);
  });

  void test("the screen-only padding tweak stays inside @media screen", () => {
    const home = readRepoFile(WORKSHEET_HOME);
    const screenCss = extractBlock(home, "@media screen");
    assert.match(screenCss, /#worksheet-home\.has-maze\s*\{\s*padding-top:\s*2rem;\s*padding-bottom:\s*2rem;\s*}/);

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
