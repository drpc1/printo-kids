import { Fragment, useEffect, useState } from "react";
import { Printer } from "lucide-react";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { ACTION_BUTTON_CLASS, GenerateButton } from "@/components/GenerateButton";
import { Button } from "@/components/ui/button";
import { ProfileCorner } from "@/components/ProfileCorner";
import { RememberedNote } from "@/components/RememberedNote";
import { CharacterInstruction } from "@/components/SpeechBand";
import { useBarCharacter } from "@/hooks/useBarCharacter";
import { useFavoriteCharacter } from "@/hooks/useFavoriteCharacter";
import { useCardSettings } from "@/hooks/useCardSettings";
import { useChildProfileVisit, type ProfileBar } from "@/hooks/useChildProfileVisit";
import type { SudokuCardSettings } from "@/lib/card-settings";
import { SudokuChoice } from "@/components/SudokuChoice";
import { SudokuSymbolsChoice } from "@/components/SudokuSymbolsChoice";
import { Switch } from "@/components/ui/switch";
import { sudokuShapeInk } from "@/lib/sudoku/colors";
import { generateSudokuCard, sudokuBlock, type SudokuCard } from "@/lib/sudoku/generate";
import { layoutSudokuSheet } from "@/lib/sudoku/layout";
import { layoutSudokuShapeList } from "@/lib/sudoku/shape-list";
import {
  SUDOKU_LEVELS,
  SUDOKU_SIZES,
  sudokuHasLevels,
  sudokuHasSymbolChoice,
  sudokuLevelDescription,
  type SudokuSettings,
} from "@/lib/sudoku/levels";
import { SUDOKU_SHEET } from "@/lib/sudoku/sheet";
import { sudokuShapePath } from "@/lib/sudoku/shapes";
import { SPEECH_BAND } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

const GENERATE_FAILED_TEXT = "Nie udało się ułożyć karty.";

/**
 * The sudoku card page: Generuj, the character, size, level and shapes-or-digits choices, the card, Drukuj, and the shared profile
 * corner. The chosen character stands by the instruction on the card and says it. The settings and the colors come from `useCardSettings` (the active profile's, or
 * the device's) and every change is remembered at once; the page never touches the maze's last-used parameters, it
 * only keeps the bar values the profile corner shows. A profile switch with a card shown draws a new card when the
 * size, level or symbols changed.
 * Changing a setting while a card is shown generates a new card for the new settings; the Kolory switch (shapes only) redraws the same card in crayon colors and never generates a new one.
 */
