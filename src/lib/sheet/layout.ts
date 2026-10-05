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
  markSize: number;
  characterSelected: boolean;
}

export interface SheetLayout {
  page: SheetPage;
  maze: SheetRect;
  meta: SheetAnchor;
  start: SheetAnchor | null;
  mark: SheetRect | null;
}

export function layoutSheet(input: SheetLayoutInput): SheetLayout {
  const { pageWidth, pageHeight, inset, columns, rows, entranceColumn, markSize, characterSelected } = input;
  const cellSize = (pageWidth - inset * 2) / columns;
  const innerHeight = pageHeight - inset * 2;
  const gridHeight = rows * cellSize;
  const labelBand = (innerHeight - gridHeight) / 2;
  const originX = inset;
  const originY = inset + labelBand;
  const labelX = originX + (entranceColumn + 0.5) * cellSize;
  const startY = inset + labelBand / 2;
  const metaY = originY + gridHeight + labelBand / 2;
  const page = { width: pageWidth, height: pageHeight };
  const maze = { x: originX, y: originY, width: pageWidth - inset * 2, height: gridHeight };
  const meta = { x: labelX, y: metaY, text: "Meta" };

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
