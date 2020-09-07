import React from 'react';
import { mount } from 'enzyme';
import Trigger from '../src';
import { placementAlignMap } from './basic.test';

describe('Trigger.Motion', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('popup should support motion', async () => {
    const wrapper = mount(
      <Trigger
        action={['click']}
        popupAlign={placementAlignMap.left}
        popup={<strong className="x-content" />}
        popupMotion={{
          motionName: 'bamboo',
        }}
      >
        <div className="target">click</div>
      </Trigger>,
    );

    wrapper.trigger();
    expect(wrapper.getPopupInner().hasClass('bamboo-appear')).toBeTruthy();
  });
});
