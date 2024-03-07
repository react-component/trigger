import { getShadowRoot } from 'rc-util/lib/Dom/shadow';
import { warning } from 'rc-util/lib/warning';
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

  // // Window click to hide should be lock to avoid trigger lock immediately
  // const lockRef = React.useRef(false);
  if (openRef.current !== open) {
    // lockRef.current = true;
    openRef.current = open;
  }

  // React.useEffect(() => {
  //   const id = raf(() => {
  //     lockRef.current = false;
  //   });

  //   return () => {
  //     raf.cancel(id);
  //   };
  // }, [open]);

  // Click to hide is special action since click popup element should not hide
  React.useEffect(() => {
    if (clickToHide && popupEle && (!mask || maskClosable)) {
      // const genClickEvents = () => {
      //   // let clickInside = false;

      //   // // User may mouseDown inside and drag out of popup and mouse up
      //   // // Record here to prevent close
      //   // const onWindowMouseDown = ({ target }: MouseEvent) => {
      //   //   clickInside = inPopupOrChild(target);
      //   // };

      //   // const onWindowClick = ({ target }: MouseEvent) => {
      //   //   if (
      //   //     !lockRef.current &&
      //   //     openRef.current &&
      //   //     !clickInside &&
      //   //     !inPopupOrChild(target)
      //   //   ) {
      //   //     triggerOpen(false);
      //   //   }
      //   // };

      //   // return [onWindowMouseDown, onWindowClick];
      // };

      // // Events
      // const [onWinMouseDown, onWinClick] = genClickEvents();
      // const [onShadowMouseDown, onShadowClick] = genClickEvents();

      const onTriggerClose = ({ target }: MouseEvent) => {
        if (openRef.current && !inPopupOrChild(target)) {
          triggerOpen(false);
        }
      };

      const win = getWin(popupEle);

      // win.addEventListener('mousedown', onWinMouseDown, true);
      // win.addEventListener('click', onWinClick, true);
      // win.addEventListener('contextmenu', onWinClick, true);
      win.addEventListener('mousedown', onTriggerClose, true);
      win.addEventListener('contextmenu', onTriggerClose, true);

      // shadow root
      const targetShadowRoot = getShadowRoot(targetEle);
      if (targetShadowRoot) {
        // targetShadowRoot.addEventListener('mousedown', onShadowMouseDown, true);
        // targetShadowRoot.addEventListener('click', onShadowClick, true);
        // targetShadowRoot.addEventListener('contextmenu', onShadowClick, true);
        targetShadowRoot.addEventListener('mousedown', onTriggerClose, true);
        targetShadowRoot.addEventListener('contextmenu', onTriggerClose, true);
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
        // win.removeEventListener('mousedown', onWinMouseDown, true);
        // win.removeEventListener('click', onWinClick, true);
        // win.removeEventListener('contextmenu', onWinClick, true);
        win.removeEventListener('mousedown', onTriggerClose, true);
        win.removeEventListener('contextmenu', onTriggerClose, true);

        if (targetShadowRoot) {
          // targetShadowRoot.removeEventListener(
          //   'mousedown',
          //   onShadowMouseDown,
          //   true,
          // );
          // targetShadowRoot.removeEventListener('click', onShadowClick, true);
          // targetShadowRoot.removeEventListener(
          //   'contextmenu',
          //   onShadowClick,
          //   true,
          // );
          targetShadowRoot.removeEventListener(
            'mousedown',
            onTriggerClose,
            true,
          );
          targetShadowRoot.removeEventListener(
            'contextmenu',
            onTriggerClose,
            true,
          );
        }
      };
    }
  }, [clickToHide, targetEle, popupEle, mask, maskClosable]);
}
