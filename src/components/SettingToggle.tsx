import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * A labeled switch in a card page's settings row (Kolory, Pokaż rozwiązanie). It is inset like the chevron buttons at
 * every width, so its switch starts where the text of "Postać" does on whichever line it lands; a phone also gives it
 * a line of its own.
 */
export function SettingToggle({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <label className={cn("text-muted-foreground flex items-center gap-2 px-3 text-base max-sm:basis-full")}>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      {label}
    </label>
  );
}
