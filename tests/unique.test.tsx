import { cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import Trigger, { UniqueProvider } from '../src';
import { awaitFakeTimer } from './util';
import type { TriggerProps } from '../src';

// Mock UniqueBody to check if open props changed
global.openChangeLog = [];

jest.mock('../src/UniqueProvider/UniqueBody', () => {
  const OriginalUniqueBody = jest.requireActual(
    '../src/UniqueProvider/UniqueBody',
  ).default;
  const OriginReact = jest.requireActual('react');

  return (props: any) => {
    const { open } = props;
    const openRef = OriginReact.useRef(open);

    OriginReact.useEffect(() => {
      if (openRef.current !== open) {
        global.openChangeLog.push({ from: openRef.current, to: open });
        openRef.current = open;
      }
    }, [open]);

    return OriginReact.createElement(OriginalUniqueBody, props);
  };
});

async function setupAndOpenPopup(triggerProps: Partial<TriggerProps> = {}) {
  const { container } = render(
    <UniqueProvider>
      <Trigger
        action={['click']}
        popup={<strong className="x-content">tooltip</strong>}
        unique
        {...triggerProps}
      >
        <div className="target">click me</div>
      </Trigger>
    </UniqueProvider>,
  );

  // Initially no popup should be visible
  expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();

  // Click trigger to show popup
  fireEvent.click(container.querySelector('.target'));
  await awaitFakeTimer();

  // Check that popup exists
  const popup = document.querySelector('.rc-trigger-popup');
  expect(popup).toBeTruthy();

  return { container, popup };
}

describe('Trigger.Unique', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    global.openChangeLog = [];
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('moving will not hide the popup', async () => {
    const { container } = render(
      <UniqueProvider>
        <Trigger
          action={['hover']}
          popup={<strong className="x-content">tooltip1</strong>}
          unique
          mouseLeaveDelay={0.1}
        >
          <div className="target1">hover1</div>
        </Trigger>
        <Trigger
          action={['hover']}
          popup={<strong className="x-content">tooltip2</strong>}
          unique
          mouseLeaveDelay={0.1}
        >
          <div className="target2">hover2</div>
        </Trigger>
      </UniqueProvider>,
    );

    // Initially no popup should be visible
    expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();

    // Hover first trigger
    fireEvent.mouseEnter(container.querySelector('.target1'));
    await awaitFakeTimer();
    expect(document.querySelector('.x-content').textContent).toBe('tooltip1');
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();

    // Check that popup and float bg are visible
    expect(document.querySelector('.rc-trigger-popup').className).not.toContain(
      '-hidden',
    );
    expect(
      document.querySelector('.rc-trigger-popup-unique-body').className,
    ).not.toContain('-hidden');

    // Move from first to second trigger - popup should not hide, but content should change
    fireEvent.mouseLeave(container.querySelector('.target1'));
    fireEvent.mouseEnter(container.querySelector('.target2'));

    // Wait a short time (less than leave delay) to ensure no close animation is triggered
    await awaitFakeTimer();

    // Popup should still be visible with new content (no close animation)
    expect(document.querySelector('.x-content').textContent).toBe('tooltip2');
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
    expect(document.querySelector('.rc-trigger-popup').className).not.toContain(
      '-hidden',
    );
    expect(
      document.querySelector('.rc-trigger-popup-unique-body').className,
    ).not.toContain('-hidden');

    // There should only be one popup element
    expect(document.querySelectorAll('.rc-trigger-popup').length).toBe(1);
    expect(
      document.querySelectorAll('.rc-trigger-popup-unique-body').length,
    ).toBe(1);

    // FloatBg open prop should not have changed during transition (no close animation)
    expect(global.openChangeLog).toHaveLength(0);
  });

  it('should add aligned className to UniqueProvider popup', async () => {
    const getPopupClassNameFromAlign = (align: any) => {
      return `custom-align-${align.points?.[0] || 'default'}`;
    };

    const { container } = render(
      <UniqueProvider>
        <Trigger
          action={['click']}
          popup={<strong className="x-content">tooltip</strong>}
          unique
          popupPlacement="bottomLeft"
          builtinPlacements={{
            bottomLeft: {
              points: ['tl', 'bl'],
              offset: [0, 4],
              overflow: {
                adjustX: 0,
                adjustY: 1,
              },
            },
          }}
          getPopupClassNameFromAlign={getPopupClassNameFromAlign}
        >
          <div className="target">click me</div>
        </Trigger>
      </UniqueProvider>,
    );

    // Initially no popup should be visible
    expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();

    // Click trigger to show popup
    fireEvent.click(container.querySelector('.target'));
    await awaitFakeTimer();

    // Wait a bit more for alignment to complete
    await awaitFakeTimer();

    // Check that popup exists
    const popup = document.querySelector('.rc-trigger-popup');
    expect(popup).toBeTruthy();
    expect(popup.querySelector('.x-content').textContent).toBe('tooltip');

    // Check that custom className from getPopupClassNameFromAlign is applied
    expect(popup.className).toContain('custom-align');
    expect(popup.className).toContain('rc-trigger-popup-unique-controlled');
  });

  it('should apply uniqueBgClassName to UniqueBody component', async () => {
    await setupAndOpenPopup({ uniqueBgClassName: 'custom-bg-class' });

    // Check that UniqueBody has the custom background className
    const uniqueBody = document.querySelector('.rc-trigger-popup-unique-body');
    expect(uniqueBody).toBeTruthy();
    expect(uniqueBody.className).toContain('custom-bg-class');
  });

  it('should apply uniqueBgStyle to UniqueBody component', async () => {
    await setupAndOpenPopup({
      uniqueBgStyle: { backgroundColor: 'red', border: '1px solid blue' },
    });

    // Check that UniqueBody has the custom background style
    const uniqueBody = document.querySelector('.rc-trigger-popup-unique-body');
    expect(uniqueBody).toBeTruthy();
    expect(uniqueBody).toHaveStyle({
      backgroundColor: 'red',
      border: '1px solid blue',
    });
  });

  it('should not apply any additional className to UniqueBody when uniqueBgClassName is not provided', async () => {
    await setupAndOpenPopup();

    // Check that UniqueBody exists but does not have custom background className
    const uniqueBody = document.querySelector('.rc-trigger-popup-unique-body');
    expect(uniqueBody).toBeTruthy();
    expect(uniqueBody.className).not.toContain('undefined');
  });

  it('should pass alignedClassName on unique body', async () => {
    const getPopupClassNameFromAlign = () => 'bamboo';

    render(
      <UniqueProvider>
        <Trigger
          action={['click']}
          popup={<strong className="x-content">tooltip</strong>}
          unique
          popupVisible
          popupPlacement="bottomLeft"
          getPopupClassNameFromAlign={getPopupClassNameFromAlign}
          builtinPlacements={{
            bottomLeft: {
              points: ['tl', 'bl'],
              offset: [0, 4],
              overflow: {
                adjustX: 0,
                adjustY: 1,
              },
            },
          }}
          arrow
        >
          <div className="target">click me</div>
        </Trigger>
      </UniqueProvider>,
    );

    expect(document.querySelector('.rc-trigger-popup')).toHaveClass('bamboo');
    expect(document.querySelector('.rc-trigger-popup-unique-body')).toHaveClass(
      'bamboo',
    );

    // Check that arrow position CSS variables are set
    const uniqueBody = document.querySelector('.rc-trigger-popup-unique-body');
    const computedStyle = getComputedStyle(uniqueBody);
    expect(computedStyle.getPropertyValue('--arrow-x')).not.toBe('');
    expect(computedStyle.getPropertyValue('--arrow-y')).not.toBe('');
  });
});
