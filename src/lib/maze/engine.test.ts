// mazeSpec and mazeEngine (gh283, phase 4; D02 6.2: L1-L6, N1-N14). Assertions are on the problem `code`, not on null.
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { CardInvariantError, VerifiedCard, type CardEngine } from "../card-contract.ts";
import { mazeEngine, mazeSpec } from "./engine.ts";
import { countPaths, generateCandidate, generateMaze, type Maze } from "./generate.ts";
import { LEVELS, levelById, type LevelId } from "./levels.ts";

const MUTATION_RUN = process.env.MUTATION_RUN === "1";

function mulberry32(seed: number): () => number {
  let state = seed | 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const LEVEL: LevelId = "lat3";
const settings: { level: LevelId } = { level: LEVEL };

function base(seed = 5): Maze {
  return generateMaze(LEVEL, mulberry32(seed));
}

function codes(maze: Maze, level: LevelId = LEVEL): string[] {
  return mazeSpec.problems(maze, { level }).map((problem) => problem.code);
}

function knockDown(maze: Maze, row: number, col: number, direction: "east" | "south"): void {
  if (direction === "east") {
    maze.cells[row][col].east = false;
    maze.cells[row][col + 1].west = false;
  } else {
    maze.cells[row][col].south = false;
    maze.cells[row + 1][col].north = false;
  }
}

function fullyOpen(source: Maze): Maze {
  const maze = structuredClone(source);
  for (let row = 0; row < maze.height; row += 1) {
    for (let col = 0; col < maze.width; col += 1) {
      if (col < maze.width - 1) knockDown(maze, row, col, "east");
      if (row < maze.height - 1) knockDown(maze, row, col, "south");
    }
  }
  return maze;
}

function sealed(source: Maze): Maze {
  const maze = structuredClone(source);
  for (const row of maze.cells) {
    for (const cell of row) {
      cell.north = cell.east = cell.south = cell.west = true;
    }
  }
  maze.cells[maze.entrance.row][maze.entrance.col].north = false;
  maze.cells[maze.exit.row][maze.exit.col].south = false;
  return maze;
}

void describe("mazeSpec: legal cards", () => {
  void test("L1 every level and seed from the engine has the level's grid, entrance and exit", () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < 5; seed += 1) {
        const verified = mazeEngine.generate({ level: level.id }, mulberry32(seed), null);
        const maze = verified.card;
        assert.equal(maze.width, level.columns, level.id);
        assert.equal(maze.height, level.rows, level.id);
        assert.deepEqual(maze.entrance, level.entrance, level.id);
        assert.equal(maze.exit.row, level.rows - 1, level.id);
        assert.ok(level.exitColumns.includes(maze.exit.col), level.id);
        assert.equal(verified.kind, "labirynt");
      }
    }
  });

  void test("L2 a fresh candidate of every level is accepted (100 seeds)", () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < 100; seed += 1) {
        assert.deepEqual(codes(generateCandidate(level.id, mulberry32(seed)), level.id), [], `${level.id} ${seed}`);
      }
    }
  });

  void test("L4 the same seed gives equal cards, and the card is frozen", () => {
    for (const level of LEVELS) {
      const a = mazeEngine.generate({ level: level.id }, mulberry32(42), null);
      const b = mazeEngine.generate({ level: level.id }, mulberry32(42), null);
      assert.deepEqual(a.card, b.card, level.id);
      assert.equal(a.key, b.key, level.id);
    }
    assert.ok(Object.isFrozen(mazeEngine.generate(settings, mulberry32(1), null).card));
  });

  void test("L5 a Poziom 6 card comes out in well under a second", () => {
    const started = performance.now();
    for (let seed = 0; seed < 10; seed += 1) {
      mazeEngine.generate({ level: "nastolatek" }, mulberry32(seed), null);
    }
    assert.ok(MUTATION_RUN || (performance.now() - started) / 10 < 500);
  });

  void test("L6 every cell of a generated card is reachable from the entrance", () => {
    for (const level of LEVELS) {
      for (let seed = 0; seed < 5; seed += 1) {
        const maze = mazeEngine.generate({ level: level.id }, mulberry32(seed), null).card;
        const seen = new Set<string>([`${maze.entrance.row},${maze.entrance.col}`]);
        const queue = [maze.entrance];
        for (const { row, col } of queue) {
          const cell = maze.cells[row][col];
          const next = [
            !cell.north && row > 0 ? { row: row - 1, col } : null,
            !cell.south && row < maze.height - 1 ? { row: row + 1, col } : null,
            !cell.west && col > 0 ? { row, col: col - 1 } : null,
            !cell.east && col < maze.width - 1 ? { row, col: col + 1 } : null,
          ];
          for (const point of next) {
            if (point !== null && !seen.has(`${point.row},${point.col}`)) {
              seen.add(`${point.row},${point.col}`);
              queue.push(point);
            }
          }
        }
        assert.equal(seen.size, level.columns * level.rows, `${level.id} ${seed}`);
      }
    }
  });

  void test("N14 a loop inside a reachable dead end is legal (PRD: loops in dead ends are allowed)", () => {
    // Find an off-route pair of neighbouring cells whose wall is closed and open it: a loop, no second route.
    const maze = base();
    const route = new Set<string>();
    const parent = new Map<string, string | null>([[`${maze.entrance.row},${maze.entrance.col}`, null]]);
    const queue = [maze.entrance];
    for (const { row, col } of queue) {
      const cell = maze.cells[row][col];
      for (const [open, next] of [
        [!cell.north && row > 0, { row: row - 1, col }],
        [!cell.south && row < maze.height - 1, { row: row + 1, col }],
        [!cell.west && col > 0, { row, col: col - 1 }],
        [!cell.east && col < maze.width - 1, { row, col: col + 1 }],
      ] as const) {
        const key = `${next.row},${next.col}`;
        if (open && !parent.has(key)) {
          parent.set(key, `${row},${col}`);
          queue.push(next);
        }
      }
    }
    for (let key: string | null | undefined = `${maze.exit.row},${maze.exit.col}`; key; key = parent.get(key)) {
      route.add(key);
    }
    let looped = false;
    for (let row = 0; row < maze.height - 1 && !looped; row += 1) {
      for (let col = 0; col < maze.width - 1 && !looped; col += 1) {
        if (!route.has(`${row},${col}`) && !route.has(`${row},${col + 1}`) && maze.cells[row][col].east) {
          knockDown(maze, row, col, "east");
          looped = true;
        }
      }
    }
    assert.ok(looped, "fixture: no pair found");
    assert.equal(countPaths(maze, maze.entrance, maze.exit), 1);
    assert.deepEqual(codes(maze), []);
  });
});

