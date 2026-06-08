import {
  getSafeHoverAreaPolygons,
  getSafeHoverSide,
  isPointInSafeHoverArea,
  type SafeHoverRect,
} from '../src/util/safeHover';

function rect(
  left: number,
  top: number,
  width: number,
  height: number,
): SafeHoverRect {
  return {
    left,
    top,
    width,
    height,
    right: left + width,
    bottom: top + height,
  };
}

describe('safeHover util', () => {
  it('detects popup side from separated rectangles', () => {
    const target = rect(40, 40, 20, 20);

    expect(getSafeHoverSide(target, rect(40, 0, 20, 20))).toBe('top');
    expect(getSafeHoverSide(target, rect(40, 80, 20, 20))).toBe('bottom');
    expect(getSafeHoverSide(target, rect(0, 40, 20, 20))).toBe('left');
    expect(getSafeHoverSide(target, rect(80, 40, 20, 20))).toBe('right');
    expect(getSafeHoverSide(target, rect(45, 45, 20, 20))).toBeNull();
  });

  it('keeps the vertical gap and diagonal intent safe', () => {
    const target = rect(0, 0, 100, 20);
    const popup = rect(20, 60, 60, 30);
    const leavePoint: [number, number] = [50, 20];

    expect(isPointInSafeHoverArea([50, 10], leavePoint, target, popup)).toBe(
      true,
    );
    expect(isPointInSafeHoverArea([50, 70], leavePoint, target, popup)).toBe(
      true,
    );
    expect(isPointInSafeHoverArea([50, 40], leavePoint, target, popup)).toBe(
      true,
    );
    expect(isPointInSafeHoverArea([30, 50], leavePoint, target, popup)).toBe(
      true,
    );
    expect(isPointInSafeHoverArea([150, 40], leavePoint, target, popup)).toBe(
      false,
    );
  });

  it('rejects leave points moving away from the popup', () => {
    expect(
      isPointInSafeHoverArea(
        [50, 40],
        [50, 0],
        rect(0, 0, 100, 20),
        rect(20, 60, 60, 30),
      ),
    ).toBe(false);
    expect(
      isPointInSafeHoverArea(
        [50, 60],
        [50, 100],
        rect(0, 80, 100, 20),
        rect(20, 10, 60, 30),
      ),
    ).toBe(false);
    expect(
      isPointInSafeHoverArea(
        [60, 50],
        [100, 50],
        rect(80, 0, 20, 100),
        rect(10, 20, 30, 60),
      ),
    ).toBe(false);
    expect(
      isPointInSafeHoverArea(
        [40, 50],
        [0, 50],
        rect(0, 0, 20, 100),
        rect(60, 20, 30, 60),
      ),
    ).toBe(false);
  });

  it('keeps horizontal gaps safe', () => {
    expect(
      isPointInSafeHoverArea(
        [60, 50],
        [80, 50],
        rect(80, 0, 20, 100),
        rect(10, 20, 30, 60),
      ),
    ).toBe(true);
    expect(
      isPointInSafeHoverArea(
        [40, 50],
        [20, 50],
        rect(0, 0, 20, 100),
        rect(60, 20, 30, 60),
      ),
    ).toBe(true);
  });

  it('keeps top gap and diagonal intent safe', () => {
    const target = rect(40, 80, 20, 20);
    const popup = rect(0, 10, 100, 30);
    const leavePoint: [number, number] = [50, 80];

    expect(isPointInSafeHoverArea([50, 60], leavePoint, target, popup)).toBe(
      true,
    );
    expect(isPointInSafeHoverArea([25, 55], leavePoint, target, popup)).toBe(
      true,
    );
  });

  it('keeps horizontal diagonal intent safe', () => {
    expect(
      isPointInSafeHoverArea(
        [55, 25],
        [80, 50],
        rect(80, 40, 20, 20),
        rect(10, 0, 30, 100),
      ),
    ).toBe(true);
    expect(
      isPointInSafeHoverArea(
        [45, 25],
        [20, 50],
        rect(0, 40, 20, 20),
        rect(60, 0, 30, 100),
      ),
    ).toBe(true);
  });

  it('supports custom safe hover buffer', () => {
    expect(
      getSafeHoverAreaPolygons(
        [50, 20],
        rect(0, 0, 100, 20),
        rect(20, 60, 60, 30),
      ),
    ).toHaveLength(2);
    expect(
      getSafeHoverAreaPolygons(
        [50, 20],
        rect(0, 0, 100, 20),
        rect(20, 60, 60, 30),
        4,
      ),
    ).toHaveLength(2);
  });
});
