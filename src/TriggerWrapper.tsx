import {
  fillRef,
  getNodeRef,
  supportRef,
  useComposeRef,
} from '@rc-component/util/lib/ref';
import * as React from 'react';
import type { TriggerProps } from '.';

export interface TriggerWrapperProps {
  getTriggerDOMNode?: TriggerProps['getTriggerDOMNode'];
  children: React.ReactElement<any>;
}

const TriggerWrapper = React.forwardRef<HTMLElement, TriggerWrapperProps>(
  (props, ref) => {
    const { children, getTriggerDOMNode } = props;

    const canUseRef = supportRef(children);

    // When use `getTriggerDOMNode`, we should do additional work to get the real dom
    const setRef = React.useCallback(
      (node: React.ReactInstance) => {
        fillRef(ref, getTriggerDOMNode ? getTriggerDOMNode(node) : node);
      },
      [getTriggerDOMNode],
    );

    const mergedRef = useComposeRef<React.ReactInstance>(
      setRef,
      getNodeRef(children),
    );

    return canUseRef
      ? React.cloneElement<any>(children, { ref: mergedRef })
      : children;
  },
);

if (process.env.NODE_ENV !== 'production') {
  TriggerWrapper.displayName = 'TriggerWrapper';
}

export default TriggerWrapper;