void describe("mazeSpec: illegal cards, by code", () => {
  void test("N1 a grid of the wrong size is grid-size and stops the other checks", () => {
    const wide = { ...base(), width: base().width + 1 };
    const tall = { ...base(), height: base().height + 1 };
    const noRow = base();
    noRow.cells.pop();
    const shortRow = base();
    shortRow.cells[0].pop();
    for (const maze of [wide, tall, noRow, shortRow]) {
      assert.deepEqual(codes(maze), ["grid-size"]);
    }
  });

  void test("N2 an entrance in the wrong column or row is entrance-position", () => {
    const column = base();
    column.entrance = { row: 0, col: column.entrance.col + 1 };
    const row = base();
    row.entrance = { row: 1, col: row.entrance.col };
    assert.ok(codes(column).includes("entrance-position"));
    assert.ok(codes(row).includes("entrance-position"));
  });

  void test("an entrance or exit outside the grid is reported by position and does not crash the route checks", () => {
    const entrance = base();
    entrance.entrance = { row: 99, col: 99 };
    const exit = base();
    exit.exit = { row: 99, col: 0 };
    assert.ok(codes(entrance).includes("entrance-position"));
    assert.ok(codes(exit).includes("exit-position"));
  });

  void test("N3 a closed north wall of the entrance is entrance-sealed", () => {
    const maze = base();
    maze.cells[maze.entrance.row][maze.entrance.col].north = true;
    assert.deepEqual(codes(maze), ["entrance-sealed"]);
  });

  void test("N4 an exit in the wrong row or outside the exit columns is exit-position", () => {
    const row = base();
    row.exit = { row: row.height - 2, col: row.exit.col };
    const level = levelById(LEVEL);
    const nearCenter = base();
    nearCenter.cells[nearCenter.exit.row][nearCenter.exit.col].south = true;
    nearCenter.exit = { row: nearCenter.height - 1, col: level.entrance.col + 1 };
    nearCenter.cells[nearCenter.exit.row][nearCenter.exit.col].south = false;
    assert.ok(codes(row).includes("exit-position"));
    assert.ok(codes(nearCenter).includes("exit-position"));
  });

  void test("N5 a closed south wall of the exit is exit-sealed", () => {
    const maze = base();
    maze.cells[maze.exit.row][maze.exit.col].south = true;
    assert.deepEqual(codes(maze), ["exit-sealed"]);
  });

  void test("N6 an open outer wall elsewhere is outer-wall-open (four sides)", () => {
    const west = base();
    west.cells[1][0].west = false;
    const east = base();
    east.cells[1][east.width - 1].east = false;
    const north = base();
    north.cells[0][north.entrance.col === 0 ? 1 : 0].north = false;
    const south = base();
    south.cells[south.height - 1][south.exit.col === 0 ? 1 : 0].south = false;
    for (const maze of [west, east, north, south]) {
      assert.ok(codes(maze).includes("outer-wall-open"));
    }
  });

  void test("N7 a wall open on one side only is wall-mismatch", () => {
    const east = base();
    east.cells[1][1].east = !east.cells[1][2].west;
    const south = base();
    south.cells[1][1].south = !south.cells[2][1].north;
    assert.ok(codes(east).includes("wall-mismatch"));
    assert.ok(codes(south).includes("wall-mismatch"));
  });

  void test("N8 a maze with every wall closed, or with the exit cut off, is no-route", () => {
    assert.deepEqual(codes(sealed(base())), ["no-route", "unreachable-cells"]);
  });

  void test("N9 a fully open maze is several-routes", () => {
    assert.ok(codes(fullyOpen(base())).includes("several-routes"));
  });

  void test("N10 an unknown level id is a programmer error, not a card problem", () => {
    assert.throws(
      () => mazeSpec.problems(base(), { level: "lat99" as LevelId }),
      (error: unknown) => error instanceof Error && !(error instanceof CardInvariantError),
    );
  });

  void test("N11 the engine throws CardInvariantError for a defective candidate and returns nothing", () => {
    const defective = base();
    defective.cells[defective.entrance.row][defective.entrance.col].north = true;
    assert.throws(
      () => VerifiedCard.require(mazeSpec, defective, settings),
      (error: unknown) => error instanceof CardInvariantError && error.problems[0].code === "entrance-sealed",
    );
    const engine: CardEngine<typeof settings, Maze> = mazeEngine;
    assert.equal(typeof engine.generate, "function");
  });

  void test("N12 a candidate with two defects reports them in table order", () => {
    const maze = base();
    maze.cells[maze.entrance.row][maze.entrance.col].north = true; // entrance-sealed
    maze.cells[maze.exit.row][maze.exit.col].south = true; // exit-sealed
    maze.cells[1][0].west = false; // outer-wall-open
    assert.deepEqual(codes(maze).slice(0, 3), ["entrance-sealed", "exit-sealed", "outer-wall-open"]);
  });

  void test("N13 a cut-off cell, and a cut-off group of two cells, are unreachable-cells", () => {
    const cases = mazeSpec.knownBad.filter((bad) => bad.expectedCode === "unreachable-cells");
    assert.equal(cases.length, 2);
    for (const bad of cases) {
      const found = mazeSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.deepEqual(found, ["unreachable-cells"], bad.name);
    }
  });
});

