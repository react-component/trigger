import { cleanup, render } from '@testing-library/react';
import { spyElementPrototypes } from 'rc-util/lib/test/domHook';
import React from 'react';
import Trigger from '../src';
import { awaitFakeTimer } from './util';

describe('Trigger.Rect', () => {
  let targetVisible = true;

  let rectX = 100;
  let rectY = 100;
  let rectWidth = 100;
  let rectHeight = 100;

  beforeAll(() => {
    spyElementPrototypes(HTMLDivElement, {
      getBoundingClientRect: () => ({
        left: rectX,
        top: rectY,
        width: rectWidth,
        height: rectHeight,
        right: 200,
        bottom: 200,
      }),
    });

    spyElementPrototypes(HTMLElement, {
      offsetParent: {
        get: () => (targetVisible ? document.body : null),
      },
    });
    spyElementPrototypes(SVGElement, {
      offsetParent: {
        get: () => (targetVisible ? document.body : null),
      },
    });
  });

  beforeEach(() => {
    targetVisible = true;

    rectX = 100;
    rectY = 100;
    rectWidth = 100;
    rectHeight = 100;

    jest.useFakeTimers();
  });

  afterEach(() => {
    cleanup();
    jest.useRealTimers();
  });

  it('getBoundingClientRect top and left', async () => {
    render(
      <Trigger
        popupVisible
        popup={<span className="bamboo" />}
        popupAlign={{
          points: ['bc', 'tc'],
          _experimental: {
            dynamicInset: true,
          },
        }}
      >
        <div />
      </Trigger>,
    );

    await awaitFakeTimer();

    expect(document.querySelector('.rc-trigger-popup')).toHaveStyle({
      bottom: `100px`,
    });
  });
});
