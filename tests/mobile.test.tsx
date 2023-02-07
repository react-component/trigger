import React, { createRef } from 'react';
import isMobile from 'rc-util/lib/isMobile';
import { act, fireEvent, render } from '@testing-library/react';
import type { TriggerProps } from '../src';
import Trigger from '../src';
import { placementAlignMap } from './util';

jest.mock('rc-util/lib/isMobile');

describe.skip('Trigger.Mobile', () => {
  beforeAll(() => {
    (isMobile as any).mockImplementation(() => true);
  });

  function getTrigger(
    props?: Partial<
      TriggerProps & React.ClassAttributes<InstanceType<typeof Trigger>>
    >,
  ) {
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

  it('mobile config', () => {
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

  it('popupRender', () => {
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

  it('click inside not close', () => {
    const triggerRef = createRef<InstanceType<typeof Trigger>>();
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

  it('legacy array children', () => {
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
