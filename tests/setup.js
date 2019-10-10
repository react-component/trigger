const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

Enzyme.configure({ adapter: new Adapter() });

Object.assign(Enzyme.ReactWrapper.prototype, {
  refresh() {
    jest.runAllTimers();
    this.update();
    return this;
  },
  trigger(eventName = 'click') {
    this.find('Trigger > *')
      .first()
      .simulate(eventName);

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
