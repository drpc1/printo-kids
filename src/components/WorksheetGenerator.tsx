import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { CardPage } from "@/components/CardPage";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { LevelChoiceRows } from "@/components/LevelChoiceRows";
import { useCardSettings } from "@/hooks/useCardSettings";
import { useChildProfileVisit, type ProfileBar } from "@/hooks/useChildProfileVisit";
import { useFavoriteCharacter } from "@/hooks/useFavoriteCharacter";
import type { LabiryntSettings } from "@/lib/card-settings";
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
  const visit = useChildProfileVisit({ onApply: applyProfileBar });
  const { profiles, activeId, ask, waitingForChild, visitStart } = visit;
  const memory = useCardSettings("labirynt", visit, handleProfileSwitch);
  const level = memory.settings.level;
  const [character, setCharacter] = useState(visitStart.character);
  const [ownImageHref, setOwnImageHref] = useState(visitStart.ownImageHref ?? null);
  const favorite = useFavoriteCharacter(visit, { character, ownImageHref });
  const [generateFailed, setGenerateFailed] = useState(false);
  const [maze, setMaze] = useState<Maze | null>(null);
  const [sheetShown, setSheetShown] = useState(false);
  const [choiceOpen, setChoiceOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const catalogChoice = characterRow(character === OWN_IMAGE_ID ? "none" : character);
  const barLabel = character === OWN_IMAGE_ID ? OWN_IMAGE_LABEL : catalogChoice.label;
  const barThumb = character === OWN_IMAGE_ID ? ownImageHref : catalogChoice.src;

  function handleGenerate(): void {
    const next = mazeForSheet(generateMaze(level, Math.random), level);
    if (next === null) {
      setGenerateFailed(true);
      return;
    }
    setGenerateFailed(false);
    setMaze(next);
    setSheetShown(true);
  }

  function handleProfileSwitch(next: LabiryntSettings, previous: LabiryntSettings): void {
    redrawForLevel(next.level, previous.level);
  }

  function redrawForLevel(next: LevelId, previous: LevelId): void {
    if (next === previous) {
      return;
    }
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
    recordBarCharacter(localStorage, activeId, id);
  }

  function handleOwnImage(href: string): void {
    setCharacter(OWN_IMAGE_ID);
    setOwnImageHref(href);
    recordBarCharacter(localStorage, activeId, OWN_IMAGE_ID);
  }

  function handleLevelSelect(id: LevelId): void {
    const previous = level;
    redrawForLevel(memory.remember({ level: id }).level, previous);
  }

  function applyProfileBar(bar: ProfileBar): void {
    setCharacter(bar.character);
    if (bar.ownImageHref !== undefined) {
      setOwnImageHref(bar.character === OWN_IMAGE_ID ? bar.ownImageHref : null);
    } else if (bar.character !== OWN_IMAGE_ID) {
      setOwnImageHref(null);
    }
  }

  const sheetLevel = levelById(level);
  const levelControl = (
    <LevelChoiceControl level={sheetLevel} open={levelOpen} onOpenChange={setLevelOpen} onSelect={handleLevelSelect} />
  );
  return (
    <CardPage
      profiles={profiles}
      activeId={activeId}
      ask={ask}
      waitingForChild={waitingForChild}
      barCharacter={character}
      corner={memory.corner}
      note={memory.note ?? favorite.note}
      sheetShown={sheetShown}
      generateFailed={generateFailed}
      failedText={GENERATE_FAILED_TEXT}
      onGenerate={handleGenerate}
      printDisabled={maze === null}
      controls={
        <>
          <CharacterChoiceControl
            character={character}
            label={barLabel}
            thumbSrc={barThumb}
            choiceOpen={choiceOpen}
            onOpenChange={setChoiceOpen}
            onSelect={handleCharacterSelect}
            onCopied={handleOwnImage}
            favorite={favorite.offer}
          />
          {levelControl}
        </>
      }
      sheet={
        maze !== null ? (
          <MazeSheet maze={maze} characterId={character} level={sheetLevel} ownImageHref={ownImageHref} />
        ) : null
      }
    />
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
          aria-label={`Poziom: ${level.barLabel}`}
          className={cn("text-muted-foreground hover:text-foreground h-auto gap-1.5 px-2 py-1 text-base font-normal")}
        >
          <span>Poziom:</span>
          {level.barLabel}
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
    entranceColumn: maze.entrance.col,
    exitColumn: maze.exit.col,
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
