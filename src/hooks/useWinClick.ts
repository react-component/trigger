import { warning } from 'rc-util';
import { getShadowRoot } from 'rc-util/lib/Dom/shadow';
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
      const genClickEvents = () => {
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

        return [onWindowMouseDown, onWindowClick];
      };

      // Events
      const [onWinMouseDown, onWinClick] = genClickEvents();
      const [onShadowMouseDown, onShadowClick] = genClickEvents();

      const win = getWin(popupEle);

      win.addEventListener('mousedown', onWinMouseDown, true);
      win.addEventListener('click', onWinClick, true);
      win.addEventListener('contextmenu', onWinClick, true);

      // shadow root
      const targetShadowRoot = getShadowRoot(targetEle);
      if (targetShadowRoot) {
        targetShadowRoot.addEventListener('mousedown', onShadowMouseDown, true);
        targetShadowRoot.addEventListener('click', onShadowClick, true);
        targetShadowRoot.addEventListener('contextmenu', onShadowClick, true);
      }

      // Warning if target and popup not in same root
      if (process.env.NODE_ENV !== 'production') {
        const targetRoot = targetEle?.getRootNode?.();
        const popupRoot = popupEle.getRootNode?.();

        warning(
          targetRoot === popupRoot,
          `trigger element and popup element should in same shadow root.`,
        );
      }

      return () => {
        win.removeEventListener('mousedown', onWinMouseDown, true);
        win.removeEventListener('click', onWinClick, true);
        win.removeEventListener('contextmenu', onWinClick, true);

        if (targetShadowRoot) {
          targetShadowRoot.removeEventListener(
            'mousedown',
            onShadowMouseDown,
            true,
          );
          targetShadowRoot.removeEventListener('click', onShadowClick, true);
          targetShadowRoot.removeEventListener(
            'contextmenu',
            onShadowClick,
            true,
          );
        }
      };
    }
  }, [clickToHide, targetEle, popupEle, mask, maskClosable]);
}
