import * as React from 'react';
import type { CSSMotionProps } from '@rc-component/motion';
import type { TriggerProps } from './index';
import type { AlignType, ArrowTypeOuter, BuildInPlacements } from './interface';

// ===================== Nest =====================
export interface TriggerContextProps {
  registerSubPopup: (id: string, node: HTMLElement) => void;
}

const TriggerContext = React.createContext<TriggerContextProps | null>(null);

export default TriggerContext;

// ==================== Unique ====================
export interface UniqueShowOptions {
  id: string;
  popup: TriggerProps['popup'];
  target: HTMLElement;
  delay: number;
  prefixCls?: string;
  popupClassName?: string;
  popupStyle?: React.CSSProperties;
  popupPlacement?: string;
  builtinPlacements?: BuildInPlacements;
  popupAlign?: AlignType;
  zIndex?: number;
  mask?: boolean;
  maskClosable?: boolean;
  popupMotion?: CSSMotionProps;
  maskMotion?: CSSMotionProps;
  arrow?: boolean | ArrowTypeOuter;
  getPopupContainer?: TriggerProps['getPopupContainer'];
}

export interface UniqueContextProps {
  show: (options: UniqueShowOptions) => void;
  hide: (delay: number) => void;
}

export const UniqueContext = React.createContext<UniqueContextProps | null>(
  null,
);
