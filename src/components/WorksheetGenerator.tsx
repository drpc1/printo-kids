import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { countPaths, generateMaze, type Maze, type MazeCell } from "@/lib/maze/generate";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET_X = 10;
const INSET_Y = 10;
const LABEL_COLUMN = 6;

interface WallSegment {
  id: string;
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

  function handlePrint(): void {
    window.print();
  }

  return (
    <div className={cn("flex w-full flex-col items-center gap-10")}>
      <div className={cn("flex flex-wrap items-center justify-center gap-4 print:hidden")}>
        <Button
          type="button"
          variant="default"
          onClick={handleGenerate}
          className={cn("h-auto rounded-full px-12 py-3.5 text-lg")}
        >
          Generuj
        </Button>
        {maze !== null ? (
          <Button
            type="button"
            variant="default"
            onClick={handlePrint}
            className={cn("h-auto rounded-full px-12 py-3.5 text-lg")}
          >
            Drukuj
          </Button>
        ) : null}
      </div>
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
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:h-[297mm] print:w-[210mm] print:ring-0",
      )}
      role="img"
      aria-label="Labirynt"
    >
      <rect width={PAGE_WIDTH} height={PAGE_HEIGHT} fill="var(--card)" />
      <text
        x={labelX}
        y={startY}
        fill="var(--foreground)"
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
        fill="var(--foreground)"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={7}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        Meta
      </text>
      <g fill="none" stroke="var(--foreground)" strokeLinecap="square" strokeLinejoin="miter" strokeWidth={0.65}>
        {walls.map((wall) => (
          <line key={wall.id} x1={wall.x1} y1={wall.y1} x2={wall.x2} y2={wall.y2} />
        ))}
      </g>
    </svg>
  );
}

function collectWalls(maze: Maze, originX: number, originY: number, cellSize: number): WallSegment[] {
  const walls: WallSegment[] = [];

  for (let row = 0; row < maze.height; row += 1) {
    for (let col = 0; col < maze.width; col += 1) {
      const cell = mazeCell(maze, row, col);
      if (cell === undefined) {
        continue;
      }
      const x = originX + col * cellSize;
      const y = originY + row * cellSize;
      if (row === 0 && cell.north) {
        walls.push({ id: `${row},${col},north`, x1: x, y1: y, x2: x + cellSize, y2: y });
      }
      if (cell.east) {
        walls.push({
          id: `${row},${col},east`,
          x1: x + cellSize,
          y1: y,
          x2: x + cellSize,
          y2: y + cellSize,
        });
      }
      if (cell.south) {
        walls.push({
          id: `${row},${col},south`,
          x1: x,
          y1: y + cellSize,
          x2: x + cellSize,
          y2: y + cellSize,
        });
      }
      if (col === 0 && cell.west) {
        walls.push({ id: `${row},${col},west`, x1: x, y1: y, x2: x, y2: y + cellSize });
      }
    }
  }

  return walls;
}

function mazeCell(maze: Maze, row: number, col: number): MazeCell | undefined {
  return maze.cells[row]?.[col];
}
