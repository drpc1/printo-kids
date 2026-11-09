/**
 * How the "Który nie pasuje" card is drawn, in page units (mm on an A4 sheet). The page component, the catalog
 * thumbnail script and the layout test all read these, so none of them can drift from the printed card.
 * A row is a frame with pictures side by side; a picture is a shape (alone or as a group like the dots of a die) or
 * an icon, drawn as an outline on paper or, with colors on, filled with a crayon.
 */
export const ODD_ONE_OUT_SHEET = {
  pageWidth: 210,
  pageHeight: 297,
  inset: 10,
  /** Height of the band for the character and the speech bubble; equals the character size of the shared band. */
  bandHeight: 26,
  /** Space between the band and the first row. */
  bandGap: 6,
  /** Space between two row frames. */
  rowGap: 4,
  rowFrameStroke: 0.3,
  rowFrameRadius: 3,
  /** Room left between a picture and its slot edge, so neighbours and the frame never touch. */
  slotPadding: 4,
  /** Side of a lone shape relative to its slot. */
  singleRatio: 0.78,
  /** Side of one shape of a group relative to the slot. */
  groupUnitRatio: 0.23,
  /** Distance between group shapes relative to the shape side; above 1, so the boxes of two shapes never meet. */
  groupStepRatio: 1.15,
  /** Side of an icon relative to its slot. */
  iconRatio: 0.82,
  /** Outline of a shape as a share of its side, never thinner than the minimum. */
  shapeStrokeRatio: 0.06,
  shapeStrokeMin: 0.6,
  /** Outline of a crayon-filled shape. */
  filledStroke: 0.4,
  /** Font size of the instruction when no character stands in the band (one line). */
  plainInstructionSize: 7,
  /** The instruction, one entry per line of the speech bubble. */
  instructionLines: ["Który nie pasuje?", "Zakreśl go."],
} as const;
