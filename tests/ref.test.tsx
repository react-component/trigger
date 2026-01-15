/* eslint-disable max-classes-per-file */

import { cleanup, render } from '@testing-library/react';
import { spyElementPrototypes } from '@rc-component/util/lib/test/domHook';
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

  it('should support ref.nativeElement', () => {
    const ChildComponent = React.forwardRef<
      { nativeElement: HTMLElement },
      React.PropsWithChildren
    >((props, ref) => {
      const buttonRef = React.useRef<HTMLButtonElement>(null);

      React.useImperativeHandle(ref, () => ({
        nativeElement: buttonRef.current,
      }));

      return <button ref={buttonRef} {...props} />;
    });

    const triggerRef = React.createRef<TriggerRef>();
    const childRef = React.createRef<{ nativeElement: HTMLElement }>();

    const { container } = render(
      <Trigger ref={triggerRef} popup={<div />}>
        <ChildComponent ref={childRef} />
      </Trigger>,
    );

    const buttonElement = container.querySelector('button');

    // Check child ref returns object with nativeElement
    expect(childRef.current.nativeElement).toBe(buttonElement);

    // Check Trigger can extract DOM from child ref
    expect(triggerRef.current.nativeElement).toBe(buttonElement);
  });
});
