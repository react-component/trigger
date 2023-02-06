import * as React from 'react';

export interface TriggerContextProps {
  registerSubPopup: (id: string, node: HTMLElement) => void;
}

const TriggerContext = React.createContext<TriggerContextProps | null>(null);

export default TriggerContext;
