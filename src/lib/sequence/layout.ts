export interface SequenceSheetInput {
  pageWidth: number;
  pageHeight: number;
  inset: number;
  fieldsPerRow: number;
  rowCount: number;
  /** Space between fields, as a fraction of the field side. Also the smallest space between rows. */
  fieldGapRatio: number;
  /** Font size of the instruction sentence. Its box spans instruction.y ± instructionHeight / 2. */
  instructionHeight: number;
  /** Space between the instruction box and the first row. */
  instructionGap: number;
}

export interface SequenceSheetLayout {
  page: { width: number; height: number };
  instruction: { x: number; y: number };
  /** Side of one field. */
  fieldSize: number;
  /** Top left corner of every field, row by row. `y` of a row equals `y` of each of its fields. */
  rows: { y: number; fields: { x: number; y: number }[] }[];
}

/**
 * Places the instruction and the rows of fields on the page. The fields fill the width inside the inset, and the
 * rows are spread evenly down the page under the instruction. Throws when the rows do not fit inside the inset,
 * instead of returning a layout that crosses the margin.
 */
export function layoutSequenceSheet(input: SequenceSheetInput): SequenceSheetLayout {
  const { pageWidth, pageHeight, inset, fieldsPerRow, rowCount, fieldGapRatio, instructionHeight, instructionGap } =
    input;
  const innerWidth = pageWidth - inset * 2;
  const innerHeight = pageHeight - inset * 2;
  const fieldSize = innerWidth / (fieldsPerRow + (fieldsPerRow - 1) * fieldGapRatio);
  const fieldGap = fieldSize * fieldGapRatio;
  const rowsTop = inset + instructionHeight + instructionGap;
  const rowsHeight = innerHeight - instructionHeight - instructionGap;
  const rowsNeeded = rowCount * fieldSize + (rowCount - 1) * fieldGap;

  if (rowCount < 1 || fieldsPerRow < 1 || rowsNeeded > rowsHeight) {
    throw new Error(`${rowCount} rows of ${fieldsPerRow} fields do not fit inside the ${inset} page margin`);
  }

  const rowGap = rowCount === 1 ? 0 : (rowsHeight - rowCount * fieldSize) / (rowCount - 1);
  const rows = Array.from({ length: rowCount }, (_, rowIndex) => {
    const y = rowsTop + rowIndex * (fieldSize + rowGap);
    return {
      y,
      fields: Array.from({ length: fieldsPerRow }, (_, fieldIndex) => ({
        x: inset + fieldIndex * (fieldSize + fieldGap),
        y,
      })),
    };
  });

  return {
    page: { width: pageWidth, height: pageHeight },
    instruction: { x: pageWidth / 2, y: inset + instructionHeight / 2 },
    fieldSize,
    rows,
  };
}
