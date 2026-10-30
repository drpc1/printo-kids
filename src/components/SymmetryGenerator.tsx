import { useState } from "react";
import { CategoryChoice } from "@/components/CategoryChoice";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { LevelChoice } from "@/components/LevelChoice";
import { CharacterInstruction } from "@/components/SpeechBand";
import { CardPage } from "@/components/CardPage";
import { SettingToggle } from "@/components/SettingToggle";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { SymmetrySettings } from "@/lib/card-settings";
import { symmetryDrawnCells } from "@/lib/symmetry/colors";
import { generateSymmetryCard, type SymmetryCard } from "@/lib/symmetry/generate";
import { SYMMETRY_LEVELS, symmetryLevelById, type SymmetryLevelId } from "@/lib/symmetry/levels";
import { layoutSymmetrySheet } from "@/lib/symmetry/layout";
import { SYMMETRY_SHEET } from "@/lib/symmetry/sheet";
import { instructionBoxHeight } from "@/lib/sheet/speech";
import { cn } from "@/lib/utils";

/**
 * The symmetry card page: Generuj, the character, level and category buttons, the colors switch, the card, Drukuj, and the
 * shared profile corner. The chosen character stands by the instruction on the card and says it. The level, category and colors come from `useCardSettings`: the
 * active profile's (or the device's), and every change is remembered at once. The page never touches the maze's
 * last-used parameters; it only keeps the bar values the profile corner shows. Switching colors redraws the same
 * card; it never generates a new one. A profile switch with a card shown draws a new card when the level or the
 * category changed.
 */
export default function SymmetryGenerator() {
  const { visit, bar, favorite, barLevel } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [levelOpen, setLevelOpen] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [card, setCard] = useState<SymmetryCard | null>(null);
  const [generateFailed, setGenerateFailed] = useState(false);
  const memory = useCardSettings("symetria", visit, handleProfileSwitch);
  const { level: levelId, category: categoryId, colors } = memory.settings;
  const sheetShown = card !== null;

  function generateFor(settings: SymmetrySettings): void {
    const next = generateSymmetryCard(
      Math.random,
      card?.key ?? null,
      symmetryLevelById(settings.level),
      settings.category,
    );
    if (next === null) {
      setGenerateFailed(true);
      return;
    }
    setGenerateFailed(false);
    setCard(next);
  }

  function handleGenerate(): void {
    generateFor(memory.settings);
  }

  function handleLevelSelect(id: SymmetryLevelId): void {
    const next = memory.remember({ level: id });
    if (card !== null && !waitingForChild) {
      generateFor(next);
    }
  }

  function handleProfileSwitch(next: SymmetrySettings, previous: SymmetrySettings): void {
    if (card !== null && (next.level !== previous.level || next.category !== previous.category)) {
      generateFor(next);
    }
  }

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
  const levelControl = (
    <LevelChoice
      level={symmetryLevelById(levelId)}
      levels={SYMMETRY_LEVELS}
      open={levelOpen}
      onOpenChange={setLevelOpen}
      onSelect={handleLevelSelect}
      disabled={waitingForChild}
    />
  );
  const categoryControl = (
    <CategoryChoice
      categoryId={categoryId}
      open={categoryOpen}
      onOpenChange={setCategoryOpen}
      onSelect={(category) => {
        memory.remember({ category });
      }}
      disabled={waitingForChild}
    />
  );
  const colorsControl = (
    <SettingToggle
      label="Kolory"
      checked={colors}
      onCheckedChange={(next) => {
        memory.remember({ colors: next });
      }}
    />
  );
  return (
    <CardPage
      profiles={profiles}
      activeId={activeId}
      ask={ask}
      waitingForChild={waitingForChild}
      barCharacter={bar.character}
      barLevel={barLevel}
      corner={memory.corner}
      newProfileCards={memory.newProfileCards}
      note={memory.note ?? favorite.note}
      sheetShown={sheetShown}
      generateFailed={generateFailed}
      onGenerate={handleGenerate}
      controls={
        <>
          {characterControl}
          {levelControl}
          {categoryControl}
          {colorsControl}
        </>
      }
      sheet={
        <>
          {card !== null ? (
            <SymmetrySheet card={card} colors={colors} characterId={bar.character} characterSrc={bar.characterSrc} />
          ) : null}
        </>
      }
    />
  );
}

function SymmetrySheet({
  card,
  colors,
  characterId,
  characterSrc,
}: {
  card: SymmetryCard;
  colors: boolean;
  characterId: string;
  characterSrc: string | null;
}) {
  const instructionHeight = instructionBoxHeight(characterSrc !== null, SYMMETRY_SHEET.instructionSize);
  const sheet = layoutSymmetrySheet({
    pageWidth: SYMMETRY_SHEET.pageWidth,
    pageHeight: SYMMETRY_SHEET.pageHeight,
    inset: SYMMETRY_SHEET.inset,
    columns: card.columns,
    rows: card.rows,
    cellSize: card.cellSize,
    instructionHeight,
    instructionGap: SYMMETRY_SHEET.instructionGap,
  });
  const grid = sheet.grid;
  const cellSize = grid.width / card.columns;
  const columnLines = Array.from({ length: card.columns - 1 }, (_, index) => grid.x + (index + 1) * cellSize);
  const rowLines = Array.from({ length: card.rows - 1 }, (_, index) => grid.y + (index + 1) * cellSize);

  return (
    <svg
      viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Symetria"
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
      {characterSrc !== null ? (
        <CharacterInstruction
          pageWidth={sheet.page.width}
          inset={SYMMETRY_SHEET.inset}
          top={sheet.instruction.y - instructionHeight / 2}
          characterId={characterId}
          characterSrc={characterSrc}
          text={SYMMETRY_SHEET.instructionText}
        />
      ) : (
        <text
          x={sheet.instruction.x}
          y={sheet.instruction.y}
          fill="var(--foreground)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={SYMMETRY_SHEET.instructionSize}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {SYMMETRY_SHEET.instructionText}
        </text>
      )}
      <g>
        {symmetryDrawnCells(card, colors).map(({ cell, fill, opacity }) => (
          <rect
            key={`${cell.col},${cell.row}`}
            x={grid.x + cell.col * cellSize}
            y={grid.y + cell.row * cellSize}
            width={cellSize}
            height={cellSize}
            fill={fill}
            fillOpacity={opacity}
          />
        ))}
      </g>
      <g fill="none" stroke="var(--foreground)" strokeWidth={SYMMETRY_SHEET.gridStroke}>
        {columnLines.map((x) => (
          <line key={`c${x}`} x1={x} y1={grid.y} x2={x} y2={grid.y + grid.height} />
        ))}
        {rowLines.map((y) => (
          <line key={`r${y}`} x1={grid.x} y1={y} x2={grid.x + grid.width} y2={y} />
        ))}
      </g>
      <rect
        x={grid.x}
        y={grid.y}
        width={grid.width}
        height={grid.height}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={SYMMETRY_SHEET.frameStroke}
        strokeLinejoin="miter"
      />
      <line
        x1={sheet.axis.x1}
        y1={sheet.axis.y1}
        x2={sheet.axis.x2}
        y2={sheet.axis.y2}
        stroke="var(--foreground)"
        strokeWidth={SYMMETRY_SHEET.axisStroke}
        strokeDasharray={SYMMETRY_SHEET.axisDash}
      />
    </svg>
  );
}
