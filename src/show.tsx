import React from 'react';
import type { TriggerProps } from './index';
import Trigger from './index';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

export interface ShowProps extends Omit<TriggerProps, 'children'> {
  point: [x: number, y: number];
}

export class TriggerShow {
  public container = document.createElement('div');
  public root?: Root;

  public constructor() {
    this.container.id = 'trigger-show-container';
    document.body.append(this.container);
  }

  public show(props: ShowProps) {
    if (this.root) {
      this.root.unmount();
    }
    this.root = createRoot(this.container);
    this.root.render(
      <Trigger
        popupPlacement='topLeft'
        popupAlign={{
          overflow: {
            adjustX: 1,
            adjustY: 1,
          },
        }}
        popupClassName='point-popup'
        {...props}
        alignPoint
        point={props.point}>
        <div />
      </Trigger>);
  }

  public hide() {
    this.root?.unmount();
  }
}

export const triggerShow = new TriggerShow();