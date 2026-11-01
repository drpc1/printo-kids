import { useState } from "react";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { LevelChoice } from "@/components/LevelChoice";
import { CharacterInstruction } from "@/components/SpeechBand";
import { CardPage } from "@/components/CardPage";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { MoneySettings } from "@/lib/card-settings";
import { generateMoneyCard, type MoneyCard } from "@/lib/money/generate";
import { layoutMoneySheet, layoutPile, type MoneyPileArea } from "@/lib/money/layout";
import { MONEY_LEVELS, moneyLevelById, type MoneyLevelId } from "@/lib/money/levels";
import { MONEY_SHEET } from "@/lib/money/sheet";
import { cn } from "@/lib/utils";

const INSTRUCTION_TEXT = MONEY_SHEET.instructionLines.join(" ");

/**
 * The "Kto ma więcej?" card page: Generuj, the character and level buttons, the card, Drukuj, and the shared profile
 * corner. The chosen character stands by the instruction on the card and says it. The level comes from
 * `useCardSettings` (the active profile's, or the device's) and every change is remembered at once; the page never
 * touches the maze's last-used parameters, it only keeps the bar values the profile corner shows. The card is black
 * and has no answer on it: between the two piles of a row there is an empty square for the child's "<", ">" or "=".
 * A profile switch with a card shown draws a new card when the level changed.
 */
export default function MoneyGenerator() {
  const { visit, bar, favorite } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [levelOpen, setLevelOpen] = useState(false);
  const [card, setCard] = useState<MoneyCard | null>(null);
  const [generateFailed, setGenerateFailed] = useState(false);
  const memory = useCardSettings("pieniadze", visit, handleProfileSwitch);
  const { level: levelId } = memory.settings;
  const sheetShown = card !== null;

  function generateFor(id: MoneyLevelId): void {
    const next = generateMoneyCard(Math.random, card?.key ?? null, moneyLevelById(id));
    if (next === null) {
      setGenerateFailed(true);
      return;
    }
    setGenerateFailed(false);
    setCard(next);
  }

  function handleGenerate(): void {
    generateFor(levelId);
  }

  function handleLevelSelect(id: MoneyLevelId): void {
    memory.remember({ level: id });
    if (card !== null && !waitingForChild) {
      generateFor(id);
    }
  }

  function handleProfileSwitch(next: MoneySettings, previous: MoneySettings): void {
    if (card !== null && next.level !== previous.level) {
      generateFor(next.level);
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
      level={moneyLevelById(levelId)}
      levels={MONEY_LEVELS}
      open={levelOpen}
      onOpenChange={setLevelOpen}
      onSelect={handleLevelSelect}
      disabled={waitingForChild}
    />
  );

  return (
    <CardPage
      profiles={profiles}
      activeId={activeId}
      ask={ask}
      waitingForChild={waitingForChild}
      barCharacter={bar.character}
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
        </>
      }
      sheet={
        <>
          {card !== null ? (
            <MoneySheet card={card} characterId={bar.character} characterSrc={bar.characterSrc} />
          ) : null}
        </>
      }
    />
  );
}

