import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { SPEECH_BAND } from "../sheet/speech.ts";
import { generateNumberMazeCard } from "./generate.ts";
import { layoutNumberMazeSheet } from "./layout.ts";
import { NUMBER_MAZE_LEVELS } from "./levels.ts";
import { NUMBER_MAZE_SHEET } from "./sheet.ts";

function seeded(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const S = NUMBER_MAZE_SHEET;
const EPS = 1e-6;

void describe("layoutNumberMazeSheet", () => {
  void test("an instruction taller than the page throws", () => {
    const card = generateNumberMazeCard(seeded(2), NUMBER_MAZE_LEVELS[0]);
    assert.ok(card !== null);
    assert.throws(() => layoutNumberMazeSheet(card, S.pageHeight));
  });

  for (const level of NUMBER_MAZE_LEVELS) {
    for (const band of [SPEECH_BAND.characterSize, S.plainInstructionSize * 1.4]) {
      void test(`${level.id}, band ${band} mm: grid inside the margin, cell at most ${S.maxCell} mm`, () => {
        const card = generateNumberMazeCard(seeded(2), level);
        assert.ok(card !== null);
        const layout = layoutNumberMazeSheet(card, band);
        assert.ok(layout.cell <= S.maxCell + EPS);
        assert.equal(layout.cells.length, level.cols * level.rows);
        assert.ok(layout.grid.x >= S.inset - EPS);
        assert.ok(layout.grid.x + layout.grid.width <= S.pageWidth - S.inset + EPS);
        assert.ok(layout.grid.y > S.inset + band);
        assert.ok(layout.labels[1].baseline <= S.pageHeight - S.inset + EPS);
        // centred across the page
        assert.ok(Math.abs(layout.grid.x - (S.pageWidth - layout.grid.x - layout.grid.width)) < EPS);
        // start top left, goal bottom right, "Start" above and "Meta" under the grid
        assert.ok(Math.abs(layout.endpoints[0].x - (layout.grid.x + S.endpointInset)) < EPS);
        assert.ok(Math.abs(layout.endpoints[0].y - (layout.grid.y + S.endpointInset)) < EPS);
        const goal = layout.endpoints[1];
        assert.ok(Math.abs(goal.x + goal.size + S.endpointInset - (layout.grid.x + layout.grid.width)) < EPS);
        assert.ok(Math.abs(goal.y + goal.size + S.endpointInset - (layout.grid.y + layout.grid.height)) < EPS);
        assert.equal(layout.labels[0].text, "Start");
        assert.ok(layout.labels[0].baseline < layout.grid.y);
        assert.equal(layout.labels[1].text, "Meta");
        assert.ok(layout.labels[1].baseline > layout.grid.y + layout.grid.height);
        // every number sits inside its cell
        for (const cell of layout.cells) {
          assert.ok(cell.baseline < cell.y + layout.cell && cell.baseline - cell.fontSize > cell.y);
        }
      });
    }
  }
});
