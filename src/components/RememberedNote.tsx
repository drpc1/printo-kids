import { cn } from "@/lib/utils";

/**
 * "Zapamiętane dla {imię}" under the bar. The line keeps its height while a profile is active, so the note appearing
 * and going away never moves Generuj, Drukuj or the card. Without a profile there is nothing to remember it for.
 */
export function RememberedNote({ note, profileActive }: { note: string | null; profileActive: boolean }) {
  if (!profileActive) {
    return null;
  }

  return (
    <p role="status" className={cn("text-muted-foreground h-5 text-sm print:hidden")}>
      {note}
    </p>
  );
}
