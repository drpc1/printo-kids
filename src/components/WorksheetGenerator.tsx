import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { countPaths, generateMaze, type Maze, type MazeCell } from "@/lib/maze/generate";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET_X = 10;
const INSET_Y = 10;
const LABEL_COLUMN = 6;
const CHARACTER_MARK_SIZE = 30;

const CHARACTER_CHOICES = [
  { id: "none", label: "Bez postaci", src: null },
  { id: "samochodzik", label: "Samochodzik", src: "/characters/samochodzik.png" },
  { id: "rakieta", label: "Rakieta", src: "/characters/rakieta.png" },
  { id: "dinozaur", label: "Dinozaur", src: "/characters/dinozaur.png" },
] as const;

type CharacterChoice = (typeof CHARACTER_CHOICES)[number]["id"];

interface WallSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function WorksheetGenerator() {
  const [maze, setMaze] = useState<Maze | null>(null);
  const [character, setCharacter] = useState<CharacterChoice>("none");
  const [choiceOpen, setChoiceOpen] = useState(false);
  const selectedChoice = CHARACTER_CHOICES.find((option) => option.id === character) ?? CHARACTER_CHOICES[0];

  useEffect(() => {
    const main = document.getElementById("worksheet-home");
    if (main === null) {
      return;
    }
    const hasMaze = maze !== null;
    main.classList.toggle("has-maze", hasMaze);
    main.classList.toggle("justify-start", hasMaze);
    main.classList.toggle("justify-center", !hasMaze);
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

  const hasMaze = maze !== null;

  return (
    <div className={cn("flex w-full flex-col items-center gap-4")}>
      {hasMaze ? (
        <div className={cn("flex w-full items-center justify-between gap-4 print:hidden")}>
          <div className={cn("flex min-w-0 items-center gap-3")}>
            <CharacterChoiceControl
              character={character}
              selectedChoice={selectedChoice}
              choiceOpen={choiceOpen}
              onOpenChange={setChoiceOpen}
              onSelect={setCharacter}
            />
            <GenerateButton onClick={handleGenerate} tone="quiet" />
          </div>
          <Button
            type="button"
            variant="default"
            onClick={handlePrint}
            className={cn("h-auto rounded-full px-12 py-3.5 text-lg")}
          >
            Drukuj
          </Button>
        </div>
      ) : (
        <div className={cn("flex flex-col items-center gap-6 print:hidden")}>
          <CharacterChoiceControl
            character={character}
            selectedChoice={selectedChoice}
            choiceOpen={choiceOpen}
            onOpenChange={setChoiceOpen}
            onSelect={setCharacter}
          />
          <GenerateButton onClick={handleGenerate} tone="hero" />
        </div>
      )}
      {hasMaze ? <MazeSheet maze={maze} characterSrc={selectedChoice.src} /> : null}
    </div>
  );
}

function GenerateButton({ onClick, tone }: { onClick: () => void; tone: "hero" | "quiet" }) {
  return (
    <Button
      type="button"
      variant={tone === "hero" ? "default" : "outline"}
      onClick={onClick}
      className={cn("h-auto rounded-full px-12 py-3.5 text-lg")}
    >
      Generuj
    </Button>
  );
}

function CharacterChoiceControl({
  character,
  selectedChoice,
  choiceOpen,
  onOpenChange,
  onSelect,
}: {
  character: CharacterChoice;
  selectedChoice: (typeof CHARACTER_CHOICES)[number];
  choiceOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: CharacterChoice) => void;
}) {
  return (
    <Dialog open={choiceOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Postać: ${selectedChoice.label}`}
          className={cn("text-muted-foreground hover:text-foreground h-auto gap-1.5 px-2 py-1 text-base font-normal")}
        >
          <span>Postać:</span>
          {selectedChoice.src !== null ? (
            <img src={selectedChoice.src} alt="" width={24} height={24} className={cn("size-6")} />
          ) : null}
          {selectedChoice.label}
          <ChevronDown className={cn("size-4")} aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("print:hidden")} showCloseButton={false}>
        <DialogTitle className={cn("sr-only")}>Wybierz postać</DialogTitle>
        <div className={cn("flex flex-col gap-2")}>
          {CHARACTER_CHOICES.map((option) => (
            <Button
              key={option.id}
              type="button"
              variant="ghost"
              aria-pressed={character === option.id}
              className={cn("h-auto w-full justify-start px-4 py-2 text-lg", character === option.id && "bg-muted")}
              onClick={() => {
                onSelect(option.id);
                onOpenChange(false);
              }}
            >
              {option.src !== null ? (
                <img src={option.src} alt="" width={40} height={40} className={cn("size-10")} />
              ) : null}
              {option.label}
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function MazeSheet({ maze, characterSrc }: { maze: Maze; characterSrc: string | null }) {
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
  const hasCharacter = characterSrc !== null;
  const markY = originY - CHARACTER_MARK_SIZE;

  return (
    <svg
      viewBox={`0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      role="img"
      aria-label="Labirynt"
    >
      <rect width={PAGE_WIDTH} height={PAGE_HEIGHT} fill="var(--card)" />
      {hasCharacter ? (
        <image
          href={characterSrc}
          x={labelX - CHARACTER_MARK_SIZE / 2}
          y={markY}
          width={CHARACTER_MARK_SIZE}
          height={CHARACTER_MARK_SIZE}
        />
      ) : (
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
      )}
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
