import { useEffect, useState } from "react";
import { ChevronDown, Printer, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CharacterChoiceRows, LevelChoiceRows, ProfileCorner } from "@/components/ProfileCorner";
import { clearActiveProfile, NO_PROFILE, readActiveProfile, writeActiveProfile } from "@/lib/active-profile";
import { openingVisit, readChildProfiles, type ChildProfile, type VisitAfterDelete } from "@/lib/child-profiles";
import { readLastUsed, writeLastUsed } from "@/lib/last-used";
import { generateMaze, mazeForSheet, type Maze, type MazeCell } from "@/lib/maze/generate";
import { levelById, type Level, type LevelId } from "@/lib/maze/levels";
import { CHARACTER_CHOICES, characterRow, characterSheetSrc } from "@/lib/sheet/character";
import { layoutSheet } from "@/lib/sheet/layout";
import { cn } from "@/lib/utils";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET = 10;
const CHARACTER_MARK_SIZE = 30;
const SHEET_LABEL_SIZE = 7;
const GENERATE_FAILED_TEXT = "Nie udało się ułożyć tego poziomu.";

// Button's default size adds has-[>svg]:px-3; the has-[>svg] entries replace it so the icon keeps the full padding.
const ACTION_BUTTON_CLASS =
  "h-auto rounded-full px-6 py-2.5 text-base has-[>svg]:px-6 sm:px-8 sm:py-3.5 sm:text-lg sm:has-[>svg]:px-8";

const ALLOWED_CHARACTER_IDS = CHARACTER_CHOICES.map((option) => option.id);

type CharacterChoice = (typeof CHARACTER_CHOICES)[number]["id"];

interface VisitStart {
  profiles: ChildProfile[];
  activeId: string | null;
  character: CharacterChoice;
  level: LevelId;
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
  const [level, setLevel] = useState(visit.level);
  const [generateFailed, setGenerateFailed] = useState(false);
  const [ask, setAsk] = useState(visit.ask);
  const [maze, setMaze] = useState<Maze | null>(null);
  const [sheetShown, setSheetShown] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const waitingForChild = profiles.length >= 2 && activeId === null;
  const selectedChoice = characterRow(character);

  useEffect(() => {
    const main = document.getElementById("worksheet-home");
    if (main === null) {
      return;
    }
    main.classList.toggle("has-maze", sheetShown);
    main.classList.toggle("justify-start", sheetShown);
    main.classList.toggle("justify-center", !sheetShown);
  }, [sheetShown]);

  function handleGenerate(): void {
    if (waitingForChild) {
      return;
    }
    const next = mazeForSheet(generateMaze(level, Math.random), level);
    if (next === null) {
      setGenerateFailed(true);
      return;
    }
    setGenerateFailed(false);
    setMaze(next);
    setSheetShown(true);
  }

  function applyLevel(next: LevelId): void {
    if (next === level) {
      return;
    }
    setLevel(next);
    if (!sheetShown) {
      setGenerateFailed(false);
      return;
    }
    const redrawn = mazeForSheet(generateMaze(next, Math.random), next);
    setMaze(redrawn);
    setGenerateFailed(redrawn === null);
  }

  function handleCharacterSelect(id: CharacterChoice): void {
    setCharacter(id);
    if (activeId === null) {
      writeLastUsed(localStorage, { character: id, level });
    }
  }

  function handleLevelSelect(id: LevelId): void {
    applyLevel(id);
    if (activeId === null) {
      writeLastUsed(localStorage, { character, level: id });
    }
  }

  function handlePrint(): void {
    window.print();
  }

  function handleProfileCreated(profile: ChildProfile): void {
    setProfiles((current) => [...current, profile]);
    setActiveId(profile.id);
    setCharacter(characterChoice(profile.character));
    applyLevel(profile.level);
    writeActiveProfile(localStorage, profile.id);
  }

  function handleProfileChosen(profile: ChildProfile): void {
    setActiveId(profile.id);
    setCharacter(characterChoice(profile.character));
    applyLevel(profile.level);
    writeActiveProfile(localStorage, profile.id);
  }

  function handleProfileCleared(): void {
    const lastUsed = readLastUsed(localStorage, ALLOWED_CHARACTER_IDS);
    setActiveId(null);
    setCharacter(characterChoice(lastUsed.character));
    applyLevel(lastUsed.level);
    setAsk(false);
    writeActiveProfile(localStorage, NO_PROFILE);
  }

  function handleFavoriteSaved(nextProfiles: ChildProfile[], nextBar: string, nextLevel: LevelId): void {
    setProfiles(nextProfiles);
    setCharacter(characterChoice(nextBar));
    applyLevel(nextLevel);
  }

  function handleDeleted(next: VisitAfterDelete): void {
    setProfiles(next.profiles);
    setActiveId(next.activeId);
    setCharacter(characterChoice(next.character));
    applyLevel(next.level);
    setAsk(next.ask);
    // No active profile after a delete clears the key, so the default rule (single profile, or ask) applies.
    if (next.activeId === null) {
      clearActiveProfile(localStorage);
    } else {
      writeActiveProfile(localStorage, next.activeId);
    }
  }

