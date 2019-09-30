import Portal from 'rc-util/lib/Portal';
import Trigger from './index';

Portal.prototype.render = function portalRender() {
  return this.props.children;
};

const { render } = Trigger.prototype;

Trigger.prototype.render = function triggerRender() {
  const tree = render.call(this);

  if (this.state.popupVisible || this.cachedComponent) {
    return tree;
  }

  return tree[0];
};

export default Trigger;
