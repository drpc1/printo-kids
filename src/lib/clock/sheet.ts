/**
 * How the "Zegar" card is drawn, in page units (mm on an A4 sheet) or shares of the dial radius. The page component, the
 * catalog thumbnail script, the preview script and the tests all read these and nothing else, so none of them can drift
 * from the printed card. The values come from the accepted mockup (context/changes/clock-card/mockup.mts); the trial
 * print decides (S-41, phase 4). Keep every number here.
 */
export const CLOCK_SHEET = {
  /** A4 portrait. */
  pageWidth: 210,
  pageHeight: 297,
  /** Page margin: nothing of the task leaves the area inside it. */
  inset: 10,
  /** Height of the band for the character and the speech bubble; equals the character size of the shared band. */
  bandHeight: 26,
  /** Space between the band (or the plain instruction) and the dials. */
  bandGap: 6,
  /** Font size of the instruction when no character stands in the band. */
  plainInstructionSize: 7,

  /** Line width of the dial's circle. */
  rimStroke: 0.9,
  /** Distance of a number's centre from the dial centre, as a share of the radius. */
  numberRadius: 0.72,
  /** Font size of a number 1-12, as a share of the radius. */
  numberSize: 0.2,
  /** Width of the white halo round a number, as a share of its font size: the long hand passes under the numbers. */
  numberHalo: 0.28,
  /** Where an hour tick starts, as a share of the radius; it runs out to `tickTo`. */
  hourTickFrom: 0.88,
  /** Where the tick at 12, 3, 6 and 9 starts: these are longer. */
  hourTickMajorFrom: 0.83,
  /** Where every tick ends, as a share of the radius: just inside the circle. */
  tickTo: 0.985,
  /** Line width of an hour tick, mm. */
  hourTickStroke: 0.55,
  /** Line width of the tick at 12, 3, 6 and 9, mm. */
  hourTickMajorStroke: 1.1,
  /** Where a minute tick starts (from level 4), as a share of the radius. */
  minuteTickFrom: 0.94,
  /** Line width of a minute tick, mm. */
  minuteTickStroke: 0.25,
  /** Length of the minute hand, as a share of the radius: long. */
  minuteHand: 0.9,
  /** Line width of the minute hand: at least `min` mm, else `share` of the radius; thin. */
  minuteHandStroke: { min: 0.8, share: 0.035 },
  /** Length of the hour hand, as a share of the radius: short. */
  hourHand: 0.5,
  /** Line width of the hour hand: at least `min` mm, else `share` of the radius; thick. */
  hourHandStroke: { min: 1.8, share: 0.085 },
  /** Radius of the dot in the dial centre: at least `min` mm, else `share` of the radius. */
  centreDot: { min: 1.2, share: 0.06 },
  /**
   * How far below a text's centre its baseline lies, in font sizes. Digits are about 0.72 em tall, so this puts them in
   * the middle. `dominant-baseline` is not used: phone browsers (Safari, Chrome, Brave) place the text differently.
   */
  baselineShift: 0.36,

  /** Odczytaj: two boxes "__ : __" under the dial for the hours and the minutes, mm. */
  answerBox: {
    width: 18,
    height: 13,
    /** Space between the boxes, where the colon stands. */
    colonGap: 7,
    stroke: 0.5,
    /** Font size of the colon. */
    colonSize: 9,
    /** The colon sits this much above the boxes' middle, so its dots look centred. */
    colonLift: 0.6,
  },
  /** A digital clock: a rounded frame with the time in digits ("7:30"), mm. */
  digital: { width: 42, height: 15, radius: 3, stroke: 1, textSize: 10 },
  /** Font size of the part of the day under a dial with "24 h", mm. */
  partOfDaySize: 5,

  /** Odczytaj and Dorysuj: the dials stand in a grid of this many columns and rows. */
  gridColumns: 2,
  gridRows: 3,
  /** The greatest dial diameter in the grid, mm: the mockup's size. */
  gridMaxDial: 62,
  /** A grid dial is this much narrower than its cell, so neighbours keep apart, mm. */
  gridSideRoom: 14,
  /** Space between a grid cell's top and its dial, mm. */
  gridDialTop: 1,
  /** Space between a dial and what stands under it, mm. */
  gapUnderDial: 3,
  /** Space between the part of the day and the boxes or the digital clock under it, mm. */
  gridPartOfDayGap: 3,
  /** Room a grid cell keeps besides its dial and what stands under it, the top gap included, mm. */
  gridBottomRoom: 4,

  /** Połącz: the greatest dial diameter, mm. */
  matchMaxDial: 46,
  /** A Połącz dial is this much lower than its row, mm. */
  matchRowRoom: 4,
  /** Space between a Połącz dial and the part of the day under it, mm. */
  matchPartOfDayGap: 2,
  /** Space between the margin and a Połącz dial, mm. */
  matchDialLeft: 4,
  /** Space between the margin and a Połącz digital clock, mm. */
  matchDigitalRight: 2,
  /** Space between a Połącz dial or digital clock and its dot, mm. */
  matchDotGap: 7,
  /** Radius of a dot the child joins with a line, mm. */
  dotRadius: 1.6,
} as const;