export default function SudokuGenerator() {
  const visit = useChildProfileVisit({ onApply: applyProfileBar });
  const { profiles, activeId, ask, waitingForChild, visitStart } = visit;
  const [barLevel, setBarLevel] = useState(visitStart.level);
  const bar = useBarCharacter(visit, barLevel);
  const favorite = useFavoriteCharacter(visit, bar);
  const [sizeOpen, setSizeOpen] = useState(false);
  const [levelOpen, setLevelOpen] = useState(false);
  const [card, setCard] = useState<SudokuCard | null>(null);
  const [generateFailed, setGenerateFailed] = useState(false);
  const memory = useCardSettings("sudoku", visit, handleProfileSwitch);
  const { colors, ...settings } = memory.settings;
  const sheetShown = card !== null;

  useEffect(() => {
    const main = document.getElementById("worksheet-home");
    if (main === null) {
      return;
    }
    main.classList.toggle("has-sheet", sheetShown);
    main.classList.toggle("justify-start", sheetShown);
    main.classList.toggle("justify-center", !sheetShown);
  }, [sheetShown]);

  function generateFor(next: SudokuSettings): void {
    const nextCard = generateSudokuCard(Math.random, card?.key ?? null, next);
    if (nextCard === null) {
      setGenerateFailed(true);
      return;
    }
    setGenerateFailed(false);
    setCard(nextCard);
  }

  function handleGenerate(): void {
    if (waitingForChild) {
      return;
    }
    generateFor(settings);
  }

  function handleSettingChange(change: Partial<SudokuSettings>): void {
    if (waitingForChild) {
      return;
    }
    const next = memory.remember(change);
    if (card !== null) {
      generateFor(next);
    }
  }

  function handleProfileSwitch(next: SudokuCardSettings, previous: SudokuCardSettings): void {
    if (
      card !== null &&
      (next.size !== previous.size || next.level !== previous.level || next.symbols !== previous.symbols)
    ) {
      generateFor(next);
    }
  }

  function handlePrint(): void {
    window.print();
  }

  function applyProfileBar(next: ProfileBar): void {
    bar.applyBar(next);
    setBarLevel(next.level);
  }

  // The level rows say how many cells are empty for the current size.
  const levelOptions = SUDOKU_LEVELS.map((option) => ({
    ...option,
    description: settings.size === 4 ? undefined : sudokuLevelDescription(settings.size, option.id),
  }));
  const characterControl = (
    <CharacterChoiceControl
      character={bar.character}
      label={bar.label}
      thumbSrc={bar.thumbSrc}
      choiceOpen={bar.choiceOpen}
      onOpenChange={bar.setChoiceOpen}
      onSelect={bar.select}
      onCopied={bar.setOwnImage}
      favorite={favorite.offer}
    />
  );
  const settingsControls = (
    <>
      {characterControl}
      <SudokuChoice
        label="Rozmiar"
        dialogTitle="Wybierz rozmiar"
        options={SUDOKU_SIZES}
        value={settings.size}
        open={sizeOpen}
        onOpenChange={setSizeOpen}
        onSelect={(size) => {
          handleSettingChange({ size });
        }}
      />
      {sudokuHasLevels(settings.size) ? (
        <SudokuChoice
          label="Poziom"
          dialogTitle="Wybierz poziom"
          options={levelOptions}
          value={settings.level}
          open={levelOpen}
          onOpenChange={setLevelOpen}
          onSelect={(level) => {
            handleSettingChange({ level });
          }}
        />
      ) : null}
      {sudokuHasSymbolChoice(settings.size) ? (
        <SudokuSymbolsChoice
          symbols={settings.symbols}
          onSelect={(symbols) => {
            handleSettingChange({ symbols });
          }}
        />
      ) : null}
      {settings.symbols === "shapes" ? (
        <label className={cn("text-muted-foreground flex items-center gap-2 text-base")}>
          <Switch
            checked={colors}
            onCheckedChange={(next) => {
              memory.remember({ colors: next });
            }}
          />
          Kolory
        </label>
      ) : null}
    </>
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
        barCharacter={bar.character}
        barLevel={barLevel}
        ask={ask}
        onCreated={memory.corner.onCreated}
        onChoose={memory.corner.onChoose}
        onFavoriteSaved={memory.corner.onFavoriteSaved}
        onDeleted={memory.corner.onDeleted}
        onClearProfile={memory.corner.onClearProfile}
        newProfileCards={memory.newProfileCards}
      />
      {sheetShown ? (
        <div className={cn("flex w-full flex-col gap-3 print:hidden")}>
          <div className={cn("flex w-full min-w-0 flex-wrap items-center gap-3")}>
            {settingsControls}
            {failedNote}
          </div>
          <RememberedNote note={memory.note ?? favorite.note} profileActive={activeId !== null} />
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
              className={cn(ACTION_BUTTON_CLASS, "flex-1 sm:ml-auto sm:flex-none")}
            >
              <Printer aria-hidden />
              Drukuj
            </Button>
          </div>
        </div>
      ) : (
        <div className={cn("flex flex-col items-center gap-6 print:hidden")}>
          <div className={cn("flex flex-wrap items-center justify-center gap-3")}>{settingsControls}</div>
          <RememberedNote note={memory.note ?? favorite.note} profileActive={activeId !== null} />
          <GenerateButton onClick={handleGenerate} tone="hero" disabled={waitingForChild} />
          {failedNote}
        </div>
      )}
      {card !== null ? (
        <SudokuSheet card={card} colors={colors} characterId={bar.character} characterSrc={bar.characterSrc} />
      ) : null}
    </div>
  );
}

