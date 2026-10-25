import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { symmetryTemplatesFor, type SymmetryCell, type SymmetryTemplate } from "../symmetry/templates.ts";
import {
  dictationSilhouette,
  outlineProblems,
  traceOutline,
  walkCommands,
  type DictationSilhouette,
} from "./outline.ts";

/** Reads a silhouette from rows of text: "#" is a filled cell. */
function shape(lines: readonly string[]): DictationSilhouette {
  const cells: { col: number; row: number }[] = [];
  lines.forEach((line, row) => {
    for (let col = 0; col < line.length; col += 1) {
      if (line.charAt(col) === "#") {
        cells.push({ col, row });
      }
    }
  });
  return { width: Math.max(...lines.map((line) => line.length)), height: lines.length, cells };
}

function rectangle(width: number, height: number): DictationSilhouette {
  return shape(Array.from({ length: height }, () => "#".repeat(width)));
}

void describe("outlineProblems", () => {
  void test("a plain rectangle passes", () => {
    assert.deepEqual(outlineProblems(rectangle(4, 3)), []);
  });

  void test("an L shape passes", () => {
    assert.deepEqual(outlineProblems(shape(["#.", "##"])), []);
  });

  void test("two cells that meet only at a corner are rejected as corner-touch", () => {
    assert.deepEqual(outlineProblems(shape(["#.", ".#"])), ["disconnected", "corner-touch"]);
  });

  void test("a corner touch inside a connected shape is rejected", () => {
    // One connected piece, but at the vertex between the top-middle and middle-right cells the outline meets itself.
    assert.deepEqual(outlineProblems(shape(["##.", "#.#", "###"])), ["corner-touch"]);
    assert.deepEqual(outlineProblems(shape(["#.", "##", ".#"])), []);
  });

  void test("two separate pieces are rejected as disconnected", () => {
    assert.deepEqual(outlineProblems(shape(["#.#"])), ["disconnected"]);
  });
});

void describe("traceOutline", () => {
  void test("a w by h rectangle is w right, h down, w left, h up from its top-left corner (hand-written oracle)", () => {
    assert.deepEqual(traceOutline(rectangle(5, 3)), {
      start: { x: 0, y: 0 },
      commands: [
        { direction: "right", length: 5 },
        { direction: "down", length: 3 },
        { direction: "left", length: 5 },
        { direction: "up", length: 3 },
      ],
    });
  });

  void test("a ring traces like a filled square: the hole is not visited", () => {
    const ring = shape(["###", "#.#", "###"]);

    assert.deepEqual(traceOutline(ring), traceOutline(rectangle(3, 3)));
  });

  void test("starts at the top-left corner of the leftmost cell in the top row and goes right first", () => {
    const trace = traceOutline(shape([".##", "###"]));

    assert.deepEqual(trace.start, { x: 1, y: 0 });
    assert.deepEqual(trace.commands[0], { direction: "right", length: 2 });
  });

  void test("merges equal steps and turns clockwise around a staircase (hand-written oracle)", () => {
    assert.deepEqual(traceOutline(shape(["#.", "##"])).commands, [
      { direction: "right", length: 1 },
      { direction: "down", length: 1 },
      { direction: "right", length: 1 },
      { direction: "down", length: 1 },
      { direction: "left", length: 2 },
      { direction: "up", length: 2 },
    ]);
  });

  void test("walking the commands returns to the start", () => {
    const trace = traceOutline(shape(["##.", "###", ".##"]));
    const vertices = walkCommands(trace.start, trace.commands);

    assert.deepEqual(vertices[vertices.length - 1], trace.start);
    assert.equal(vertices.length, trace.commands.reduce((sum, command) => sum + command.length, 0) + 1);
  });
});

void describe("dictationSilhouette", () => {
  const ring: SymmetryTemplate = {
    id: "ring",
    width: 3,
    height: 3,
    holeColor: "blue",
    base: [
      ...[0, 1, 2].flatMap((col) => [
        { col, row: 0, color: "red" as const },
        { col, row: 2, color: "red" as const },
      ]),
      { col: 0, row: 1, color: "red" },
    ],
    parts: [],
  };

  void test("fills the holes, mirrors the half and normalizes to the bounding box", () => {
    const silhouette = dictationSilhouette(ring, []);

    assert.equal(silhouette.width, 6);
    assert.equal(silhouette.height, 3);
    assert.equal(silhouette.cells.length, 18);
  });

  void test("moves an object that does not start at column 0 or row 0 to the top-left corner", () => {
    const small: SymmetryCell[] = [{ col: 4, row: 2, color: "red" }];
    const silhouette = dictationSilhouette({ ...ring, width: 5, height: 5, base: small }, []);

    assert.equal(silhouette.width, 2);
    assert.equal(silhouette.height, 1);
    assert.deepEqual(silhouette.cells, [
      { col: 0, row: 0 },
      { col: 1, row: 0 },
    ]);
  });

  void test("the strawberry with the second leaves variant is rejected, the first variant passes", () => {
    const strawberry = symmetryTemplatesFor("lat6").find((template) => template.id === "truskawka");
    assert.ok(strawberry);

    assert.deepEqual(outlineProblems(dictationSilhouette(strawberry, [0, 0])), []);
    assert.notDeepEqual(outlineProblems(dictationSilhouette(strawberry, [1, 0])), []);
    assert.notDeepEqual(outlineProblems(dictationSilhouette(strawberry, [1, 1])), []);
  });
});
