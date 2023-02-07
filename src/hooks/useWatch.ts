import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';
import { getWin } from '../util';

function collectScroller(ele: HTMLElement) {
  const scrollerList: HTMLElement[] = [];
  let current = ele?.parentElement;

  const scrollStyle = ['hidden', 'scroll', 'auto'];

  while (current) {
    const { overflowX, overflowY } = getWin(current).getComputedStyle(current);
    if (scrollStyle.includes(overflowX) || scrollStyle.includes(overflowY)) {
      scrollerList.push(current);
    }

    current = current.parentElement;
  }

  return scrollerList;
}

export default function useWatch(
  open: boolean,
  target: HTMLElement,
  popup: HTMLElement,
  onAlign: VoidFunction,
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
