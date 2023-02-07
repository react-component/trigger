import { fillRef, useComposeRef } from 'rc-util/lib/ref';
import * as React from 'react';
import type { TriggerProps } from '.';

export interface TriggerWrapperProps {
  getTriggerDOMNode?: TriggerProps['getTriggerDOMNode'];
  children: React.ReactElement;
}

const TriggerWrapper = React.forwardRef<HTMLElement, TriggerWrapperProps>(
  (props, ref) => {
    const { children, getTriggerDOMNode } = props;

    // When use `getTriggerDOMNode`, we should do additional work to get the real dom
    const setRef = React.useCallback(
      (node) => {
        fillRef(ref, getTriggerDOMNode ? getTriggerDOMNode(node) : node);
      },
      [getTriggerDOMNode],
    );

    const mergedRef = useComposeRef(setRef, (children as any).ref);

    return React.cloneElement(children, {
      ref: mergedRef,
    });
  },
);

if (process.env.NODE_ENV !== 'production') {
  TriggerWrapper.displayName = 'TriggerWrapper';
}

export default TriggerWrapper;
