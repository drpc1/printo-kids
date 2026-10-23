/**
 * How the symmetry card is drawn, in page units (mm on an A4 sheet). The page component and the catalog thumbnail
 * script both read these, so the thumbnail cannot drift from the printed card.
 */
export const SYMMETRY_SHEET = {
  pageWidth: 210,
  pageHeight: 297,
  inset: 10,
  instructionSize: 7,
  instructionGap: 6,
  instructionText: "Dorysuj drugą połowę tak, jak w lustrze.",
  gridStroke: 0.3,
  frameStroke: 0.65,
  axisStroke: 1.4,
  axisDash: "4 2.5",
} as const;
