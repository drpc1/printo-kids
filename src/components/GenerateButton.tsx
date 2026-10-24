import { Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Button's default size adds has-[>svg]:px-3; the has-[>svg] entries replace it so the icon keeps the full padding.
export const ACTION_BUTTON_CLASS =
  "h-auto rounded-full px-6 py-2.5 text-base has-[>svg]:px-6 sm:px-8 sm:py-3.5 sm:text-lg sm:has-[>svg]:px-8";

/** The Generuj button of a generator page: a large primary one before the first card, a quiet one beside Drukuj after it. */
export function GenerateButton({
  onClick,
  tone,
  disabled,
  className,
}: {
  onClick: () => void;
  tone: "hero" | "quiet";
  disabled: boolean;
  className?: string;
}) {
  return (
    <Button
      type="button"
      variant={tone === "hero" ? "default" : "outline"}
      onClick={onClick}
      disabled={disabled}
      className={cn(ACTION_BUTTON_CLASS, className)}
    >
      <Shuffle aria-hidden />
      Generuj
    </Button>
  );
}
