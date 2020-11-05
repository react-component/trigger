import React from 'react';
import isMobile from 'rc-util/lib/isMobile';
import { mount } from 'enzyme';
import Trigger from '../src';
import { placementAlignMap } from './basic.test';

jest.mock('rc-util/lib/isMobile');

describe('Trigger.Mobile', () => {
  beforeAll(() => {
    (isMobile as any).mockImplementation(() => true);
  });

  it('mobile config', () => {
    const wrapper = mount(
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content" />}
        mask
        mobile={{
          popupClassName: 'mobile-popup',
          popupStyle: { background: 'red' },
        }}
      >
        <div className="target">click</div>
      </Trigger>,
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
      <Trigger
        action={['click']}
        popup={<strong className="x-content" />}
        mobile={{
          popupRender: node => (
            <>
              <div>Light</div>
              {node}
            </>
          ),
        }}
      >
        <div className="target">click</div>
      </Trigger>,
    );

    wrapper.find('.target').simulate('click');
    expect(wrapper.find('.rc-trigger-popup').render()).toMatchSnapshot();
  });
});
