const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
require('regenerator-runtime/runtime');

window.requestAnimationFrame = func => {
  window.setTimeout(func, 16);
};

Enzyme.configure({ adapter: new Adapter() });

const popupInnerSelector = 'PopupInner div';

Object.assign(Enzyme.ReactWrapper.prototype, {
  refresh() {
    jest.runAllTimers();
    this.update();
    return this;
  },
  trigger(eventName = 'click', data = null) {
    this.find('Trigger > *')
      .first()
      .simulate(eventName, data);

    jest.runAllTimers();
    this.update();

    return this;
  },
  getPopupInner() {
    return this.find(popupInnerSelector).first();
  },
  isHidden(selector = popupInnerSelector) {
    return this.find(selector)
      .first()
      .prop('className')
      .includes('-hidden');
  },
});
