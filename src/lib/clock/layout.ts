import { estimatedTextWidth } from "../sheet/speech.ts";
import { hourAngle, minuteAngle, partOfDay, type ClockCard, type ClockTime } from "./card.ts";
import { CLOCK_SHEET } from "./sheet.ts";

/** Slack for floating point error at the edge of the margin. */
const EPSILON = 1e-6;

export interface ClockRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ClockPoint {
  x: number;
  y: number;
}

/** One dial on the page with what stands under or beside it. Text points are centres; the sheet adds `baselineShift`. */
export interface ClockDialPlace {
  /** Index of the dial's time in `card.times`. */
  time: number;
  cx: number;
  cy: number;
  /** Centre of the part-of-day word under the dial; null without "24 h". */
  partOfDay: (ClockPoint & { text: string }) | null;
  /** Odczytaj: the box for the hours, the box for the minutes and the colon between them; null in the other modes. */
  answer: { hours: ClockRect; minutes: ClockRect; colon: ClockPoint } | null;
  /** Dorysuj: the digital clock under the dial; null in the other modes. */
  digital: ClockRect | null;
  /** Połącz: the dot right of the dial; null in the other modes. */
  dot: ClockPoint | null;
}

/** Połącz: a digital clock on the right with its dot, top to bottom. */
export interface ClockDigitalPlace {
  /** Index of the time it shows in `card.times`: `card.order[row]`. */
  time: number;
  frame: ClockRect;
  dot: ClockPoint;
}

export interface ClockSheetLayout {
  page: { width: number; height: number };
  /** The instruction: the speech band with a character, the plain line without one. */
  band: { y: number; height: number };
  /** Radius of every dial, mm: the largest that fits, no larger than the mockup's. */
  radius: number;
  dials: ClockDialPlace[];
  /** Połącz only; empty in the other modes. */
  digitals: ClockDigitalPlace[];
}

