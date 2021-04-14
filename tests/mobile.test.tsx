import React from 'react';
import { act } from 'react-dom/test-utils';
import isMobile from 'rc-util/lib/isMobile';
import { mount } from 'enzyme';
import type { TriggerProps } from '../src';
import Trigger from '../src';
import { placementAlignMap } from './util';

jest.mock('rc-util/lib/isMobile');

describe('Trigger.Mobile', () => {
  beforeAll(() => {
    (isMobile as any).mockImplementation(() => true);
  });

  function getTrigger(props?: Partial<TriggerProps>) {
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
    const wrapper = mount(
      getTrigger({
        mobile: {
          popupClassName: 'mobile-popup',
          popupStyle: { background: 'red' },
        },
      }),
    );

    wrapper.find('.target').simulate('click');

    expect(
      wrapper.find('.rc-trigger-popup').hasClass('mobile-popup'),
    ).toBeTruthy();

    expect(wrapper.find('.rc-trigger-popup').props().style).toEqual(
      expect.objectContaining({ background: 'red' }),
    );
  });

  it('popupRender', () => {
    const wrapper = mount(
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

    wrapper.find('.target').simulate('click');
    expect(wrapper.find('.rc-trigger-popup').render()).toMatchSnapshot();
  });

  it('click inside not close', () => {
    const wrapper = mount(getTrigger());
    wrapper.find('.target').simulate('click');
    expect((wrapper.state() as any).popupVisible).toBeTruthy();
    wrapper.find('.x-content').simulate('click');
    expect((wrapper.state() as any).popupVisible).toBeTruthy();

    // Document click
    act(() => {
      const mouseEvent = new MouseEvent('mousedown');
      document.dispatchEvent(mouseEvent);
      wrapper.update();
    });
    expect((wrapper.state() as any).popupVisible).toBeFalsy();
  });

  it('legacy array children', () => {
    const wrapper = mount(
      getTrigger({ popup: [<div>Light</div>, <div>Bamboo</div>] }),
    );
    wrapper.find('.target').simulate('click');
    expect(wrapper.find('.rc-trigger-popup-content')).toHaveLength(1);
  });
});
