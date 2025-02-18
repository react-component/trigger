// jsdom add motion events to test CSSMotion
window.AnimationEvent = window.AnimationEvent || (() => {});
window.TransitionEvent = window.TransitionEvent || (() => {});
global.ResizeObserver = jest.fn(() => {
    return {
        observe() { },
        unobserve() { },
        disconnect() { },
    };
});