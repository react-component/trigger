import * as React from 'react';

// ===================== Nest =====================
export interface TriggerContextProps {
  registerSubPopup: (id: string, node: HTMLElement) => void;
}

const TriggerContext = React.createContext<TriggerContextProps | null>(null);

export default TriggerContext;

// ==================== Unique ====================
export interface UniqueContextProps {
  show: (target: HTMLElement) => void;
  hide: (target: HTMLElement) => void;
}

export const UniqueContext = React.createContext<UniqueContextProps | null>(
  null,
);
