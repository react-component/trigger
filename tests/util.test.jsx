import { getMotion } from '../src/util';
// import MockTrigger from '../src/mock';

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
      expect(getMotion(prefixCls, motion, animation, transitionName)).toEqual({
        motionName: 'motion',
      });
    });

    it('animation is second', () => {
      expect(getMotion(prefixCls, null, animation, transitionName)).toEqual({
        motionName: 'test-animation',
      });
    });

    it('transition is last', () => {
      expect(getMotion(prefixCls, null, null, transitionName)).toEqual({
        motionName: 'transition',
      });
    });
  });

  // describe('mock', () => {
  //   it('close', () => {
  //     const { container } = render(
  //       <MockTrigger
  //         action={['click']}
  //         popupAlign={{ points: ['cr', 'cl'] }}
  //         popup={<div>bamboo</div>}
  //       >
  //         <div>light</div>
  //       </MockTrigger>,
  //     );

  //     expect(container.innerHTML).toEqual('<div>light</div>');
  //   });

  //   it('open', () => {
  //     const { container } = render(
  //       <MockTrigger
  //         action={['click']}
  //         popupAlign={{ points: ['cr', 'cl'] }}
  //         popup={<div>bamboo</div>}
  //         popupVisible
  //       >
  //         <div>light</div>
  //       </MockTrigger>,
  //     );

  //     expect(container.innerHTML).toEqual(
  //       '<div>light</div><div><div class="rc-trigger-popup" style="opacity: 0;"><div>bamboo</div></div></div>',
  //     );
  //   });
  // });
});
