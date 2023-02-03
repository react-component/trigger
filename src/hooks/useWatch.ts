import useLayoutEffect from 'rc-util/lib/hooks/useLayoutEffect';

function collectScroller(ele: HTMLElement) {
  const scrollerList: HTMLElement[] = [];
  let current = ele?.parentElement;

  const scrollStyle = ['hidden', 'scroll', 'auto'];

  while (current) {
    const { overflowX, overflowY } =
      current.ownerDocument.defaultView.getComputedStyle(current);
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

      const mergedList = new Set([
        window,
        ...targetScrollList,
        ...popupScrollList,
      ]);

      function notifyScroll() {
        onAlign();
      }

      mergedList.forEach((scroller) => {
        scroller.addEventListener('scroll', notifyScroll, { passive: true });
      });

      // First time always do align
      onAlign();

      return () => {
        mergedList.forEach((scroller) => {
          scroller.removeEventListener('scroll', notifyScroll);
        });
      };
    }
  }, [open, target, popup]);
}
