import * as React from 'react';
import { CSSMotionProps } from 'rc-motion';
import {
  StretchType,
  AlignType,
  TransitionNameType,
  AnimationType,
  Point,
} from '../interface';
import Mask from './Mask';
import PopupInner, { PopupInnerRef } from './PopupInner';

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
}

const Popup = React.forwardRef<PopupInnerRef, PopupProps>((props, ref) => {
  const { ...cloneProps } = props;

  // We can use fragment directly but this may failed some selector usage. Keep as origin logic
  return (
    <div>
      <Mask {...cloneProps} />
      <PopupInner {...cloneProps} ref={ref} />
    </div>
  );
});

Popup.displayName = 'Popup';

export default Popup;
