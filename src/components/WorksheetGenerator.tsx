import { useEffect, useState } from "react";
import { ChevronDown, Printer } from "lucide-react";
import { ACTION_BUTTON_CLASS, GenerateButton } from "@/components/GenerateButton";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CharacterChoiceRows, LevelChoiceRows, ProfileCorner } from "@/components/ProfileCorner";
import { useChildProfileVisit, type ProfileBar } from "@/hooks/useChildProfileVisit";
import { generateMaze, mazeForSheet, type Maze } from "@/lib/maze/generate";
import { levelById, type Level, type LevelId } from "@/lib/maze/levels";
import {
  characterContentLeft,
  characterRow,
  characterSheetSrc,
  OWN_IMAGE_ID,
  OWN_IMAGE_LABEL,
  type SheetCharacterId,
} from "@/lib/sheet/character";
import { layoutSheet } from "@/lib/sheet/layout";
import { readOwnImage, recordBarCharacter } from "@/lib/sheet/own-image-store";
import { collectWalls } from "@/lib/sheet/walls";
import { cn } from "@/lib/utils";

const PAGE_WIDTH = 210;
const PAGE_HEIGHT = 297;
const INSET = 10;
const CHARACTER_MARK_SIZE = 30;
const SHEET_LABEL_SIZE = 7;
const GENERATE_FAILED_TEXT = "Nie udało się ułożyć tego poziomu.";

export default function WorksheetGenerator() {
  const { profiles, activeId, ask, waitingForChild, visitStart, corner } = useChildProfileVisit({
    onApply: applyProfileBar,
  });
  const [character, setCharacter] = useState(visitStart.character);
  const [ownImageHref, setOwnImageHref] = useState(visitStart.ownImageHref ?? null);
  const [level, setLevel] = useState(visitStart.level);
  const [generateFailed, setGenerateFailed] = useState(false);
  const [maze, setMaze] = useState<Maze | null>(null);
  const [sheetShown, setSheetShown] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const catalogChoice = characterRow(character === OWN_IMAGE_ID ? "none" : character);
  const barLabel = character === OWN_IMAGE_ID ? OWN_IMAGE_LABEL : catalogChoice.label;
  const barThumb = character === OWN_IMAGE_ID ? ownImageHref : catalogChoice.src;

  useEffect(() => {
    const main = document.getElementById("worksheet-home");
    if (main === null) {
      return;
    }
    main.classList.toggle("has-sheet", sheetShown);
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

  function handleCharacterSelect(id: SheetCharacterId): void {
    if (id === OWN_IMAGE_ID) {
      const href = readOwnImage(localStorage);
      if (href === null) {
        return;
      }
      setOwnImageHref(href);
    } else {
      setOwnImageHref(null);
    }
    setCharacter(id);
    recordBarCharacter(localStorage, activeId, id, level);
  }

  function handleOwnImage(href: string): void {
    setCharacter(OWN_IMAGE_ID);
    setOwnImageHref(href);
    recordBarCharacter(localStorage, activeId, OWN_IMAGE_ID, level);
  }

  function handleLevelSelect(id: LevelId): void {
    applyLevel(id);
    if (activeId === null) {
      recordBarCharacter(localStorage, null, character, id);
    }
  }

  function handlePrint(): void {
    window.print();
  }

  function applyProfileBar(bar: ProfileBar): void {
    setCharacter(bar.character);
    if (bar.ownImageHref !== undefined) {
      setOwnImageHref(bar.character === OWN_IMAGE_ID ? bar.ownImageHref : null);
    } else if (bar.character !== OWN_IMAGE_ID) {
      setOwnImageHref(null);
    }
    applyLevel(bar.level);
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
        onCreated={corner.onCreated}
        onChoose={corner.onChoose}
        onFavoriteSaved={corner.onFavoriteSaved}
        onDeleted={corner.onDeleted}
        onClearProfile={corner.onClearProfile}
      />
      {sheetShown ? (
        <div className={cn("flex w-full flex-col gap-3 print:hidden")}>
          <div className={cn("flex w-full min-w-0 flex-wrap items-center gap-3")}>
            <CharacterChoiceControl
              character={character}
              label={barLabel}
              thumbSrc={barThumb}
              choiceOpen={choiceOpen}
              onOpenChange={setChoiceOpen}
              onSelect={handleCharacterSelect}
              onCopied={handleOwnImage}
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
              label={barLabel}
              thumbSrc={barThumb}
              choiceOpen={choiceOpen}
              onOpenChange={setChoiceOpen}
              onSelect={handleCharacterSelect}
              onCopied={handleOwnImage}
            />
            {levelControl}
          </div>
          <GenerateButton onClick={handleGenerate} tone="hero" disabled={waitingForChild} />
          {failedNote}
        </div>
      )}
      {maze !== null ? (
        <MazeSheet maze={maze} characterId={character} level={sheetLevel} ownImageHref={ownImageHref} />
      ) : null}
    </div>
  );
}

function CharacterChoiceControl({
  character,
  label,
  thumbSrc,
  choiceOpen,
  onOpenChange,
  onSelect,
  onCopied,
}: {
  character: SheetCharacterId;
  label: string;
  thumbSrc: string | null;
  choiceOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (id: SheetCharacterId) => void;
  onCopied: (href: string) => void;
}) {
  return (
    <Dialog open={choiceOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          aria-label={`Postać: ${label}`}
          className={cn("text-muted-foreground hover:text-foreground h-auto gap-1.5 px-2 py-1 text-base font-normal")}
        >
          <span>Postać:</span>
          {thumbSrc !== null ? <img src={thumbSrc} alt="" width={24} height={24} className={cn("size-6")} /> : null}
          {label}
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
          onCopied={(href) => {
            onCopied(href);
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

function MazeSheet({
  maze,
  characterId,
  level,
  ownImageHref,
}: {
  maze: Maze;
  characterId: SheetCharacterId;
  level: Level;
  ownImageHref: string | null;
}) {
  const characterSrc = characterId === OWN_IMAGE_ID ? ownImageHref : characterSheetSrc(characterId);
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
  // The 30 mm box is already on the maze edge. Catalog files keep empty pixels on the left,
  // so a pinned mark shifts by that margin and the drawing starts on the wall.
  const contentLeft = mark !== null && mark.x === sheet.maze.x ? characterContentLeft(characterId) : 0;

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
        <image
          href={characterSrc}
          x={mark.x - contentLeft * mark.width}
          y={mark.y}
          width={mark.width}
          height={mark.height}
          preserveAspectRatio="xMidYMid meet"
        />
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
