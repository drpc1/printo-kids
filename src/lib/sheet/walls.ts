import type { Maze, MazeCell } from "../maze/generate.ts";

export interface WallSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export function collectWalls(maze: Maze, originX: number, originY: number, cellSize: number): WallSegment[] {
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

export function mazeCell(maze: Maze, row: number, col: number): MazeCell | undefined {
  return maze.cells[row]?.[col];
}
