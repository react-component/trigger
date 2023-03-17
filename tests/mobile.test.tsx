import { act, fireEvent, render } from '@testing-library/react';
import isMobile from 'rc-util/lib/isMobile';
import React from 'react';
import Trigger from '../src';
import { placementAlignMap } from './util';

jest.mock('rc-util/lib/isMobile');

describe('Trigger.Mobile', () => {
  beforeAll(() => {
    (isMobile as any).mockImplementation(() => true);
  });

  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  function flush() {
    act(() => {
      jest.runAllTimers();
    });
  }

  it('auto change hover to click', () => {
    render(
      <Trigger
        popupAlign={placementAlignMap.left}
        popup={<strong>trigger</strong>}
      >
        <div className="target" />
      </Trigger>,
    );

    flush();
    expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();

    // Hover not work
    fireEvent.mouseEnter(document.querySelector('.target'));
    flush();
    expect(document.querySelector('.rc-trigger-popup')).toBeFalsy();

    // Click work
    fireEvent.click(document.querySelector('.target'));
    flush();
    expect(document.querySelector('.rc-trigger-popup')).toBeTruthy();
  });

  // ====================================================================================
  // ZombieJ: back when we plan to support mobile

  function getTrigger(props?: any) {
    return (
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content" />}
        mask
        maskClosable
        mobile={{}}
        {...props}
      >
        <div className="target">click</div>
      </Trigger>
    );
  }

  it.skip('mobile config', () => {
    const { container } = render(
      getTrigger({
        mobile: {
          popupClassName: 'mobile-popup',
          popupStyle: { background: 'red' },
        },
      }),
    );

    fireEvent.click(container.querySelector('.target'));

    expect(document.querySelector('.rc-trigger-popup')).toHaveClass(
      'mobile-popup',
    );

    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      background: 'red',
    });
  });

  it.skip('popupRender', () => {
    const { container } = render(
      getTrigger({
        mobile: {
          popupRender: (node) => (
            <>
              <div>Light</div>
              {node}
            </>
          ),
        },
      }),
    );

    fireEvent.click(container.querySelector('.target'));
    expect(document.querySelector('.rc-trigger-popup')).toMatchSnapshot();
  });

  it.skip('click inside not close', () => {
    const triggerRef = React.createRef<any>();
    const { container } = render(getTrigger({ ref: triggerRef }));
    fireEvent.click(container.querySelector('.target'));
    expect(triggerRef.current.state.popupVisible).toBeTruthy();
    fireEvent.click(document.querySelector('.x-content'));
    expect(triggerRef.current.state.popupVisible).toBeTruthy();

    // Document click
    act(() => {
      fireEvent.mouseDown(document);
    });
    expect(triggerRef.current.state.popupVisible).toBeFalsy();
  });

  it.skip('legacy array children', () => {
    const { container } = render(
      getTrigger({
        popup: [<div key={0}>Light</div>, <div key={1}>Bamboo</div>],
      }),
    );
    fireEvent.click(container.querySelector('.target'));
    expect(document.querySelectorAll('.rc-trigger-popup-content')).toHaveLength(
      1,
    );
  });
});
