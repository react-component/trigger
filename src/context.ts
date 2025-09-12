import * as React from 'react';
import type { TriggerProps } from './index';

// ===================== Nest =====================
export interface TriggerContextProps {
  registerSubPopup: (id: string, node: HTMLElement) => void;
}

const TriggerContext = React.createContext<TriggerContextProps | null>(null);

export default TriggerContext;

// ==================== Unique ====================
export interface UniqueShowOptions {
  popup: TriggerProps['popup'];
  target: HTMLElement;
  delay: number;
  prefixCls?: string;
  popupClassName?: string;
  popupStyle?: React.CSSProperties;
  popupPlacement?: string;
  builtinPlacements?: any;
  popupAlign?: any;
  zIndex?: number;
  mask?: boolean;
  maskClosable?: boolean;
  popupMotion?: any;
  maskMotion?: any;
  arrow?: any;
  getPopupContainer?: TriggerProps['getPopupContainer'];
}

export interface UniqueContextProps {
  show: (options: UniqueShowOptions) => void;
  hide: (delay: number) => void;
}

export const UniqueContext = React.createContext<UniqueContextProps | null>(
  null,
);
