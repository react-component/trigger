const Enzyme = require('enzyme');
const Adapter = require('enzyme-adapter-react-16');

Enzyme.configure({ adapter: new Adapter() });

Object.assign(Enzyme.ReactWrapper.prototype, {
  trigger() {
    this.find('Trigger > *')
      .first()
      .simulate('click');

    return this;
  },
  isHidden() {
    return this.find('PopupInner > div')
      .prop('className')
      .includes('-hidden');
  },
});
