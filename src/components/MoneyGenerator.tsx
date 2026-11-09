import { useEffect, useState } from "react";
import { CharacterChoiceControl } from "@/components/CharacterChoiceControl";
import { LevelChoice } from "@/components/LevelChoice";
import { SudokuChoice } from "@/components/SudokuChoice";
import { SettingToggle } from "@/components/SettingToggle";
import { CharacterInstruction } from "@/components/SpeechBand";
import { CardPage } from "@/components/CardPage";
import { useCardPage } from "@/hooks/useCardPage";
import { useCardSettings } from "@/hooks/useCardSettings";
import type { MoneySettings } from "@/lib/card-settings";
import { moneyImage, moneyImagePaths } from "@/lib/money/colors";
import { MONEY_CURRENCIES, moneyCurrencyById, type MoneyCurrencyId } from "@/lib/money/currencies";
import { moneyEngine, moneySpec } from "@/lib/money/engine";
import type { MoneyCard } from "@/lib/money/generate";
import { layoutMoneySheet, layoutPile, type MoneyPileArea } from "@/lib/money/layout";
import { moneyLevelById, moneyLevels, type MoneyLevelId } from "@/lib/money/levels";
import { MONEY_SHEET } from "@/lib/money/sheet";
import {
  applySettings,
  failureReason,
  generateSheet,
  markPrinted,
  sheetView,
  type SheetState,
} from "@/lib/sheet-state";
import { cn } from "@/lib/utils";

const INSTRUCTION_TEXT = MONEY_SHEET.instructionLines.join(" ");

/**
 * The "Kto ma więcej?" card page: Generuj, the character and level buttons, the card, Drukuj, and the shared profile
 * corner. The chosen character stands by the instruction on the card and says it. The level comes from
 * `useCardSettings` (the active profile's, or the device's) and every change is remembered at once; the page never
 * touches the maze's last-used parameters, it only keeps the bar values the profile corner shows. The card is black
 * by default; the Kolory switch draws the pieces as coloured pictures instead (same card, same layout, so it never draws
 * a new one). The card has no answer on it: between the two piles of a row there is an empty square for the child's "<", ">" or "=".
 * The page keeps one `SheetState`: a level change (bar or profile switch) with a card shown draws a new card, a failed
 * draw switches the card off with its reason, and Drukuj on a card that was already printed asks first.
 */
