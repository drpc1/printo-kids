import { cn } from "@/lib/utils";

/** Button classes that stack a row's lines in a left-aligned column and let them wrap; only for rows with a description. */
export function levelRowClass(description: string | undefined): string {
  return cn(description !== undefined && "h-auto flex-col items-start gap-0.5 text-left whitespace-normal");
}

/** Content of a level list row: the name, then the description and the typical age in a smaller muted style. */
export function LevelRow({
  label,
  description,
  typicalAge,
}: {
  label: string;
  description?: string;
  typicalAge?: string;
}) {
  // The typical age only stands under a description; rows without one (Kategoria, Rozmiar) show the name alone.
  if (description === undefined) {
    return <>{label}</>;
  }
  return (
    <>
      <span>{label}</span>
      <span className={cn("text-muted-foreground text-sm")}>{description}</span>
      {typicalAge !== undefined ? <span className={cn("text-muted-foreground text-sm")}>{typicalAge}</span> : null}
    </>
  );
}
