require('regenerator-runtime/runtime');

window.requestAnimationFrame = (func) => {
  window.setTimeout(func, 16);
};

// jsdom add motion events to test CSSMotion
window.AnimationEvent = window.AnimationEvent || (() => {});
window.TransitionEvent = window.TransitionEvent || (() => {});