  const sheetLevel = levelById(level);
  const levelControl = (
    <LevelChoiceControl level={sheetLevel} open={levelOpen} onOpenChange={setLevelOpen} onSelect={handleLevelSelect} />
  );
  const failedNote = generateFailed ? (
    <p role="alert" className={cn("text-destructive text-sm")}>
      {GENERATE_FAILED_TEXT}
    </p>
  ) : null;

  return (
    <div className={cn("flex w-full flex-col items-center gap-4")}>
      <ProfileCorner
        profiles={profiles}
        activeId={activeId}
        barCharacter={character}
        barLevel={level}
        ask={ask}
        onCreated={handleProfileCreated}
        onChoose={handleProfileChosen}
        onFavoriteSaved={handleFavoriteSaved}
        onDeleted={handleDeleted}
        onClearProfile={handleProfileCleared}
      />
      {sheetShown ? (
        <div className={cn("flex w-full flex-col gap-3 print:hidden")}>
          <div className={cn("flex w-full min-w-0 flex-wrap items-center gap-3")}>
            <CharacterChoiceControl
              character={character}
              selectedChoice={selectedChoice}
              choiceOpen={choiceOpen}
              onOpenChange={setChoiceOpen}
              onSelect={handleCharacterSelect}
            />
            {levelControl}
            {failedNote}
          </div>
          <div className={cn("flex w-full items-center gap-3 sm:gap-4")}>
            <GenerateButton
              onClick={handleGenerate}
              tone="quiet"
              disabled={waitingForChild}
              className="flex-1 sm:flex-none"
            />
            <Button
              type="button"
              variant="default"
              onClick={handlePrint}
              disabled={maze === null}
              className={cn(ACTION_BUTTON_CLASS, "flex-1 sm:ml-auto sm:flex-none")}
            >
              <Printer aria-hidden />
              Drukuj
            </Button>
          </div>
        </div>
      ) : (
        <div className={cn("flex flex-col items-center gap-6 print:hidden")}>
          <div className={cn("flex flex-wrap items-center justify-center gap-2")}>
            <CharacterChoiceControl
              character={character}
              selectedChoice={selectedChoice}
              choiceOpen={choiceOpen}
              onOpenChange={setChoiceOpen}
              onSelect={handleCharacterSelect}
            />
            {levelControl}
          </div>
          <GenerateButton onClick={handleGenerate} tone="hero" disabled={waitingForChild} />
          {failedNote}
        </div>
      )}
      {maze !== null ? <MazeSheet maze={maze} characterId={character} level={sheetLevel} /> : null}
    </div>
  );
}

function GenerateButton({
  onClick,
  tone,
  disabled,
  className,
}: {
  onClick: () => void;
  tone: "hero" | "quiet";
  disabled: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant={tone === "hero" ? "default" : "outline"}
      onClick={onClick}
      disabled={disabled}
      className={cn(ACTION_BUTTON_CLASS, className)}
    >
      <Shuffle aria-hidden />
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
      <DialogContent className={cn("max-h-[calc(100dvh-2rem)] print:hidden")}>
        <DialogTitle className={cn("sr-only")}>Wybierz postać</DialogTitle>
        <CharacterChoiceRows
          selected={character}
          onSelect={(id) => {
            onSelect(id);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function LevelChoiceControl({
  level,
  open,
  onOpenChange,
  onSelect,
}: {
  level: Level;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: LevelId) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Poziom: ${level.label}`}
          className={cn("text-muted-foreground hover:text-foreground h-auto gap-1.5 px-2 py-1 text-base font-normal")}
        >
          <span>Poziom:</span>
          {level.label}
          <ChevronDown className={cn("size-4")} aria-hidden />
        </Button>
      </DialogTrigger>
      <DialogContent className={cn("max-h-[calc(100dvh-2rem)] print:hidden")}>
        <DialogTitle className={cn("sr-only")}>Wybierz poziom</DialogTitle>
        <LevelChoiceRows
          selected={level.id}
          onSelect={(id) => {
            onSelect(id);
            onOpenChange(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}

function MazeSheet({ maze, characterId, level }: { maze: Maze; characterId: CharacterChoice; level: Level }) {
  const characterSrc = characterSheetSrc(characterId);
  const sheet = layoutSheet({
    pageWidth: PAGE_WIDTH,
    pageHeight: PAGE_HEIGHT,
    inset: INSET,
    columns: maze.width,
    rows: maze.height,
    entranceColumn: level.entrance.col,
    exitColumn: level.exit.col,
    markSize: CHARACTER_MARK_SIZE,
    characterSelected: level.showCharacter && characterSrc !== null,
    levelShowsCharacter: level.showCharacter,
    labelHeight: SHEET_LABEL_SIZE,
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
          fontSize={SHEET_LABEL_SIZE}
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
        fontSize={SHEET_LABEL_SIZE}
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
  const opening = openingVisit(profiles, readLastUsed(storage, ALLOWED_CHARACTER_IDS), readActiveProfile(storage));
  return {
    profiles,
    activeId: opening.activeId,
    character: characterChoice(opening.character),
    level: opening.level,
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
