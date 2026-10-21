import { useCallback, useRef, type RefCallback, type RefObject } from "react";

/**
 * Drives a drawn scrollbar (track + thumb) for a scrollable element. Touch screens hide the
 * native scrollbar until the user scrolls, and iOS ignores scrollbar styling, so the dialog
 * draws its own. Position and size are written straight to the track and thumb styles, so
 * scrolling does not re-render React.
 */
export function useScrollIndicator(): {
  bodyRef: RefCallback<HTMLElement>;
  trackRef: RefObject<HTMLDivElement | null>;
  thumbRef: RefObject<HTMLDivElement | null>;
} {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const thumbRef = useRef<HTMLDivElement | null>(null);

  const bodyRef = useCallback((body: HTMLElement | null) => {
    if (body === null) {
      return;
    }
    const update = () => {
      const track = trackRef.current;
      const thumb = thumbRef.current;
      if (track === null || thumb === null) {
        return;
      }
      const { scrollTop, scrollHeight, clientHeight } = body;
      const scrollable = scrollHeight > clientHeight + 1;
      track.toggleAttribute("data-scrollable", scrollable);
      if (!scrollable) {
        return;
      }
      // The track sits in the dialog's right padding, level with the scrolling body.
      track.style.top = `${body.offsetTop}px`;
      track.style.left = `${body.offsetLeft + body.offsetWidth + 3}px`;
      track.style.height = `${clientHeight}px`;
      const thumbHeight = Math.max((clientHeight * clientHeight) / scrollHeight, 24);
      const progress = Math.min(Math.max(scrollTop / (scrollHeight - clientHeight), 0), 1);
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${progress * (clientHeight - thumbHeight)}px)`;
    };
    // React attaches this ref before the track and thumb refs, so this first call can return
    // early. The ResizeObserver below always reports once after observe(), which draws the bar.
    update();
    body.addEventListener("scroll", update, { passive: true });
    // The body is capped by max-height, so its own box stops changing once content overflows:
    // watch the children's sizes too, and re-attach when panels swap them.
    const resize = new ResizeObserver(update);
    const watch = () => {
      resize.disconnect();
      resize.observe(body);
      for (const child of Array.from(body.children)) {
        resize.observe(child);
      }
    };
    watch();
    const mutation = new MutationObserver(() => {
      watch();
      update();
    });
    mutation.observe(body, { childList: true, subtree: true });
    return () => {
      body.removeEventListener("scroll", update);
      resize.disconnect();
      mutation.disconnect();
    };
  }, []);

  return { bodyRef, trackRef, thumbRef };
}
