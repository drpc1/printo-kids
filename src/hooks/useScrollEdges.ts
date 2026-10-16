import { useCallback, type RefCallback } from "react";

/**
 * Marks a scrollable element with data-more-above / data-more-below while there is more
 * content in that direction, so CSS (the scroll-shadow utility) can draw an edge shadow.
 * Phones hide scrollbars, and iOS ignores background-attachment: local, so the hint
 * has to come from the scroll position itself.
 */
export function useScrollEdges(): RefCallback<HTMLElement> {
  return useCallback((element: HTMLElement | null) => {
    if (element === null) {
      return;
    }
    const update = () => {
      const above = element.scrollTop > 1;
      const below = element.scrollTop + element.clientHeight < element.scrollHeight - 1;
      element.toggleAttribute("data-more-above", above);
      element.toggleAttribute("data-more-below", below);
    };
    update();
    element.addEventListener("scroll", update, { passive: true });
    // The dialog swaps panels and its height follows the window, so re-check on both.
    const resize = new ResizeObserver(update);
    resize.observe(element);
    const mutation = new MutationObserver(update);
    mutation.observe(element, { childList: true, subtree: true });
    return () => {
      element.removeEventListener("scroll", update);
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);
}
