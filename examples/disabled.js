import React from 'react'
import ReactDOM from 'react-dom'
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.less';
import './disabled.less'
import { builtinPlacements } from './simple'

class Test extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            disabled: false
        }
        this.handleDisabledChanged = this.handleDisabledChanged.bind(this)
    }

    handleDisabledChanged(event) {
        this.setState({ disabled: event.target.checked })
    }
   
    render() {
        const { disabled } = this.state
        return (
            <div className="container">
                <div className="disabledWrapper">
                    <input onChange={this.handleDisabledChanged} type="checkbox"/>
                    <label> Disabled </label>
                </div>
                <div className="examples">
                    <div className="trigger-example">
                        <Trigger
                            onPopupVisibleChange={() => console.log('Click popup visible changed')}
                            popupPlacement={'bottom'}
                            builtinPlacements={builtinPlacements}
                            action={['click']}
                            disabled={disabled}
                            popup={
                                <div>I'm a popup</div>
                            }
                        >
                            <label>Click me {disabled && '(I\'m disabled)'}</label>
                        </Trigger>
                    </div>
                    <div className="trigger-example">
                        <Trigger
                            onPopupVisibleChange={() => console.log('Hover popup visible changed')}
                            popupPlacement={'bottom'}
                            builtinPlacements={builtinPlacements}
                            action={['hover']}
                            disabled={disabled}
                            popup={
                                <div>
                                    I'm a popup
                                </div>
                            }
                        >
                            <label> Hover me {disabled && '(I\'m disabled)'} </label>
                        </Trigger>
                    </div>
                    <div className="trigger-example">
                        <Trigger
                            onPopupVisibleChange={() => console.log('Hover popup visible changed')}
                            popupPlacement={'contextMenu'}
                            builtinPlacements={builtinPlacements}
                            action={['hover']}
                            disabled={disabled}
                            popupAlign={{
                                points: ['tl', 'bl'],
                                offset: [0, 3]
                              }}
                            popup={
                                <div>
                                    I'm a popup
                                </div>
                            }
                        >
                            <label> Context Menu {disabled && '(I\'m disabled)'} </label>
                        </Trigger>
                    </div>
                    <Trigger
                            onPopupVisibleChange={() => console.log('Focus popup visible changed')}
                            popupPlacement={'bottom'}
                            builtinPlacements={builtinPlacements}
                            action={['focus']}
                            disabled={disabled}
                            popup={
                                <div>
                                    I'm a popup
                                </div>
                            }
                        >
                        <input placeholder={`Focus me ${disabled ? '(I\'m disabled)': ''}`} />
                    </Trigger>
                </div>
            </div>
        )
    }
}

ReactDOM.render(<Test />, document.getElementById('__react-content'));
