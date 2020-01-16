import React from 'react';
import { mount } from 'enzyme';
import raf from 'raf';
import Popup from '../src/Popup';

jest.mock('raf', () => {
  const rafMock = jest.fn(() => 1);
  rafMock.cancel = jest.fn();
  return rafMock;
});

describe('Popup', () => {
  afterEach(() => {
    raf.mockClear();
    raf.cancel.mockClear();
  });

  describe('Popup getDerivedStateFromProps status behavior', () => {
    it('returns stable on init', () => {
      const props = { visible: false };
      const state = { prevVisible: null, status: 'something' };

      expect(Popup.getDerivedStateFromProps(props, state).status).toBe('stable');
    });

    it('does not change when visible is unchanged', () => {
      const props = { visible: true };
      const state = { prevVisible: true, status: 'something' };

      expect(Popup.getDerivedStateFromProps(props, state).status).toBe('something');
    });

    it('returns null when visible is changed to true', () => {
      const props = { visible: true };
      const state = { prevVisible: false, status: 'something' };

      expect(Popup.getDerivedStateFromProps(props, state).status).toBe(null);
    });

    it('returns stable when visible is changed to false and motion is not supported', () => {
      const props = { visible: false };
      const state = { prevVisible: true, status: 'something' };

      expect(Popup.getDerivedStateFromProps(props, state).status).toBe('stable');
    });

    it('returns null when visible is changed to false and motion is started', () => {
      const props = {
        visible: false,
        motion: {
          motionName: 'enter',
        },
      };
      const state = { prevVisible: true, status: 'motion' };

      expect(Popup.getDerivedStateFromProps(props, state).status).toBe(null);
    });

    it('returns stable when visible is changed to false and motion is not started', () => {
      const props = {
        visible: false,
        motion: {
          motionName: 'enter',
        },
      };
      const state = { prevVisible: true, status: 'beforeMotion' };

      expect(Popup.getDerivedStateFromProps(props, state).status).toBe('stable');
    });
  });

  it('Popup cancels pending animation frames on update', () => {
    const wrapper = mount(
      <Popup visible motion={{}}>
        <div>popup content</div>
      </Popup>,
    );

    expect(raf).toHaveBeenCalledTimes(1);
    expect(raf.cancel).not.toHaveBeenCalled();

    wrapper.setProps({ visible: false });
    expect(raf.cancel).toHaveBeenCalledTimes(1);
  });
});
