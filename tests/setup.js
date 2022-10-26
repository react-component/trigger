// jsdom add motion events to test CSSMotion
window.AnimationEvent = window.AnimationEvent || (() => {});
window.TransitionEvent = window.TransitionEvent || (() => {});