function SudokuSheet({
  card,
  colors,
  characterId,
  characterSrc,
}: {
  card: SudokuCard;
  colors: boolean;
  characterId: string;
  characterSrc: string | null;
}) {
  const block = sudokuBlock(card.size);
  const cellSize = SUDOKU_SHEET.cellSize[card.size];
  const sheet = layoutSudokuSheet({
    pageWidth: SUDOKU_SHEET.pageWidth,
    pageHeight: SUDOKU_SHEET.pageHeight,
    inset: SUDOKU_SHEET.inset,
    size: card.size,
    blockRows: block.rows,
    blockColumns: block.columns,
    cellSize,
    instructionLineCount: SUDOKU_SHEET.instructionLines.length,
    instructionSize: SUDOKU_SHEET.instructionSize,
    instructionLineGap: SUDOKU_SHEET.instructionLineGap,
    instructionGap: SUDOKU_SHEET.instructionGap,
    ...(characterSrc !== null ? { instructionBoxHeight: SPEECH_BAND.characterSize } : {}),
  });
  const grid = sheet.grid;
  const shapeSize = cellSize * SUDOKU_SHEET.shapeScale;
  const digitSize = cellSize * SUDOKU_SHEET.digitScale;
  const shapeList = layoutSudokuShapeList({
    grid: sheet.grid,
    pageWidth: SUDOKU_SHEET.pageWidth,
    pageHeight: SUDOKU_SHEET.pageHeight,
    inset: SUDOKU_SHEET.inset,
    symbols: card.symbols,
    shapes: card.shapes,
  });

  return (
    <svg
      viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Sudoku"
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
      {characterSrc !== null ? (
        <CharacterInstruction
          pageWidth={sheet.page.width}
          inset={SUDOKU_SHEET.inset}
          top={sheet.instruction.top}
          characterId={characterId}
          characterSrc={characterSrc}
          text={SUDOKU_SHEET.instructionLines.join(" ")}
        />
      ) : (
        SUDOKU_SHEET.instructionLines.map((text, index) => (
          <text
            key={text}
            x={sheet.instruction.x}
            y={sheet.instruction.ys[index]}
            fill="var(--foreground)"
            fontFamily="ui-sans-serif, system-ui, sans-serif"
            fontSize={SUDOKU_SHEET.instructionSize}
            textAnchor="middle"
            dominantBaseline="middle"
          >
            {text}
          </text>
        ))
      )}
      {card.symbols === "digits" ? (
        <g
          fill="var(--foreground)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={digitSize}
          textAnchor="middle"
          dominantBaseline="central"
        >
          {card.givens.flatMap((row, r) =>
            row.map((symbol, c) => {
              if (symbol === null) {
                return null;
              }
              const center = sheet.cellCenter(r, c);
              return (
                <text key={`${r},${c}`} x={center.x} y={center.y}>
                  {symbol + 1}
                </text>
              );
            }),
          )}
        </g>
      ) : (
        <g strokeWidth={SUDOKU_SHEET.shapeStroke} strokeLinejoin="round">
          {card.givens.flatMap((row, r) =>
            row.map((symbol, c) => {
              if (symbol === null) {
                return null;
              }
              const center = sheet.cellCenter(r, c);
              const shape = card.shapes[symbol];
              const ink = sudokuShapeInk(shape, colors);
              return (
                <path
                  key={`${r},${c}`}
                  d={sudokuShapePath(shape, center.x, center.y, shapeSize)}
                  fill={colors ? ink : "none"}
                  stroke={ink}
                />
              );
            }),
          )}
        </g>
      )}
      <g stroke="var(--foreground)" strokeWidth={SUDOKU_SHEET.cellStroke}>
        {sheet.cellLines.map((line) => (
          <line key={`${line.x1},${line.y1}`} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
        ))}
      </g>
      <g stroke="var(--foreground)" strokeWidth={SUDOKU_SHEET.blockStroke}>
        {sheet.blockLines.map((line) => (
          <line key={`${line.x1},${line.y1}`} x1={line.x1} y1={line.y1} x2={line.x2} y2={line.y2} />
        ))}
      </g>
      <rect
        x={grid.x}
        y={grid.y}
        width={grid.width}
        height={grid.height}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={SUDOKU_SHEET.frameStroke}
        strokeLinejoin="miter"
      />
      {shapeList.items.length > 0 ? (
        <g data-shape-list="">
          {shapeList.items.map((item) => {
            const ink = sudokuShapeInk(item.id, colors);
            return (
              <Fragment key={item.id}>
                <path
                  d={sudokuShapePath(item.id, item.drawing.x, item.drawing.y, item.drawing.size)}
                  fill={colors ? ink : "none"}
                  stroke={ink}
                  strokeWidth={SUDOKU_SHEET.shapeStroke}
                  strokeLinejoin="round"
                />
                <text
                  x={item.label.x}
                  y={item.label.y}
                  fill="var(--foreground)"
                  fontFamily="ui-sans-serif, system-ui, sans-serif"
                  fontSize={item.label.size}
                  textAnchor="middle"
                  dominantBaseline="middle"
                >
                  {item.name}
                </text>
              </Fragment>
            );
          })}
        </g>
      ) : null}
    </svg>
  );
}
