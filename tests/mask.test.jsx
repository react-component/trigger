import React from 'react';
import { mount } from 'enzyme';
import Trigger from '../src';
import { placementAlignMap } from './util';

describe('Trigger.Mask', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('mask should support motion', () => {
    const wrapper = mount(
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content" />}
        mask
        maskTransitionName="bamboo"
      >
        <div className="target">click</div>
      </Trigger>,
    );

    wrapper.trigger();

    expect(wrapper.find('Mask CSSMotion').props().motionName).toEqual('bamboo');
  });
});
