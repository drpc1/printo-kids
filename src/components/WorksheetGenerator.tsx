import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { countPaths, generateMaze, type Maze, type MazeCell } from "@/lib/maze/generate";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET_X = 10;
const INSET_Y = 10;
const LABEL_COLUMN = 6;

interface WallSegment {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function WorksheetGenerator() {
  const [maze, setMaze] = useState<Maze | null>(null);

  useEffect(() => {
    const main = document.getElementById("worksheet-home");
    if (main === null) {
      return;
    }
    if (maze !== null) {
      main.classList.remove("justify-center");
      main.classList.add("justify-start");
    } else {
      main.classList.remove("justify-start");
      main.classList.add("justify-center");
    }
  }, [maze]);

  function handleGenerate(): void {
    const next = generateMaze(Math.random);
    if (countPaths(next) === 1) {
      setMaze(next);
    }
  }

  return (
    <div className={cn("flex w-full flex-col items-center gap-10")}>
      <button
        type="button"
        onClick={handleGenerate}
        className={cn("rounded-full bg-[var(--pk-sage)] px-12 py-3.5 text-lg font-medium text-[var(--pk-paper)]")}
      >
        Generuj
      </button>
      {maze !== null ? <MazeSheet maze={maze} /> : null}
    </div>
  );
}

function MazeSheet({ maze }: { maze: Maze }) {
  const cellSize = (PAGE_WIDTH - INSET_X * 2) / maze.width;
  const innerHeight = PAGE_HEIGHT - INSET_Y * 2;
  const gridHeight = maze.height * cellSize;
  const labelBand = (innerHeight - gridHeight) / 2;
  const originX = INSET_X;
  const originY = INSET_Y + labelBand;
  const labelX = originX + (LABEL_COLUMN + 0.5) * cellSize;
  const startY = INSET_Y + labelBand / 2;
  const metaY = originY + gridHeight + labelBand / 2;
  const walls = collectWalls(maze, originX, originY, cellSize);

  return (
    <svg
      viewBox={`0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}`}
      className={cn("aspect-[210/297] h-auto w-full ring-1 ring-[var(--pk-ink)]")}
      role="img"
      aria-label="Labirynt"
    >
      <rect width={PAGE_WIDTH} height={PAGE_HEIGHT} fill="#fff" />
      <text
        x={labelX}
        y={startY}
        fill="var(--pk-ink)"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={7}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        Start
      </text>
      <text
        x={labelX}
        y={metaY}
        fill="var(--pk-ink)"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={7}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        Meta
      </text>
      <g fill="none" stroke="var(--pk-ink)" strokeLinecap="square" strokeLinejoin="miter" strokeWidth={0.65}>
        {walls.map((wall) => (
          <line
            key={`${wall.x1},${wall.y1},${wall.x2},${wall.y2}`}
            x1={wall.x1}
            y1={wall.y1}
            x2={wall.x2}
            y2={wall.y2}
          />
        ))}
      </g>
    </svg>
  );
}

function collectWalls(maze: Maze, originX: number, originY: number, cellSize: number): WallSegment[] {
  const walls: WallSegment[] = [];
  const seen = new Set<string>();

  function add(x1: number, y1: number, x2: number, y2: number): void {
    const ordered = x1 < x2 || (x1 === x2 && y1 <= y2);
    const ax = ordered ? x1 : x2;
    const ay = ordered ? y1 : y2;
    const bx = ordered ? x2 : x1;
    const by = ordered ? y2 : y1;
    const key = `${ax},${ay},${bx},${by}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    walls.push({ x1: ax, y1: ay, x2: bx, y2: by });
  }

  for (let row = 0; row < maze.height; row += 1) {
    for (let col = 0; col < maze.width; col += 1) {
      const cell = mazeCell(maze, row, col);
      if (cell === undefined) {
        continue;
      }
      const x = originX + col * cellSize;
      const y = originY + row * cellSize;
      if (cell.north) {
        add(x, y, x + cellSize, y);
      }
      if (cell.east) {
        add(x + cellSize, y, x + cellSize, y + cellSize);
      }
      if (cell.south) {
        add(x, y + cellSize, x + cellSize, y + cellSize);
      }
      if (cell.west) {
        add(x, y, x, y + cellSize);
      }
    }
  }

  return walls;
}

function mazeCell(maze: Maze, row: number, col: number): MazeCell | undefined {
  return maze.cells[row]?.[col];
}
