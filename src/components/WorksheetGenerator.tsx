import { useEffect, useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CharacterChoiceRows, ProfileCorner } from "@/components/ProfileCorner";
import { openingVisit, readChildProfiles, type ChildProfile, type VisitAfterDelete } from "@/lib/child-profiles";
import { readLastUsed, writeLastUsed } from "@/lib/last-used";
import { generateMaze, mazeForSheet, type Maze, type MazeCell } from "@/lib/maze/generate";
import { CHARACTER_CHOICES, characterRow, characterSheetSrc } from "@/lib/sheet/character";
import { layoutSheet } from "@/lib/sheet/layout";
import { cn } from "@/lib/utils";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET = 10;
const LABEL_COLUMN = 6;
const CHARACTER_MARK_SIZE = 30;

const ALLOWED_CHARACTER_IDS = CHARACTER_CHOICES.map((option) => option.id);

type CharacterChoice = (typeof CHARACTER_CHOICES)[number]["id"];

interface VisitStart {
  profiles: ChildProfile[];
  activeId: string | null;
  character: CharacterChoice;
  ask: boolean;
}

interface WallSegment {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

export default function WorksheetGenerator() {
  const [visit] = useState(() => readVisitStart(localStorage));
  const [profiles, setProfiles] = useState(visit.profiles);
  const [activeId, setActiveId] = useState(visit.activeId);
  const [character, setCharacter] = useState(visit.character);
  const [ask, setAsk] = useState(visit.ask);
  const [maze, setMaze] = useState<Maze | null>(null);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const waitingForChild = profiles.length >= 2 && activeId === null;
  const selectedChoice = characterRow(character);

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
    if (waitingForChild) {
      return;
    }
    const next = mazeForSheet(generateMaze(Math.random));
    if (next !== null) {
      setMaze(next);
    }
  }

  function handlePrint(): void {
    window.print();
  }

  function handleProfileCreated(profile: ChildProfile): void {
    setProfiles((current) => [...current, profile]);
    setActiveId(profile.id);
    setCharacter(characterChoice(profile.character));
  }

  function handleProfileChosen(profile: ChildProfile): void {
    setActiveId(profile.id);
    setCharacter(characterChoice(profile.character));
  }

  function handleFavoriteSaved(nextProfiles: ChildProfile[], nextBar: string): void {
    setProfiles(nextProfiles);
    setCharacter(characterChoice(nextBar));
  }

  function handleDeleted(next: VisitAfterDelete): void {
    setProfiles(next.profiles);
    setActiveId(next.activeId);
    setCharacter(characterChoice(next.character));
    setAsk(next.ask);
  }

  const hasMaze = maze !== null;

  return (
    <div className={cn("flex w-full flex-col items-center gap-4")}>
      <ProfileCorner
        profiles={profiles}
        activeId={activeId}
        barCharacter={character}
        ask={ask}
        onCreated={handleProfileCreated}
        onChoose={handleProfileChosen}
        onFavoriteSaved={handleFavoriteSaved}
        onDeleted={handleDeleted}
      />
      {hasMaze ? (
        <div className={cn("flex w-full items-center justify-between gap-4 print:hidden")}>
          <div className={cn("flex min-w-0 items-center gap-3")}>
            <CharacterChoiceControl
              character={character}
              selectedChoice={selectedChoice}
              choiceOpen={choiceOpen}
              onOpenChange={setChoiceOpen}
              onSelect={setCharacter}
              rememberLastUsed={activeId === null}
            />
            <GenerateButton onClick={handleGenerate} tone="quiet" disabled={waitingForChild} />
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
            rememberLastUsed={activeId === null}
          />
          <GenerateButton onClick={handleGenerate} tone="hero" disabled={waitingForChild} />
        </div>
      )}
      {hasMaze ? <MazeSheet maze={maze} characterId={character} /> : null}
    </div>
  );
}

function GenerateButton({
  onClick,
  tone,
  disabled,
}: {
  onClick: () => void;
  tone: "hero" | "quiet";
  disabled: boolean;
}) {
  return (
    <Button
      type="button"
      variant={tone === "hero" ? "default" : "outline"}
      onClick={onClick}
      disabled={disabled}
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
  rememberLastUsed,
}: {
  character: CharacterChoice;
  selectedChoice: (typeof CHARACTER_CHOICES)[number];
  choiceOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: CharacterChoice) => void;
  rememberLastUsed: boolean;
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
      <DialogContent className={cn("max-h-[calc(100dvh-2rem)] overflow-y-auto print:hidden")}>
        <DialogTitle className={cn("sr-only")}>Wybierz postać</DialogTitle>
        <CharacterChoiceRows
          selected={character}
          onSelect={(id) => {
            onSelect(id);
            if (rememberLastUsed) {
              writeLastUsed(localStorage, id);
            }
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function MazeSheet({ maze, characterId }: { maze: Maze; characterId: CharacterChoice }) {
  const characterSrc = characterSheetSrc(characterId);
  const sheet = layoutSheet({
    pageWidth: PAGE_WIDTH,
    pageHeight: PAGE_HEIGHT,
    inset: INSET,
    columns: maze.width,
    rows: maze.height,
    entranceColumn: LABEL_COLUMN,
    markSize: CHARACTER_MARK_SIZE,
    characterSelected: characterSrc !== null,
  });
  const cellSize = sheet.maze.width / maze.width;
  const walls = collectWalls(maze, sheet.maze.x, sheet.maze.y, cellSize);
  const mark = sheet.mark;
  const start = sheet.start;

  return (
    <svg
      viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      role="img"
      aria-label="Labirynt"
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
      {mark !== null && characterSrc !== null ? (
        <image href={characterSrc} x={mark.x} y={mark.y} width={mark.width} height={mark.height} />
      ) : start !== null ? (
        <text
          x={start.x}
          y={start.y}
          fill="var(--foreground)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={7}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {start.text}
        </text>
      ) : null}
      <text
        x={sheet.meta.x}
        y={sheet.meta.y}
        fill="var(--foreground)"
        fontFamily="ui-sans-serif, system-ui, sans-serif"
        fontSize={7}
        textAnchor="middle"
        dominantBaseline="middle"
      >
        {sheet.meta.text}
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

function readVisitStart(storage: Pick<Storage, "getItem" | "setItem">): VisitStart {
  const profiles = readChildProfiles(storage, ALLOWED_CHARACTER_IDS);
  const opening = openingVisit(profiles, readLastUsed(storage, ALLOWED_CHARACTER_IDS));
  return {
    profiles,
    activeId: opening.activeId,
    character: characterChoice(opening.character),
    ask: opening.ask,
  };
}

function characterChoice(value: string): CharacterChoice {
  const match = CHARACTER_CHOICES.find((option) => option.id === value);
  if (match === undefined) {
    return "none";
  }
  return match.id;
}
