/**
 * How the sequence card is drawn, in page units (mm on an A4 sheet). The page component and the catalog thumbnail
 * script both read these, so the thumbnail cannot drift from the printed card.
 */
export const SEQUENCE_SHEET = {
  pageWidth: 210,
  pageHeight: 297,
  inset: 10,
  instructionSize: 7,
  instructionGap: 8,
  instructionText: "Co pasuje w puste pole? Uzupełnij.",
  /** Space between fields in a row and between rows, as a fraction of the field side. */
  fieldGapRatio: 0.2,
  fieldStroke: 0.3,
  emptyFieldStroke: 0.5,
  emptyFieldDash: "2.5 1.8",
  shapeStroke: 0.9,
  /** Side of the square a shape is inscribed in, as a fraction of the field side. */
  shapeScale: 0.6,
  /** Font size of the "?" in the top right corner of an empty field. */
  questionSize: 5,
  /** Distance of the "?" from the top and right edge of the field. */
  questionInset: 1.5,
} as const;
