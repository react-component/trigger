import { renderHook } from '@testing-library/react';
import useOffsetStyle from '../src/hooks/useOffsetStyle';

describe('useOffsetStyle', () => {
  it('uses right and bottom offsets with dynamic inset alignment', () => {
    const { result } = renderHook(() =>
      useOffsetStyle(
        false,
        true,
        true,
        {
          points: ['br', 'tr'],
          dynamicInset: true,
        },
        12,
        34,
        56,
        78,
      ),
    );

    expect(result.current).toEqual({
      left: 'auto',
      top: 'auto',
      right: 12,
      bottom: 34,
    });
  });
});
