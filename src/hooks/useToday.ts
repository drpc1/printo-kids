import { useState } from "react";

/** The date of the visit: read once when the page mounts, so the lists of the bar do not change while it is open. */
export function useToday(): Date {
  const [today] = useState(() => new Date());
  return today;
}
