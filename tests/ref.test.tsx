/* eslint-disable max-classes-per-file */

import { cleanup, render } from '@testing-library/react';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import React from 'react';
import Trigger, { type TriggerRef } from '../src';

describe('Trigger.Ref', () => {
  beforeAll(() => {
    spyElementPrototypes(HTMLElement, {
      offsetParent: {
        get: () => document.body,
      },
    });
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('support nativeElement', () => {
    const triggerRef = React.createRef<TriggerRef>();

    const { container } = render(
      <Trigger ref={triggerRef} popup={<div />}>
        <button />
      </Trigger>,
    );

    expect(triggerRef.current.nativeElement).toBe(
      container.querySelector('button'),
    );
  });

  it('support popupElement', () => {
    const triggerRef = React.createRef<TriggerRef>();

    render(
      <Trigger ref={triggerRef} popupVisible popup={<div />}>
        <button />
      </Trigger>,
    );

    expect(triggerRef.current.popupElement).toBe(
      document.querySelector('.rc-trigger-popup'),
    );
  });
});