interface Box {
  what: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** A point `distance` from the centre at `degrees` clockwise from 12. */
export function polar(cx: number, cy: number, distance: number, degrees: number): ClockPoint {
  const radians = (degrees * Math.PI) / 180;
  return { x: cx + distance * Math.sin(radians), y: cy - distance * Math.cos(radians) };
}

/** A line width that grows with the dial but never below `min` mm. */
function strokeFor(stroke: { min: number; share: number }, radius: number): number {
  return Math.max(stroke.min, stroke.share * radius);
}

export interface ClockLine {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  stroke: number;
}

/** Everything drawn on one dial, in mm. Numbers come after the hands in the drawing order, over them, with a halo. */
export interface ClockDialDrawing {
  rimStroke: number;
  /** Hour ticks, and from level 4 minute ticks. */
  ticks: ClockLine[];
  /** 12, 1, ..., 11: the centre of each number, its font size and halo width. */
  numbers: (ClockPoint & { text: string; size: number; halo: number })[];
  /** Null on a Dorysuj dial, where the child draws them. */
  hands: { hour: ClockLine; minute: ClockLine } | null;
  centreDot: number;
}

/** The ticks, numbers, hands and centre of a dial at (cx, cy) with radius `r`; no hands when `time` is null. */
export function drawDial(
  cx: number,
  cy: number,
  r: number,
  minuteTicks: boolean,
  time: ClockTime | null,
): ClockDialDrawing {
  const sheet = CLOCK_SHEET;
  const ticks: ClockLine[] = [];
  const line = (from: number, to: number, degrees: number, stroke: number): ClockLine => {
    const start = polar(cx, cy, from, degrees);
    const end = polar(cx, cy, to, degrees);
    return { x1: start.x, y1: start.y, x2: end.x, y2: end.y, stroke };
  };
  if (minuteTicks) {
    for (let minute = 0; minute < 60; minute += 1) {
      if (minute % 5 === 0) continue;
      ticks.push(line(r * sheet.minuteTickFrom, r * sheet.tickTo, minute * 6, sheet.minuteTickStroke));
    }
  }
  const numbers: ClockDialDrawing["numbers"] = [];
  const size = r * sheet.numberSize;
  for (let hour = 0; hour < 12; hour += 1) {
    const major = hour % 3 === 0;
    ticks.push(
      line(
        r * (major ? sheet.hourTickMajorFrom : sheet.hourTickFrom),
        r * sheet.tickTo,
        hour * 30,
        major ? sheet.hourTickMajorStroke : sheet.hourTickStroke,
      ),
    );
    const at = polar(cx, cy, r * sheet.numberRadius, hour * 30);
    numbers.push({ ...at, text: String(hour === 0 ? 12 : hour), size, halo: size * sheet.numberHalo });
  }
  const hands =
    time === null
      ? null
      : {
          hour: line(0, r * sheet.hourHand, hourAngle(time), strokeFor(sheet.hourHandStroke, r)),
          minute: line(0, r * sheet.minuteHand, minuteAngle(time), strokeFor(sheet.minuteHandStroke, r)),
        };
  return { rimStroke: sheet.rimStroke, ticks, numbers, hands, centreDot: strokeFor(sheet.centreDot, r) };
}

function textBox(what: string, centre: ClockPoint, text: string, size: number): Box {
  const width = estimatedTextWidth(text, size);
  return {
    what,
    x0: centre.x - width / 2,
    y0: centre.y - size * 0.4,
    x1: centre.x + width / 2,
    y1: centre.y + size * 0.4,
  };
}

function rectBox(what: string, rect: ClockRect, stroke: number): Box {
  return {
    what,
    x0: rect.x - stroke / 2,
    y0: rect.y - stroke / 2,
    x1: rect.x + rect.width + stroke / 2,
    y1: rect.y + rect.height + stroke / 2,
  };
}

function answerBoxes(cx: number, top: number): NonNullable<ClockDialPlace["answer"]> {
  const box = CLOCK_SHEET.answerBox;
  return {
    hours: { x: cx - box.colonGap / 2 - box.width, y: top, width: box.width, height: box.height },
    minutes: { x: cx + box.colonGap / 2, y: top, width: box.width, height: box.height },
    colon: { x: cx, y: top + box.height / 2 - box.colonLift },
  };
}

function digitalFrame(cx: number, top: number): ClockRect {
  const digital = CLOCK_SHEET.digital;
  return { x: cx - digital.width / 2, y: top, width: digital.width, height: digital.height };
}

/** Odczytaj and Dorysuj: two columns by three rows; under a dial the part of the day (24 h) and the boxes or the clock. */
function gridDials(card: ClockCard, areaTop: number, areaHeight: number): { radius: number; dials: ClockDialPlace[] } {
  const sheet = CLOCK_SHEET;
  const areaWidth = sheet.pageWidth - 2 * sheet.inset;
  const cellWidth = areaWidth / sheet.gridColumns;
  const cellHeight = areaHeight / sheet.gridRows;
  const under = card.mode === "odczytaj" ? sheet.answerBox.height : sheet.digital.height;
  const word = card.h24 ? sheet.partOfDaySize + sheet.gridPartOfDayGap : 0;
  const below = sheet.gapUnderDial + word + under + sheet.gridBottomRoom;
  const diameter = Math.min(sheet.gridMaxDial, cellWidth - sheet.gridSideRoom, cellHeight - below);
  const radius = diameter / 2;
  const dials = card.times.map((time, i): ClockDialPlace => {
    const cx = sheet.inset + cellWidth * (i % sheet.gridColumns) + cellWidth / 2;
    const cy = areaTop + cellHeight * Math.floor(i / sheet.gridColumns) + sheet.gridDialTop + radius;
    let y = cy + radius + sheet.gapUnderDial;
    let label: ClockDialPlace["partOfDay"] = null;
    if (card.h24) {
      label = { x: cx, y: y + sheet.partOfDaySize / 2, text: partOfDay(time.h) };
      y += sheet.partOfDaySize + sheet.gridPartOfDayGap;
    }
    return {
      time: i,
      cx,
      cy,
      partOfDay: label,
      answer: card.mode === "odczytaj" ? answerBoxes(cx, y) : null,
      digital: card.mode === "dorysuj" ? digitalFrame(cx, y) : null,
      dot: null,
    };
  });
  return { radius, dials };
}

/** Połącz: a row per time, the dial on the left, a digital clock in `order` on the right, a dot beside each. */
function matchDials(
  card: ClockCard,
  areaTop: number,
  areaHeight: number,
): { radius: number; dials: ClockDialPlace[]; digitals: ClockDigitalPlace[] } {
  const sheet = CLOCK_SHEET;
  const rowHeight = areaHeight / card.times.length;
  const word = card.h24 ? sheet.matchPartOfDayGap + sheet.partOfDaySize : 0;
  const diameter = Math.min(sheet.matchMaxDial, rowHeight - sheet.matchRowRoom - word);
  const radius = diameter / 2;
  const dialX = sheet.inset + sheet.matchDialLeft + radius;
  const leftDot = dialX + radius + sheet.matchDotGap;
  const digitalX = sheet.pageWidth - sheet.inset - sheet.matchDigitalRight - sheet.digital.width / 2;
  const rightDot = digitalX - sheet.digital.width / 2 - sheet.matchDotGap;
  const dials = card.times.map((time, i): ClockDialPlace => {
    const top = areaTop + rowHeight * i;
    const cy = top + (rowHeight - diameter - word) / 2 + radius;
    return {
      time: i,
      cx: dialX,
      cy,
      partOfDay: card.h24
        ? {
            x: dialX,
            y: cy + radius + sheet.matchPartOfDayGap + sheet.partOfDaySize / 2,
            text: partOfDay(time.h),
          }
        : null,
      answer: null,
      digital: null,
      dot: { x: leftDot, y: cy },
    };
  });
  const digitals = card.order.map((time, row): ClockDigitalPlace => {
    const middle = areaTop + rowHeight * row + rowHeight / 2;
    return {
      time,
      frame: digitalFrame(digitalX, middle - sheet.digital.height / 2),
      dot: { x: rightDot, y: middle },
    };
  });
  return { radius, dials, digitals };
}

/**
 * Places the instruction and the dials. `instructionBoxHeight` is the band with a character, the plain line height without
 * one. A dial is the largest that fits its cell or row, never above the mockup's size. Throws when anything of the task
 * would cross the 10 mm margin or stand above the area under the instruction.
 */
export function layoutClockSheet(card: ClockCard, instructionBoxHeight: number): ClockSheetLayout {
  const sheet = CLOCK_SHEET;
  const areaTop = sheet.inset + instructionBoxHeight + sheet.bandGap;
  const areaHeight = sheet.pageHeight - sheet.inset - areaTop;
  if (areaHeight <= 0) {
    throw new Error(`No room under the instruction (${instructionBoxHeight} mm) inside the margin`);
  }
  const placed =
    card.mode === "polacz"
      ? matchDials(card, areaTop, areaHeight)
      : { ...gridDials(card, areaTop, areaHeight), digitals: [] };
  const { radius, dials, digitals } = placed;
  if (radius <= 0) {
    throw new Error(`No room for a dial under the instruction (${instructionBoxHeight} mm)`);
  }

  const boxes: Box[] = [];
  const reach = radius + sheet.rimStroke / 2;
  for (const dial of dials) {
    boxes.push({ what: "dial", x0: dial.cx - reach, y0: dial.cy - reach, x1: dial.cx + reach, y1: dial.cy + reach });
    if (dial.partOfDay)
      boxes.push(textBox("part of the day", dial.partOfDay, dial.partOfDay.text, sheet.partOfDaySize));
    if (dial.answer) {
      boxes.push(rectBox("hours box", dial.answer.hours, sheet.answerBox.stroke));
      boxes.push(rectBox("minutes box", dial.answer.minutes, sheet.answerBox.stroke));
    }
    if (dial.digital) boxes.push(rectBox("digital clock", dial.digital, sheet.digital.stroke));
    if (dial.dot) {
      const { x, y } = dial.dot;
      const r = sheet.dotRadius;
      boxes.push({ what: "dot", x0: x - r, y0: y - r, x1: x + r, y1: y + r });
    }
  }
  for (const digital of digitals) {
    boxes.push(rectBox("digital clock", digital.frame, sheet.digital.stroke));
    const { x, y } = digital.dot;
    const r = sheet.dotRadius;
    boxes.push({ what: "dot", x0: x - r, y0: y - r, x1: x + r, y1: y + r });
  }
  for (const box of boxes) {
    if (
      box.x0 < sheet.inset - EPSILON ||
      box.x1 > sheet.pageWidth - sheet.inset + EPSILON ||
      box.y0 < areaTop - EPSILON ||
      box.y1 > sheet.pageHeight - sheet.inset + EPSILON
    ) {
      throw new Error(
        `A ${box.what} crosses the ${sheet.inset} mm page margin or the instruction: (${box.x0.toFixed(2)}, ${box.y0.toFixed(2)}) - (${box.x1.toFixed(2)}, ${box.y1.toFixed(2)})`,
      );
    }
  }
  return {
    page: { width: sheet.pageWidth, height: sheet.pageHeight },
    band: { y: sheet.inset, height: instructionBoxHeight },
    radius,
    dials,
    digitals,
  };
}
