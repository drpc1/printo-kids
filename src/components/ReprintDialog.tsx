import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

/**
 * Asked when Drukuj is pressed on a card that was already printed (PRD US-22): the child would get the same task twice.
 * One dialog for every card page; it only reports the choice, the page decides what each choice does.
 */
export function ReprintDialog({
  open,
  onOpenChange,
  onNewCard,
  onSameCard,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onNewCard: () => void;
  onSameCard: () => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn("print:hidden")}>
        <DialogHeader>
          <DialogTitle>Ta karta była już drukowana</DialogTitle>
          <DialogDescription>Dziecko dostanie to samo zadanie drugi raz. Ułożyć nową kartę?</DialogDescription>
        </DialogHeader>
        <DialogFooter className={cn("translate-y-3 print:hidden")}>
          <Button type="button" variant="outline" onClick={onSameCard} className={cn("print:hidden")}>
            Drukuj tę samą
          </Button>
          <Button type="button" onClick={onNewCard} className={cn("print:hidden")}>
            Nowa karta
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
