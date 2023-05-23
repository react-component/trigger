import { warning } from 'rc-util';
import raf from 'rc-util/lib/raf';
import * as React from 'react';
import { getWin } from '../util';

export default function useWinClick(
  open: boolean,
  clickToHide: boolean,
  targetEle: HTMLElement,
  popupEle: HTMLElement,
  mask: boolean,
  maskClosable: boolean,
  inPopupOrChild: (target: EventTarget) => boolean,
  triggerOpen: (open: boolean) => void,
) {
  const openRef = React.useRef(open);

  // Window click to hide should be lock to avoid trigger lock immediately
  const lockRef = React.useRef(false);
  if (openRef.current !== open) {
    lockRef.current = true;
    openRef.current = open;
  }

  React.useEffect(() => {
    const id = raf(() => {
      lockRef.current = false;
    });

    return () => {
      raf.cancel(id);
    };
  }, [open]);

  // Click to hide is special action since click popup element should not hide
  React.useEffect(() => {
    if (clickToHide && popupEle && (!mask || maskClosable)) {
      let clickInside = false;

      // User may mouseDown inside and drag out of popup and mouse up
      // Record here to prevent close
      const onWindowMouseDown = ({ target }: MouseEvent) => {
        clickInside = inPopupOrChild(target);
      };

      const onWindowClick = ({ target }: MouseEvent) => {
        if (
          !lockRef.current &&
          openRef.current &&
          !clickInside &&
          !inPopupOrChild(target)
        ) {
          triggerOpen(false);
        }
      };

      const win = getWin(popupEle);

      const targetRoot = targetEle?.getRootNode();

      win.addEventListener('mousedown', onWindowMouseDown);
      win.addEventListener('click', onWindowClick);

      // shadow root
      const inShadow = targetRoot && targetRoot !== targetEle.ownerDocument;
      if (inShadow) {
        (targetRoot as ShadowRoot).addEventListener(
          'mousedown',
          onWindowMouseDown,
        );
        (targetRoot as ShadowRoot).addEventListener('click', onWindowClick);
      }

      // Warning if target and popup not in same root
      if (process.env.NODE_ENV !== 'production') {
        const popupRoot = popupEle.getRootNode();

        warning(
          targetRoot === popupRoot,
          `trigger element and popup element should in same shadow root.`,
        );
      }

      return () => {
        win.removeEventListener('mousedown', onWindowMouseDown);
        win.removeEventListener('click', onWindowClick);

        if (inShadow) {
          (targetRoot as ShadowRoot).removeEventListener(
            'mousedown',
            onWindowMouseDown,
          );
          (targetRoot as ShadowRoot).removeEventListener(
            'click',
            onWindowClick,
          );
        }
      };
    }
  }, [clickToHide, targetEle, popupEle, mask, maskClosable]);
}