void describe("mazeSpec: contentKey and knownBad", () => {
  void test("the level is content: a different level gives a different key", () => {
    assert.notEqual(mazeSpec.contentKey({ level: "lat3" }), mazeSpec.contentKey({ level: "lat4" }));
    assert.equal(mazeSpec.contentKey({ level: "lat3" }), mazeSpec.contentKey({ level: "lat3" }));
  });

  void test("keyOf differs for different walls", () => {
    assert.notEqual(mazeSpec.keyOf(base(1)), mazeSpec.keyOf(base(2)));
  });

  void test("every known bad card is rejected with its expected code", () => {
    assert.ok(mazeSpec.knownBad.length >= 11);
    for (const bad of mazeSpec.knownBad) {
      const found = mazeSpec.problems(bad.card, bad.settings).map((problem) => problem.code);
      assert.ok(
        found.includes(bad.expectedCode),
        `${bad.name}: expected ${bad.expectedCode}, got [${found.join(", ")}]`,
      );
    }
  });
});

void describe("mazeSpec: points off the grid and the words of the problems", () => {
  const problemsOf = (maze: Maze) => mazeSpec.problems(maze, settings);

  void test("an entrance or exit off any edge of the grid is named by its position code and the route checks stay out of it", () => {
    const { rows, columns } = levelById(LEVEL);
    const maze = base();
    const offGrid = [
      { row: -1, col: 1 },
      { row: rows, col: 1 },
      { row: 1, col: -1 },
      { row: 1, col: columns },
    ];
    for (const point of offGrid) {
      const badEntrance = problemsOf({ ...maze, entrance: point }).map((problem) => problem.code);
      assert.ok(badEntrance.includes("entrance-position"), JSON.stringify(point));
      assert.ok(!badEntrance.includes("no-route") && !badEntrance.includes("several-routes"), JSON.stringify(point));
      const badExit = problemsOf({ ...maze, exit: point }).map((problem) => problem.code);
      assert.ok(badExit.includes("exit-position"), JSON.stringify(point));
      assert.ok(!badExit.includes("no-route") && !badExit.includes("several-routes"), JSON.stringify(point));
    }
  });

  void test("the four corner cells are on the grid: a closed maze with an entrance or exit there has no route", () => {
    const { rows, columns } = levelById(LEVEL);
    const closed = base();
    for (const row of closed.cells) {
      for (const cell of row) {
        cell.north = cell.east = cell.south = cell.west = true;
      }
    }
    const corners = [
      { row: 0, col: 0 },
      { row: 0, col: columns - 1 },
      { row: rows - 1, col: 0 },
      { row: rows - 1, col: columns - 1 },
    ];
    for (const point of corners) {
      for (const moved of [
        { ...closed, entrance: point },
        { ...closed, exit: point },
      ]) {
        const codes = problemsOf(moved).map((problem) => problem.code);
        assert.ok(codes.includes("no-route"), JSON.stringify(point));
      }
    }
  });

  void test("each problem says in words what is wrong and where", () => {
    const { rows, columns } = levelById(LEVEL);
    const detail = (maze: Maze, code: string): string | undefined =>
      problemsOf(maze).find((problem) => problem.code === code)?.detail;

    const small = { ...base(), width: columns - 1 };
    assert.equal(detail(small, "grid-size"), `expected ${columns}x${rows}, got ${columns - 1}x${rows}`);

    const moved = { ...base(), entrance: { row: 0, col: 0 } };
    assert.equal(detail(moved, "entrance-position"), "entrance at 0,0");
    assert.equal(detail({ ...base(), exit: { row: 0, col: 1 } }, "exit-position"), "exit at 0,1");

    const sealedEntrance = base();
    sealedEntrance.cells[sealedEntrance.entrance.row][sealedEntrance.entrance.col].north = true;
    assert.equal(detail(sealedEntrance, "entrance-sealed"), "the north wall of the entrance is closed");
    const sealedExit = base();
    sealedExit.cells[sealedExit.exit.row][sealedExit.exit.col].south = true;
    assert.equal(detail(sealedExit, "exit-sealed"), "the south wall of the exit is closed");

    const side = base();
    side.cells[2][0].west = false;
    assert.equal(detail(side, "outer-wall-open"), "side wall open at 2,0");
    const top = base();
    top.cells[0][columns - 1].north = false;
    assert.equal(detail(top, "outer-wall-open"), `top or bottom wall open at 0,${columns - 1}`);

    const mismatchEast = base();
    mismatchEast.cells[2][2].east = !mismatchEast.cells[2][2].east;
    assert.equal(detail(mismatchEast, "wall-mismatch"), "east of 2,2");
    const mismatchSouth = base();
    mismatchSouth.cells[2][2].south = !mismatchSouth.cells[2][2].south;
    assert.equal(detail(mismatchSouth, "wall-mismatch"), "south of 2,2");
  });

  void test("the words of a route problem", () => {
    const closed = base();
    for (const row of closed.cells) {
      for (const cell of row) {
        cell.north = cell.east = cell.south = cell.west = true;
      }
    }
    closed.cells[closed.entrance.row][closed.entrance.col].north = false;
    closed.cells[closed.exit.row][closed.exit.col].south = false;
    const found = problemsOf(closed);
    assert.equal(
      found.find((problem) => problem.code === "no-route")?.detail,
      "no route from the entrance to the exit",
    );
    assert.equal(
      found.find((problem) => problem.code === "unreachable-cells")?.detail,
      "some cells cannot be reached from the entrance",
    );
  });

  void test("a second route is named in words, and the first of several wall defects is the one reported", () => {
    const loop = base();
    let opened = false;
    for (let row = 1; row < loop.height - 2 && !opened; row += 1) {
      for (let col = 1; col < loop.width - 2 && !opened; col += 1) {
        if (loop.cells[row][col].east) {
          loop.cells[row][col].east = false;
          loop.cells[row][col + 1].west = false;
          if (countPaths(loop, loop.entrance, loop.exit) > 1) {
            opened = true;
          } else {
            loop.cells[row][col].east = true;
            loop.cells[row][col + 1].west = true;
          }
        }
      }
    }
    assert.ok(opened, "no wall found whose opening makes a second route");
    assert.equal(
      problemsOf(loop).find((problem) => problem.code === "several-routes")?.detail,
      "more than one route from the entrance to the exit",
    );
    const twoMismatches = base();
    twoMismatches.cells[2][2].east = !twoMismatches.cells[2][2].east;
    twoMismatches.cells[4][4].east = !twoMismatches.cells[4][4].east;
    assert.equal(problemsOf(twoMismatches).find((problem) => problem.code === "wall-mismatch")?.detail, "east of 2,2");
  });
});
