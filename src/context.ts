import * as React from 'react';
import type { TriggerProps } from './index';

// ===================== Nest =====================
export interface TriggerContextProps {
  registerSubPopup: (id: string, node: HTMLElement) => void;
}

const TriggerContext = React.createContext<TriggerContextProps | null>(null);

export default TriggerContext;

// ==================== Unique ====================
export interface UniqueContextProps {
  show: (popup: TriggerProps['popup'], target: HTMLElement, delay: number) => void;
  hide: (delay: number) => void;
}

export const UniqueContext = React.createContext<UniqueContextProps | null>(
  null,
);
