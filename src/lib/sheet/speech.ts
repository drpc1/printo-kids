/**
 * The band at the top of a card where the chosen character stands and says the instruction in a speech bubble.
 * Page units are mm on an A4 sheet. The cards other than the maze share it, so the characters and the bubble look
 * the same everywhere. Without a character a card keeps its plain instruction line and has no band.
 */
export const SPEECH_BAND = {
  /** Side of the square the character is drawn in; it is also the height of the band. */
  characterSize: 26,
  /** Gap between the drawn part of the character and the bubble; the tail crosses it. */
  tailLength: 4,
  /** Half of the tail's height where it meets the bubble. */
  tailHalfHeight: 3.5,
  /** The bubble is this much shorter than the band, split above and below. */
  bubbleInset: 2,
  bubbleRadius: 5,
  bubbleStroke: 0.6,
  /** Space between the bubble's edge and the text. */
  textPadding: 4,
  singleLineSize: 7.5,
  multiLineSize: 6.2,
  /** Distance between two text lines as a multiple of the font size. */
  lineHeightRatio: 1.25,
  /** Average width of a letter as a multiple of the font size, used to check that a line fits the bubble. */
  letterWidthRatio: 0.52,
} as const;

export interface SpeechRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SpeechBandInput {
  pageWidth: number;
  inset: number;
  /** One text line per sentence of the instruction. */
  lines: readonly string[];
  /** Empty margin left and right of the drawing in the character file, as fractions of the file. */
  contentLeft: number;
  contentRight: number;
}

export interface SpeechBandLayout {
  height: number;
  /** The box of the character file. Its drawn part starts on the margin. */
  character: SpeechRect;
  bubble: SpeechRect & { radius: number };
  /** The tail points at the character: its tip, and where it meets the bubble's left edge. */
  tail: { tipX: number; tipY: number; baseX: number; baseTopY: number; baseBottomY: number };
  text: { x: number; size: number; ys: number[]; maxWidth: number };
}

/** Splits an instruction into one line per sentence. */
export function instructionLines(text: string): string[] {
  return text.split(/(?<=[.?!])\s+/).filter((line) => line.length > 0);
}

/** The height the instruction takes: the band with a character, the plain line height without one. */
export function instructionBoxHeight(characterShown: boolean, plainHeight: number): number {
  return characterShown ? SPEECH_BAND.characterSize : plainHeight;
}

/** Rough width of a line of text, the same estimate the layout uses to check that it fits. */
export function estimatedTextWidth(line: string, size: number): number {
  return line.length * size * SPEECH_BAND.letterWidthRatio;
}

export function layoutSpeechBand(input: SpeechBandInput): SpeechBandLayout {
  const { pageWidth, inset, lines, contentLeft, contentRight } = input;
  const size = SPEECH_BAND.characterSize;
  const drawnRight = inset + size * (1 - contentLeft - contentRight);
  const bubbleX = drawnRight + SPEECH_BAND.tailLength;
  const bubbleWidth = pageWidth - inset - bubbleX;
  const bubbleHeight = size - SPEECH_BAND.bubbleInset * 2;
  const centerY = inset + size / 2;
  const textSize = lines.length > 1 ? SPEECH_BAND.multiLineSize : SPEECH_BAND.singleLineSize;
  const pitch = textSize * SPEECH_BAND.lineHeightRatio;

  return {
    height: size,
    character: { x: inset - contentLeft * size, y: inset, width: size, height: size },
    bubble: {
      x: bubbleX,
      y: inset + SPEECH_BAND.bubbleInset,
      width: bubbleWidth,
      height: bubbleHeight,
      radius: SPEECH_BAND.bubbleRadius,
    },
    tail: {
      tipX: drawnRight,
      tipY: centerY + 1,
      baseX: bubbleX,
      baseTopY: centerY - SPEECH_BAND.tailHalfHeight,
      baseBottomY: centerY + SPEECH_BAND.tailHalfHeight,
    },
    text: {
      x: bubbleX + bubbleWidth / 2,
      size: textSize,
      ys: lines.map((_, index) => centerY + (index - (lines.length - 1) / 2) * pitch),
      maxWidth: bubbleWidth - SPEECH_BAND.textPadding * 2,
    },
  };
}

export interface FitCellSizeInput {
  /** The cell size without a character. It is never exceeded. */
  nominal: number;
  /** Cells the grid has down the page. */
  rows: number;
  /** Height of everything else in the block: the band, the gaps and the lists. */
  fixedHeight: number;
  /** Height inside the page margins. */
  innerHeight: number;
}

/** The largest cell size, in steps of 0.1 mm, at which the block still fits inside the margins. */
export function fitCellSize(input: FitCellSizeInput): number {
  const { nominal, rows, fixedHeight, innerHeight } = input;
  const room = (innerHeight - fixedHeight) / rows;
  const fitted = Math.floor(room * 10 + 1e-9) / 10;
  return Math.max(0, Math.min(nominal, fitted));
}
