import { cleanup, fireEvent, render } from '@testing-library/react';
import React from 'react';
import Trigger, { UniqueProvider, type UniqueProviderProps } from '../src';
import { awaitFakeTimer } from './util';
import type { TriggerProps } from '../src';
import { clsx } from 'clsx';

// Mock UniqueContainer to check if open props changed
global.openChangeLog = [];

jest.mock('../src/UniqueProvider/UniqueContainer', () => {
  const OriginalUniqueContainer = jest.requireActual(
    '../src/UniqueProvider/UniqueContainer',
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

    return OriginReact.createElement(OriginalUniqueContainer, props);
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
    jest.restoreAllMocks();
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
      document.querySelector('.rc-trigger-popup-unique-container').className,
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
      document.querySelector('.rc-trigger-popup-unique-container').className,
    ).not.toContain('-hidden');

    // There should only be one popup element
    expect(document.querySelectorAll('.rc-trigger-popup').length).toBe(1);
    expect(
      document.querySelectorAll('.rc-trigger-popup-unique-container').length,
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

  it('should apply uniqueContainerClassName to UniqueContainer component', async () => {
    await setupAndOpenPopup({
      uniqueContainerClassName: 'custom-container-class',
    });

    // Check that UniqueContainer has the custom container className
    const uniqueContainer = document.querySelector(
      '.rc-trigger-popup-unique-container',
    );
    expect(uniqueContainer).toBeTruthy();
    expect(uniqueContainer.className).toContain('custom-container-class');
  });

  it('should apply uniqueContainerStyle to UniqueContainer component', async () => {
    await setupAndOpenPopup({
      uniqueContainerStyle: {
        backgroundColor: 'red',
        border: '1px solid blue',
      },
    });

    // Check that UniqueContainer has the custom container style
    const uniqueContainer = document.querySelector(
      '.rc-trigger-popup-unique-container',
    );
    expect(uniqueContainer).toBeTruthy();
    expect(uniqueContainer).toHaveStyle({
      backgroundColor: 'red',
      border: '1px solid blue',
    });
  });

  it('should not apply any additional className to UniqueContainer when uniqueContainerClassName is not provided', async () => {
    await setupAndOpenPopup();

    // Check that UniqueContainer exists but does not have custom container className
    const uniqueContainer = document.querySelector(
      '.rc-trigger-popup-unique-container',
    );
    expect(uniqueContainer).toBeTruthy();
    expect(uniqueContainer.className).not.toContain('undefined');
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
    expect(
      document.querySelector('.rc-trigger-popup-unique-container'),
    ).toHaveClass('bamboo');

    // Check that arrow position CSS variables are set
    const uniqueContainer = document.querySelector(
      '.rc-trigger-popup-unique-container',
    );
    const computedStyle = getComputedStyle(uniqueContainer);
    expect(computedStyle.getPropertyValue('--arrow-x')).not.toBe('');
    expect(computedStyle.getPropertyValue('--arrow-y')).not.toBe('');
  });

  it('should apply postTriggerProps to customize options', async () => {
    const postTriggerProps: UniqueProviderProps['postTriggerProps'] = (
      options,
    ) => ({
      ...options,
      popupClassName: clsx(options.popupClassName, 'custom-post-options-class'),
    });

    render(
      <UniqueProvider postTriggerProps={postTriggerProps}>
        <Trigger
          action={['click']}
          popup={<strong className="x-content">tooltip</strong>}
          unique
          popupVisible
        >
          <div className="target">click me</div>
        </Trigger>
      </UniqueProvider>,
    );

    // Check that the custom class from postTriggerProps is applied
    expect(document.querySelector('.rc-trigger-popup')).toHaveClass(
      'custom-post-options-class',
    );
  });

  it('should call onAlign when target changes', async () => {
    const mockOnAlign = jest.fn();

    // Mock useAlign to return our mock onAlign function
    const useAlignModule = require('../src/hooks/useAlign');
    const originalUseAlign = useAlignModule.default;

    jest.spyOn(useAlignModule, 'default').mockImplementation((...args) => {
      const originalResult = originalUseAlign(...args);
      // Replace onAlign with our mock
      return [
        originalResult[0], // ready
        originalResult[1], // offsetX
        originalResult[2], // offsetY
        originalResult[3], // offsetR
        originalResult[4], // offsetB
        originalResult[5], // arrowX
        originalResult[6], // arrowY
        originalResult[7], // scaleX
        originalResult[8], // scaleY
        originalResult[9], // alignInfo
        mockOnAlign, // onAlign - our mock function
      ];
    });

    // Test component with two controlled triggers
    const TestComponent = () => {
      const [trigger1Open, setTrigger1Open] = React.useState(true);
      const [trigger2Open, setTrigger2Open] = React.useState(false);

      return (
        <div>
          <button
            className="switch-trigger-btn"
            onClick={() => {
              // Switch which trigger is open - this changes the target
              setTrigger1Open(!trigger1Open);
              setTrigger2Open(!trigger2Open);
            }}
          >
            Switch Trigger
          </button>
          <UniqueProvider>
            <Trigger
              popupVisible={trigger1Open}
              popup={<div>Trigger 1 Popup</div>}
              unique
            >
              <div className="trigger-1">Trigger 1</div>
            </Trigger>
            <Trigger
              popupVisible={trigger2Open}
              popup={<div>Trigger 2 Popup</div>}
              unique
            >
              <div className="trigger-2">Trigger 2</div>
            </Trigger>
          </UniqueProvider>
        </div>
      );
    };

    const { container } = render(<TestComponent />);

    // Wait for initial render
    await awaitFakeTimer();

    // Clear any initial calls
    mockOnAlign.mockClear();

    // Switch triggers - this should change the target and call onAlign
    fireEvent.click(container.querySelector('.switch-trigger-btn'));
    await awaitFakeTimer();

    // Verify onAlign was called due to target change
    expect(mockOnAlign).toHaveBeenCalled();
  });

  it('esc should close unique popup', async () => {
    const { container,baseElement } = render(
      <UniqueProvider>
        <Trigger action={['click']} popup={<div>Popup</div>} unique>
          <div className="target" />
        </Trigger>
      </UniqueProvider>,
    );
    fireEvent.click(container.querySelector('.target'));
    await awaitFakeTimer();
    expect(baseElement.querySelector('.rc-trigger-popup-hidden')).toBeFalsy();

    fireEvent.keyDown(window, { key: 'Escape' });
    await awaitFakeTimer();
    expect(baseElement.querySelector('.rc-trigger-popup-hidden')).toBeTruthy();
  });
});
