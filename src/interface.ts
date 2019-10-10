export type AlignPoint =
  | 'tt'
  | 'tb'
  | 'tc'
  | 'tl'
  | 'tr'
  | 'bt'
  | 'bb'
  | 'bc'
  | 'bl'
  | 'br'
  | 'ct'
  | 'cb'
  | 'cc'
  | 'cl'
  | 'cr'
  | 'lt'
  | 'lb'
  | 'lc'
  | 'll'
  | 'lr'
  | 'rt'
  | 'rb'
  | 'rc'
  | 'rl'
  | 'rr';

export interface AlignType {
  /**
   * move point of source node to align with point of target node.
   * Such as ['tr','cc'], align top right point of source node with center point of target node.
   * Point can be 't'(top), 'b'(bottom), 'c'(center), 'l'(left), 'r'(right) */
  points?: AlignPoint[];
  /**
   * offset source node by offset[0] in x and offset[1] in y.
   * If offset contains percentage string value, it is relative to sourceNode region.
   */
  offset?: number[];
  /**
   * offset target node by offset[0] in x and offset[1] in y.
   * If targetOffset contains percentage string value, it is relative to targetNode region.
   */
  targetOffset?: number[];
  /**
   * If adjustX field is true, will adjust source node in x direction if source node is invisible.
   * If adjustY field is true, will adjust source node in y direction if source node is invisible.
   */
  overflow?: {
    adjustX?: boolean | number;
    adjustY?: boolean | number;
  };
  /**
   * Whether use css right instead of left to position
   */
  useCssRight?: boolean;
  /**
   * Whether use css bottom instead of top to position
   */
  useCssBottom?: boolean;
  /**
   * Whether use css transform instead of left/top/right/bottom to position if browser supports.
   * Defaults to false.
   */
  useCssTransform?: boolean;
}

export interface BuildInPlacements {
  [placement: string]: AlignType;
}

export type StretchType = string;

export type ActionType = string;

export type AnimationType = string;

export type TransitionNameType = string;

export interface Point {
  pageX: number;
  pageY: number;
}

export interface CommonEventHandler {
  remove: () => void;
}

// =================================== Motion ===================================
type MotionStatus = 'none' | 'appear' | 'enter' | 'leave';

type MotionActiveStatus = 'appear-active' | 'enter-active' | 'leave-active';

type MotionNameObject = {
  [key in MotionStatus | MotionActiveStatus]?: string;
};

type MotionEventHandler = (
  element: HTMLElement,
  event: React.TransitionEvent<HTMLElement> | React.AnimationEvent<HTMLElement> | undefined,
) => React.CSSProperties | false | null | undefined | void;

export interface MotionType {
  motionName?: string | MotionNameObject;
  motionAppear?: boolean;
  motionEnter?: boolean;
  motionLeave?: boolean;
  motionLeaveImmediately?: boolean; // Trigger leave motion immediately
  removeOnLeave?: boolean;
  leavedClassName?: string;
  onAppearStart?: MotionEventHandler;
  onAppearActive?: MotionEventHandler;
  onAppearEnd?: MotionEventHandler;
  onEnterStart?: MotionEventHandler;
  onEnterActive?: MotionEventHandler;
  onEnterEnd?: MotionEventHandler;
  onLeaveStart?: MotionEventHandler;
  onLeaveActive?: MotionEventHandler;
  onLeaveEnd?: MotionEventHandler;
}

export interface MotionProps extends MotionType {
  visible?: boolean;
  children: (
    props: { className: string; style: React.CSSProperties },
    ref: React.Ref<any>,
  ) => React.ReactElement;
}

export type CSSMotionClass = React.ComponentClass<MotionProps>;
