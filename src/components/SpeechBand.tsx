import { characterContentLeft, characterContentRight } from "@/lib/sheet/character";
import { instructionLines, layoutSpeechBand, SPEECH_BAND, type SpeechBandLayout } from "@/lib/sheet/speech";

/**
 * The top of a card where the character stands and says the instruction. It is SVG for the card's own page: the
 * character is a colored image, the bubble is an outline with a tail pointing at the character, and the text sits
 * in it line by line. The colors are the screen tokens, so the sheet stays black and white apart from the character.
 */
export function SpeechBand({
  layout,
  characterSrc,
  lines,
}: {
  layout: SpeechBandLayout;
  characterSrc: string;
  lines: readonly string[];
}) {
  const { character, bubble, tail, text } = layout;
  const tailPath = `M ${tail.baseX} ${tail.baseTopY} L ${tail.tipX} ${tail.tipY} L ${tail.baseX} ${tail.baseBottomY}`;

  return (
    <g>
      <image
        href={characterSrc}
        x={character.x}
        y={character.y}
        width={character.width}
        height={character.height}
        preserveAspectRatio="xMidYMid meet"
      />
      <rect
        x={bubble.x}
        y={bubble.y}
        width={bubble.width}
        height={bubble.height}
        rx={bubble.radius}
        fill="var(--card)"
        stroke="var(--foreground)"
        strokeWidth={SPEECH_BAND.bubbleStroke}
      />
      <path d={tailPath} fill="var(--card)" stroke="var(--foreground)" strokeWidth={SPEECH_BAND.bubbleStroke} />
      <line
        x1={tail.baseX + SPEECH_BAND.bubbleStroke}
        y1={tail.baseTopY + SPEECH_BAND.bubbleStroke}
        x2={tail.baseX + SPEECH_BAND.bubbleStroke}
        y2={tail.baseBottomY - SPEECH_BAND.bubbleStroke}
        stroke="var(--card)"
        strokeWidth={SPEECH_BAND.bubbleStroke * 2.5}
      />
      {lines.map((line, index) => (
        <text
          key={line}
          x={text.x}
          y={text.ys[index]}
          fill="var(--foreground)"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fontSize={text.size}
          textAnchor="middle"
          dominantBaseline="middle"
        >
          {line}
        </text>
      ))}
    </g>
  );
}

/**
 * The instruction of a card with a character: the band laid out for the character's file and the instruction's
 * sentences. The card's own layout has already made room for it (`instructionBoxHeight`) and says where its top is.
 */
export function CharacterInstruction({
  pageWidth,
  inset,
  top,
  characterId,
  characterSrc,
  text,
}: {
  pageWidth: number;
  inset: number;
  top: number;
  characterId: string;
  characterSrc: string;
  text: string;
}) {
  const lines = instructionLines(text);
  const layout = layoutSpeechBand({
    pageWidth,
    inset,
    top,
    lines,
    contentLeft: characterContentLeft(characterId),
    contentRight: characterContentRight(characterId),
  });
  return <SpeechBand layout={layout} characterSrc={characterSrc} lines={lines} />;
}
