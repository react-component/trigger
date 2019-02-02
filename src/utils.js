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
  for (const placement in builtinPlacements) {
    if (builtinPlacements.hasOwnProperty(placement)) {
      if (isPointsEq(builtinPlacements[placement].points, points, isAlignPoint)) {
        return `${prefixCls}-placement-${placement}`;
      }
    }
  }
  return '';
}

export function saveRef(name, component) {
  this[name] = component;
}

// TestUtils.Simulate.keyDown doesn't work on PhantomJS
// https://github.com/ariya/phantomjs/issues/11289#issuecomment-278147426
export function keyboardEvent(eventType, init) {
  try {
    return new KeyboardEvent(eventType, init);
  } catch (error) {
    const modKeys = [
      init.ctrlKey ? 'Control' : '',
      init.shiftKey ? 'Shift' : '',
      init.altKey ? 'Alt' : '',
      init.altGrKey ? 'AltGr' : '',
      init.metaKey ? 'Meta' : '',
    ].join(' ');
    const keyEvent = document.createEvent('KeyboardEvent');
    keyEvent.initKeyboardEvent(
      eventType, // type
      false, // canBubble
      false, // cancelable
      window, // view
      init.char || '', // char
      init.keyCode || 0, // key
      0, // location
      modKeys,
      init.repeat || false,
    );
    keyEvent.key = init.key;
    return keyEvent;
  }
}
