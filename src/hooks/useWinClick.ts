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
  openRef.current = open;

  // Click to hide is special action since click popup element should not hide
  React.useEffect(() => {
    if (clickToHide && popupEle && (!mask || maskClosable)) {
      const onTriggerClose = ({ target }: MouseEvent) => {
        if (openRef.current && !inPopupOrChild(target)) {
          triggerOpen(false);
        }
      };

      const win = getWin(popupEle);

      win.addEventListener('mousedown', onTriggerClose, true);
      win.addEventListener('contextmenu', onTriggerClose, true);

      // shadow root
      const targetShadowRoot = getShadowRoot(targetEle);
      if (targetShadowRoot) {
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
        win.removeEventListener('mousedown', onTriggerClose, true);
        win.removeEventListener('contextmenu', onTriggerClose, true);

        if (targetShadowRoot) {
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
