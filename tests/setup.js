const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');
require('regenerator-runtime/runtime');

window.requestAnimationFrame = func => {
  window.setTimeout(func, 16);
};

Enzyme.configure({ adapter: new Adapter() });

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
  isHidden(selector = 'PopupInner > div') {
    return this.find(selector)
      .prop('className')
      .includes('-hidden');
  },
});