export default function MoneyGenerator() {
  const { visit, bar, favorite } = useCardPage();
  const { profiles, activeId, ask, waitingForChild } = visit;
  const [levelOpen, setLevelOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const [sheet, setSheet] = useState<SheetState<MoneyCard>>({ kind: "idle", failure: null });
  const memory = useCardSettings("pieniadze", visit, handleProfileSwitch);
  const { level: levelId, currency, colors } = memory.settings;
  const view = sheetView(sheet, moneySpec.contentKey(memory.settings));

  // Load the pictures as soon as colors are on (also on a visit that starts with them on), so Generuj and Drukuj never wait.
  useEffect(() => {
    if (colors) {
      for (const path of moneyImagePaths(currency)) {
        new Image().src = path;
      }
    }
  }, [colors, currency]);

  function handleGenerate(): void {
    setSheet(generateSheet(sheet, moneyEngine, memory.settings, Math.random));
  }

  function handleLevelSelect(id: MoneyLevelId): void {
    const next = memory.remember({ level: id });
    if (!waitingForChild) {
      setSheet(applySettings(sheet, moneyEngine, next, Math.random));
    }
  }

  // The currency changes the nominals, so like a level change it draws a new card when one is shown.
  function handleCurrencySelect(id: MoneyCurrencyId): void {
    const next = memory.remember({ currency: id });
    if (!waitingForChild) {
      setSheet(applySettings(sheet, moneyEngine, next, Math.random));
    }
  }

  function handleProfileSwitch(next: MoneySettings): void {
    setSheet(applySettings(sheet, moneyEngine, next, Math.random));
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
      level={moneyLevelById(levelId, currency)}
      levels={moneyLevels(currency)}
      open={levelOpen}
      onOpenChange={setLevelOpen}
      onSelect={handleLevelSelect}
      disabled={waitingForChild}
    />
  );

  const currencyControl = (
    <SudokuChoice
      label="Waluta"
      dialogTitle="Waluta"
      options={MONEY_CURRENCIES}
      value={currency}
      open={currencyOpen}
      onOpenChange={setCurrencyOpen}
      onSelect={handleCurrencySelect}
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
      corner={memory.corner}
      newProfileCards={memory.newProfileCards}
      note={memory.note ?? favorite.note}
      sheetShown={view.kind !== "idle"}
      generateFailed={view.failure !== null}
      failedText={
        view.failure === null
          ? undefined
          : failureReason(view.failure, { levelLabel: moneyLevelById(levelId, currency).label })
      }
      onGenerate={handleGenerate}
      printDisabled={view.kind !== "showing"}
      printedBefore={view.printed}
      onRegenerate={handleGenerate}
      onPrinted={() => {
        setSheet(markPrinted);
      }}
      controls={
        <>
          {characterControl}
          {currencyControl}
          {levelControl}
          {colorsControl}
        </>
      }
      sheet={
        <>
          {view.verified !== null ? (
            <MoneySheet
              card={view.verified.card}
              characterId={bar.character}
              characterSrc={bar.characterSrc}
              colors={colors}
            />
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
  colors,
}: {
  card: MoneyCard;
  characterId: string;
  characterSrc: string | null;
  colors: boolean;
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
            <Pile values={row.left} area={rowLayout.left} colors={colors} currency={card.currency} />
            <Pile values={row.right} area={rowLayout.right} colors={colors} currency={card.currency} />
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

function Pile({
  values,
  area,
  colors,
  currency,
}: {
  values: readonly number[];
  area: MoneyPileArea;
  colors: boolean;
  currency: MoneyCurrencyId;
}) {
  const laid = layoutPile(values, area.innerWidth, currency);
  // The black drawing shows the sign of the euro and the dollar (złoty pieces carry none, as before).
  const symbol = currency === "pln" ? null : moneyCurrencyById(currency).symbol;
  const lift = symbol === null ? 0 : MONEY_SHEET.coinValueLift;
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
        const image = moneyImage(piece.value, currency, colors);
        if (image !== null) {
          // The picture carries the value; it is scaled to the piece box, so every coin has one diameter.
          return (
            <image
              key={index}
              data-money-image
              href={image}
              x={x}
              y={y}
              width={piece.width}
              height={piece.height}
              preserveAspectRatio="xMidYMid meet"
            />
          );
        }
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
              y={y + piece.height / 2 - lift}
              fill="var(--foreground)"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fontSize={MONEY_SHEET.coinFontSize}
              fontWeight={MONEY_SHEET.fontWeight}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {piece.value}
            </text>
            {symbol !== null ? (
              <text
                data-currency-symbol
                x={x + piece.width / 2}
                y={y + piece.height - MONEY_SHEET.coinStroke - 1.8}
                fill="var(--foreground)"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontSize={MONEY_SHEET.currencySymbolFontSize}
                fontWeight={MONEY_SHEET.fontWeight}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {symbol}
              </text>
            ) : null}
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
            {symbol !== null ? (
              <text
                data-currency-symbol
                x={x + piece.width - MONEY_SHEET.noteInnerInset - 1}
                y={y + MONEY_SHEET.noteInnerInset + 1.4}
                fill="var(--foreground)"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fontSize={MONEY_SHEET.currencySymbolFontSize}
                fontWeight={MONEY_SHEET.fontWeight}
                textAnchor="end"
                dominantBaseline="central"
              >
                {symbol}
              </text>
            ) : null}
          </g>
        );
      })}
    </g>
  );
}