function MoneySheet({
  card,
  characterId,
  characterSrc,
}: {
  card: MoneyCard;
  characterId: string;
  characterSrc: string | null;
}) {
  const sheet = layoutMoneySheet({
    pageWidth: MONEY_SHEET.pageWidth,
    pageHeight: MONEY_SHEET.pageHeight,
    inset: MONEY_SHEET.inset,
    rowCount: card.rows.length,
    bandHeight: MONEY_SHEET.bandHeight,
    bandGap: MONEY_SHEET.bandGap,
    rowGap: MONEY_SHEET.rowGap,
    signSize: MONEY_SHEET.signSize,
    signGap: MONEY_SHEET.signGap,
    pilePadding: MONEY_SHEET.pilePadding,
  });

  return (
    <svg
      viewBox={`0 0 ${sheet.page.width} ${sheet.page.height}`}
      className={cn(
        "aspect-[210/297] h-auto w-full ring-1 ring-[var(--foreground)] print:block print:h-[297mm] print:max-h-[297mm] print:w-[210mm] print:overflow-hidden print:ring-0",
      )}
      style={{ printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" }}
      role="img"
      aria-label="Kto ma więcej?"
    >
      <rect width={sheet.page.width} height={sheet.page.height} fill="var(--card)" />
      {characterSrc !== null ? (
        <CharacterInstruction
          pageWidth={sheet.page.width}
          inset={MONEY_SHEET.inset}
          top={sheet.band.y}
          characterId={characterId}
          characterSrc={characterSrc}
          text={INSTRUCTION_TEXT}
        />
      ) : (
        <text
          x={sheet.page.width / 2}
          y={sheet.band.y + sheet.band.height / 2}
          fill="var(--foreground)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={MONEY_SHEET.plainInstructionSize}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {INSTRUCTION_TEXT}
        </text>
      )}
      {card.rows.map((row, index) => {
        const rowLayout = sheet.rows[index];
        return (
          <g key={index}>
            <Pile values={row.left} area={rowLayout.left} />
            <Pile values={row.right} area={rowLayout.right} />
            <rect
              data-sign
              x={rowLayout.sign.x}
              y={rowLayout.sign.y}
              width={rowLayout.sign.size}
              height={rowLayout.sign.size}
              rx={2}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={MONEY_SHEET.signStroke}
            />
          </g>
        );
      })}
    </svg>
  );
}

function Pile({ values, area }: { values: readonly number[]; area: MoneyPileArea }) {
  const laid = layoutPile(values, area.innerWidth);
  const left = area.x + MONEY_SHEET.pilePadding;
  const top = area.y + MONEY_SHEET.pilePadding + (area.innerHeight - laid.height) / 2;

  return (
    <g data-pile>
      <rect
        x={area.x}
        y={area.y}
        width={area.width}
        height={area.height}
        rx={MONEY_SHEET.pileFrameRadius}
        fill="none"
        stroke="var(--foreground)"
        strokeWidth={MONEY_SHEET.pileFrameStroke}
      />
      {laid.pieces.map((piece, index) => {
        const x = left + piece.x;
        const y = top + piece.y;
        return piece.kind === "coin" ? (
          <g key={index}>
            <circle
              cx={x + piece.width / 2}
              cy={y + piece.height / 2}
              r={piece.width / 2 - MONEY_SHEET.coinStroke / 2}
              fill="var(--card)"
              stroke="var(--foreground)"
              strokeWidth={MONEY_SHEET.coinStroke}
            />
            <text
              x={x + piece.width / 2}
              y={y + piece.height / 2}
              fill="var(--foreground)"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontSize={MONEY_SHEET.coinFontSize}
              fontWeight={MONEY_SHEET.fontWeight}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {piece.value}
            </text>
          </g>
        ) : (
          <g key={index}>
            <rect
              x={x}
              y={y}
              width={piece.width}
              height={piece.height}
              rx={1}
              fill="var(--card)"
              stroke="var(--foreground)"
              strokeWidth={MONEY_SHEET.noteStroke}
            />
            <rect
              x={x + MONEY_SHEET.noteInnerInset}
              y={y + MONEY_SHEET.noteInnerInset}
              width={piece.width - 2 * MONEY_SHEET.noteInnerInset}
              height={piece.height - 2 * MONEY_SHEET.noteInnerInset}
              rx={0.6}
              fill="none"
              stroke="var(--foreground)"
              strokeWidth={MONEY_SHEET.noteInnerStroke}
            />
            <text
              x={x + piece.width / 2}
              y={y + piece.height / 2}
              fill="var(--foreground)"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontSize={MONEY_SHEET.noteFontSize}
              fontWeight={MONEY_SHEET.fontWeight}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {piece.value}
            </text>
          </g>
        );
      })}
    </g>
  );
}
