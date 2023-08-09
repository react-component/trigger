import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import { collectScroller, getWin } from '../util';

export default function useWatch(
  open: boolean,
  target: HTMLElement,
  popup: HTMLElement,
  onAlign: VoidFunction,
  onScroll: VoidFunction,
) {
  useLayoutEffect(() => {
    if (open && target && popup) {
      const targetElement = target;
      const popupElement = popup;
      const targetScrollList = collectScroller(targetElement);
      const popupScrollList = collectScroller(popupElement);

      const win = getWin(popupElement);

      const mergedList = new Set([
        win,
        ...targetScrollList,
        ...popupScrollList,
      ]);

      function notifyScroll() {
        onAlign();
        onScroll();
      }

      mergedList.forEach((scroller) => {
        scroller.addEventListener('scroll', notifyScroll, { passive: true });
      });

      win.addEventListener('resize', notifyScroll, { passive: true });

      // First time always do align
      onAlign();

      return () => {
        mergedList.forEach((scroller) => {
          scroller.removeEventListener('scroll', notifyScroll);
          win.removeEventListener('resize', notifyScroll);
        });
      };
    }
  }, [open, target, popup]);
}
