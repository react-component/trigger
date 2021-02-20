import * as React from 'react';
import { useState, useEffect } from 'react';
import type { CSSMotionProps } from 'rc-motion';
import isMobile from 'rc-util/lib/isMobile';
import type {
  StretchType,
  AlignType,
  TransitionNameType,
  AnimationType,
  Point,
  MobileConfig,
} from '../interface';
import Mask from './Mask';
import type { PopupInnerRef } from './PopupInner';
import PopupInner from './PopupInner';
import MobilePopupInner from './MobilePopupInner';

export interface PopupProps {
  visible?: boolean;
  style?: React.CSSProperties;
  getClassNameFromAlign?: (align: AlignType) => string;
  onAlign?: (element: HTMLElement, align: AlignType) => void;
  getRootDomNode?: () => HTMLElement;
  align?: AlignType;
  destroyPopupOnHide?: boolean;
  className?: string;
  prefixCls: string;
  onMouseEnter?: React.MouseEventHandler<HTMLElement>;
  onMouseLeave?: React.MouseEventHandler<HTMLElement>;
  onMouseDown?: React.MouseEventHandler<HTMLElement>;
  onTouchStart?: React.TouchEventHandler<HTMLElement>;
  stretch?: StretchType;
  children?: React.ReactNode;
  point?: Point;
  zIndex?: number;
  mask?: boolean;

  // Motion
  motion: CSSMotionProps;
  maskMotion: CSSMotionProps;

  // Legacy
  animation: AnimationType;
  transitionName: TransitionNameType;
  maskAnimation: AnimationType;
  maskTransitionName: TransitionNameType;

  // Mobile
  mobile?: MobileConfig;
}

const Popup = React.forwardRef<PopupInnerRef, PopupProps>(
  ({ visible, mobile, ...props }, ref) => {
    const [innerVisible, serInnerVisible] = useState(visible);
    const [inMobile, setInMobile] = useState(false);
    const cloneProps = { ...props, visible: innerVisible };

    // We check mobile in visible changed here.
    // And this also delay set `innerVisible` to avoid popup component render flash
    useEffect(() => {
      serInnerVisible(visible);
      if (visible && mobile) {
        setInMobile(isMobile());
      }
    }, [visible, mobile]);

    const popupNode: React.ReactNode = inMobile ? (
      <MobilePopupInner {...cloneProps} mobile={mobile} ref={ref} />
    ) : (
      <PopupInner {...cloneProps} ref={ref} />
    );

    // We can use fragment directly but this may failed some selector usage. Keep as origin logic
    return (
      <div>
        <Mask {...cloneProps} />
        {popupNode}
      </div>
    );
  },
);

Popup.displayName = 'Popup';

export default Popup;
