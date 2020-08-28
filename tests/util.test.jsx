import React from 'react';
import { mount } from 'enzyme';
import { getMotion } from '../src/utils/legacyUtil';
import MockTrigger from '../src/mock';

/**
 * dom-align internal default position is `-999`.
 * We do not need to simulate full position, check offset only.
 */
describe('Trigger.Util', () => {
  describe('getMotion', () => {
    const prefixCls = 'test';
    const motion = {
      motionName: 'motion',
    };
    const transitionName = 'transition';
    const animation = 'animation';

    it('motion is first', () => {
      expect(
        getMotion({
          prefixCls,
          motion,
          animation,
          transitionName,
        }),
      ).toEqual({
        motionName: 'motion',
      });
    });

    it('animation is second', () => {
      expect(
        getMotion({
          prefixCls,
          motion: null,
          animation,
          transitionName,
        }),
      ).toEqual({
        motionName: 'test-animation',
      });
    });

    it('transition is last', () => {
      expect(
        getMotion({
          prefixCls,
          motion: null,
          animation: null,
          transitionName,
        }),
      ).toEqual({
        motionName: 'transition',
      });
    });
  });

  describe('mock', () => {
    it('close', () => {
      const wrapper = mount(
        <MockTrigger
          action={['click']}
          popupAlign={{ points: ['cr', 'cl'] }}
          popup={<div>bamboo</div>}
        >
          <div>light</div>
        </MockTrigger>,
      );

      expect(wrapper.html()).toEqual('<div>light</div>');
    });

    it('open', () => {
      const wrapper = mount(
        <MockTrigger
          action={['click']}
          popupAlign={{ points: ['cr', 'cl'] }}
          popup={<div>bamboo</div>}
          popupVisible
        >
          <div>light</div>
        </MockTrigger>,
      );

      expect(wrapper.html()).toEqual(
        '<div>light</div><div><div class="rc-trigger-popup" style="opacity: 0; pointer-events: none;"><div>bamboo</div></div></div>',
      );
    });
  });
});
