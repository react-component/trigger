function isPointsEq(a1, a2, isAlignPoint) {
  if (isAlignPoint) {
    return a1[0] === a2[0];
  }
  return a1[0] === a2[0] && a1[1] === a2[1];
}

export function getAlignFromPlacement(builtinPlacements, placementStr, align) {
  const baseAlign = builtinPlacements[placementStr] || {};
  return {
    ...baseAlign,
    ...align,
  };
}

export function getAlignPopupClassName(builtinPlacements, prefixCls, align, isAlignPoint) {
  const points = align.points;
  const placementList = Object.keys(builtinPlacements);

  const len = placementList.length;
  for (let i = 0; i < len; i += 1) {
    const placement = placementList[i];

    if (isPointsEq(builtinPlacements[placement].points, points, isAlignPoint)) {
      return `${prefixCls}-placement-${placement}`;
    }
  }

  return '';
}

export function saveRef(name, component) {
  this[name] = component;
}
