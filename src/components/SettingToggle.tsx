import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

/**
 * A labeled switch in a card page's settings row (Kolory, Pokaż rozwiązanie). On a phone it takes a line of its own and
 * is inset like the chevron buttons, so its switch starts where the text of "Postać" does.
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
    <label className={cn("text-muted-foreground flex items-center gap-2 text-base max-sm:basis-full max-sm:px-3")}>
      <Switch checked={checked} onCheckedChange={onCheckedChange} />
      {label}
    </label>
  );
}
