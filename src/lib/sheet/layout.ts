export interface SheetPage {
  width: number;
  height: number;
}

export interface SheetRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface SheetAnchor {
  x: number;
  y: number;
  text: string;
}

export interface SheetLayoutInput {
  pageWidth: number;
  pageHeight: number;
  inset: number;
  columns: number;
  rows: number;
  entranceColumn: number;
  exitColumn: number;
  markSize: number;
  characterSelected: boolean;
  levelShowsCharacter: boolean;
  /** Label text height in page units; the bottom edge of "Meta" is meta.y + labelHeight / 2. */
  labelHeight: number;
}

export interface SheetLayout {
  page: SheetPage;
  maze: SheetRect;
  meta: SheetAnchor;
  start: SheetAnchor | null;
  mark: SheetRect | null;
}

export function layoutSheet(input: SheetLayoutInput): SheetLayout {
  const {
    pageWidth,
    pageHeight,
    inset,
    columns,
    rows,
    entranceColumn,
    exitColumn,
    markSize,
    characterSelected,
    levelShowsCharacter,
    labelHeight,
  } = input;
  const cellSize = (pageWidth - inset * 2) / columns;
  const innerHeight = pageHeight - inset * 2;
  const gridHeight = rows * cellSize;
  const labelBand = (innerHeight - gridHeight) / 2;
  const centeredOriginY = inset + labelBand;
  const centeredMetaY = centeredOriginY + gridHeight + labelBand / 2;
  // On a level that shows a character the whole block moves down by the same shift, so the white
  // band above the character mark equals the white band below "Meta". The shift ignores whether a
  // character is picked, so the grid stays put when the parent switches to "Start".
  const shift = levelShowsCharacter
    ? (pageHeight - centeredMetaY - labelHeight / 2 - centeredOriginY + markSize) / 2
    : 0;
  const originX = inset;
  const originY = centeredOriginY + shift;
  const labelX = originX + (entranceColumn + 0.5) * cellSize;
  const metaX = originX + (exitColumn + 0.5) * cellSize;
  const startY = inset + labelBand / 2 + shift;
  const metaY = centeredMetaY + shift;
  const page = { width: pageWidth, height: pageHeight };
  const maze = { x: originX, y: originY, width: pageWidth - inset * 2, height: gridHeight };
  const meta = { x: metaX, y: metaY, text: "Meta" };

  if (characterSelected) {
    return {
      page,
      maze,
      meta,
      start: null,
      mark: {
        x: labelX - markSize / 2,
        y: originY - markSize,
        width: markSize,
        height: markSize,
      },
    };
  }

  return {
    page,
    maze,
    meta,
    start: { x: labelX, y: startY, text: "Start" },
    mark: null,
  };
}
