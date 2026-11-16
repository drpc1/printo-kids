import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * A labeled switch in a card page's settings row (Kolory, Pokaż rozwiązanie). It is inset like the chevron buttons at
 * every width, so its switch starts where the text of "Postać" does on whichever line it lands; a phone also gives it
 * a line of its own. `disabled` keeps a switch that lays out a new card ("24 h" on the clock) still while the profile
 * corner waits for the parent to choose a child, like the level button.
 */
export function SettingToggle({
  label,
  checked,
  onCheckedChange,
  disabled = false,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <label className={cn("text-muted-foreground flex items-center gap-2 px-3 text-base max-sm:basis-full")}>
      <Switch checked={checked} onCheckedChange={onCheckedChange} disabled={disabled} />
      {label}
    </label>
  );
}
