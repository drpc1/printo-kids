/** A uniform integer in [0, count) from a random source in [0, 1). */
export function pick(random: () => number, count: number): number {
  return Math.min(count - 1, Math.floor(random() * count));
}

/** Fisher-Yates, in place. Returns the same array. */
export function shuffle<T>(random: () => number, items: T[]): T[] {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const other = pick(random, index + 1);
    [items[index], items[other]] = [items[other], items[index]];
  }
  return items;
}
