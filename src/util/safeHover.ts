export type SafeHoverPoint = [x: number, y: number];

export type SafeHoverRect = Pick<
  DOMRect,
  'left' | 'right' | 'top' | 'bottom' | 'width' | 'height'
>;

export type SafeHoverSide = 'top' | 'bottom' | 'left' | 'right';

export const isPointInPolygon = (
  point: SafeHoverPoint,
  polygon: SafeHoverPoint[],
) => {
  const [x, y] = point;
  let isInside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect =
      yi >= y !== yj >= y && x <= ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) {
      isInside = !isInside;
    }
  }

  return isInside;
};

export const isPointInRect = (point: SafeHoverPoint, rect: SafeHoverRect) => {
  return (
    point[0] >= rect.left &&
    point[0] <= rect.right &&
    point[1] >= rect.top &&
    point[1] <= rect.bottom
  );
};

export const getSafeHoverSide = (
  targetRect: SafeHoverRect,
  popupRect: SafeHoverRect,
): SafeHoverSide | null => {
  const gaps: { side: SafeHoverSide; value: number }[] = [
    { side: 'top', value: targetRect.top - popupRect.bottom },
    { side: 'bottom', value: popupRect.top - targetRect.bottom },
    { side: 'left', value: targetRect.left - popupRect.right },
    { side: 'right', value: popupRect.left - targetRect.right },
  ];
  const largestGap = gaps.reduce((prev, next) =>
    next.value > prev.value ? next : prev,
  );
  return largestGap.value > 0 ? largestGap.side : null;
};

const isLeavePointTowardsPopup = (
  side: SafeHoverSide,
  leavePoint: SafeHoverPoint,
  targetRect: SafeHoverRect,
) => {
  const [x, y] = leavePoint;
  switch (side) {
    case 'top':
      return y <= targetRect.top + 1;
    case 'bottom':
      return y >= targetRect.bottom - 1;
    case 'left':
      return x <= targetRect.left + 1;
    case 'right':
      return x >= targetRect.right - 1;
  }
};

const getSafeHoverGapPolygon = (
  side: SafeHoverSide,
  targetRect: SafeHoverRect,
  popupRect: SafeHoverRect,
  buffer: number,
): SafeHoverPoint[] => {
  const verticalRect =
    popupRect.width > targetRect.width ? targetRect : popupRect;
  const horizontalRect =
    popupRect.height > targetRect.height ? targetRect : popupRect;
  const left = verticalRect.left - buffer;
  const right = verticalRect.right + buffer;
  const top = horizontalRect.top - buffer;
  const bottom = horizontalRect.bottom + buffer;
  switch (side) {
    case 'top':
      return [
        [left, popupRect.bottom - 1],
        [left, targetRect.top + 1],
        [right, targetRect.top + 1],
        [right, popupRect.bottom - 1],
      ];
    case 'bottom':
      return [
        [left, targetRect.bottom - 1],
        [left, popupRect.top + 1],
        [right, popupRect.top + 1],
        [right, targetRect.bottom - 1],
      ];
    case 'left':
      return [
        [popupRect.right - 1, top],
        [popupRect.right - 1, bottom],
        [targetRect.left + 1, bottom],
        [targetRect.left + 1, top],
      ];
    case 'right':
      return [
        [targetRect.right - 1, top],
        [targetRect.right - 1, bottom],
        [popupRect.left + 1, bottom],
        [popupRect.left + 1, top],
      ];
  }
};

const getSafeHoverIntentPolygon = (
  side: SafeHoverSide,
  leavePoint: SafeHoverPoint,
  popupRect: SafeHoverRect,
  buffer: number,
): SafeHoverPoint[] => {
  switch (side) {
    case 'top':
      return [
        leavePoint,
        [popupRect.left - buffer, popupRect.bottom + buffer],
        [popupRect.right + buffer, popupRect.bottom + buffer],
      ];
    case 'bottom':
      return [
        leavePoint,
        [popupRect.right + buffer, popupRect.top - buffer],
        [popupRect.left - buffer, popupRect.top - buffer],
      ];
    case 'left':
      return [
        leavePoint,
        [popupRect.right + buffer, popupRect.bottom + buffer],
        [popupRect.right + buffer, popupRect.top - buffer],
      ];
    case 'right':
      return [
        leavePoint,
        [popupRect.left - buffer, popupRect.top - buffer],
        [popupRect.left - buffer, popupRect.bottom + buffer],
      ];
  }
};

export const getSafeHoverAreaPolygons = (
  leavePoint: SafeHoverPoint,
  targetRect: SafeHoverRect,
  popupRect: SafeHoverRect,
  buffer = 0.5,
) => {
  const side = getSafeHoverSide(targetRect, popupRect);

  if (!side || !isLeavePointTowardsPopup(side, leavePoint, targetRect)) {
    return [];
  }
  return [
    getSafeHoverGapPolygon(side, targetRect, popupRect, buffer),
    getSafeHoverIntentPolygon(side, leavePoint, popupRect, buffer),
  ];
};

export const isPointInSafeHoverArea = (
  point: SafeHoverPoint,
  leavePoint: SafeHoverPoint,
  targetRect: SafeHoverRect,
  popupRect: SafeHoverRect,
  buffer = 0.5,
) => {
  const safeHoverPolygons = getSafeHoverAreaPolygons(
    leavePoint,
    targetRect,
    popupRect,
    buffer,
  );

  if (!safeHoverPolygons.length) {
    return false;
  }

  if (isPointInRect(point, targetRect) || isPointInRect(point, popupRect)) {
    return true;
  }

  // The gap polygon keeps the straight corridor open; the intent polygon
  // catches diagonal movement toward the popup edge.
  return safeHoverPolygons.some((polygon) => isPointInPolygon(point, polygon));
};
