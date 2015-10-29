import React from 'react';
import ReactDOM from 'react-dom';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.less';
import assign from 'object-assign';

const placementAlignMap = {
  left: {
    points: ['cr', 'cl'],
  },
  right: {
    points: ['cl', 'cr'],
  },
  top: {
    points: ['bc', 'tc'],
  },
  bottom: {
    points: ['tc', 'bc'],
  },
  topLeft: {
    points: ['bl', 'tl'],
  },
  topRight: {
    points: ['br', 'tr'],
  },
  bottomRight: {
    points: ['tr', 'br'],
  },
  bottomLeft: {
    points: ['tl', 'bl'],
  },
};

function getPlacementFromAlign(align) {
  var points = align.points;
  for (var p in placementAlignMap) {
    var currentAlign = placementAlignMap[p];
    var currentPoints = currentAlign.points;
    if (currentPoints[0] === points[0] && currentPoints[1] === points[1]) {
      return p;
    }
  }
}

const Test = React.createClass({
  getInitialState() {
    return {
      placement: 'right',
      trigger: {
        hover: 1
      },
      offsetX: undefined,
      offsetY: undefined
    };
  },

  onPlacementChange(e) {
    this.setState({
      placement: e.target.value
    });
  },

  onTransitionChange(e) {
    this.setState({
      transitionName: e.target.checked ? e.target.value : ''
    });
  },

  onTriggerChange(e) {
    var trigger = assign({}, this.state.trigger);
    if (e.target.checked) {
      trigger[e.target.value] = 1;
    } else {
      delete trigger[e.target.value];
    }
    this.setState({
      trigger: trigger
    });
  },

  onOffsetXChange(e) {
    var targetValue = e.target.value;
    this.setState({
      offsetX: targetValue ? targetValue : undefined,
    });
  },

  onOffsetYChange(e) {
    var targetValue = e.target.value;
    this.setState({
      offsetY: targetValue ? targetValue : undefined,
    });
  },

  preventDefault(e) {
    e.preventDefault();
  },

  onVisibleChange(visible) {
    console.log('tooltip', visible);
  },

  getAlign(){
    var state = this.state;
    return assign({}, placementAlignMap[state.placement], {
      offset: [state.offsetX, state.offsetY],
      overflow: {
        adjustX: 1,
        adjustY: 1
      }
    });
  },

  render() {
    var trigger = this.state.trigger;
    return <div >
      <div style={{margin: '10px 20px'}}>
        <label>
          placement:
          <select value={this.state.placement} onChange={this.onPlacementChange}>
            <option>left</option>
            <option>right</option>
            <option>top</option>
            <option>bottom</option>
            <option>topLeft</option>
            <option>topRight</option>
            <option>bottomRight</option>
            <option>bottomLeft</option>
          </select>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          <input value='rc-trigger-popup-zoom' type='checkbox' onChange={this.onTransitionChange}
                 checked={this.state.transitionName === 'rc-trigger-popup-zoom'}/>
          transitionName
        </label>

        &nbsp;&nbsp;&nbsp;&nbsp;

        trigger:

        <label>
          <input value='hover' checked={trigger.hover} type='checkbox' onChange={this.onTriggerChange}/>
          hover
        </label>
        <label>
          <input value='focus' checked={trigger.focus} type='checkbox' onChange={this.onTriggerChange}/>
          focus
        </label>
        <label>
          <input value='click' checked={trigger.click} type='checkbox' onChange={this.onTriggerChange}/>
          click
        </label>
        <br/>
        <label>
          offsetX:
          <input type='text' onChange={this.onOffsetXChange} style={{width:50}}/>
        </label>
        &nbsp;&nbsp;&nbsp;&nbsp;
        <label>
          offsetY:
          <input type='text' onChange={this.onOffsetYChange} style={{width:50}}/>
        </label>
      </div>
      <div style={{margin: 100}}>
        <Trigger popupAlign={this.getAlign()}
                 mouseEnterDelay={0}
                 //destroyPopupOnHide={true}
                 mouseLeaveDelay={0.1}
                 action={Object.keys(this.state.trigger)}
                 getPopupClassNameFromAlign={getPlacementFromAlign}
                 popup={<div style={{border:'1px solid red',padding:10}}>i am a popup</div>}
                 popupTransitionName={this.state.transitionName}>
          <a href='#' style={{margin: 20}} onClick={this.preventDefault}>trigger</a>
        </Trigger>
      </div>
    </div>;
  }
});

ReactDOM.render(<div>
  <Test />
</div>, document.getElementById("__react-content"));
