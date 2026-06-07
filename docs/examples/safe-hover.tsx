import Trigger, { type TriggerRef } from '@rc-component/trigger';
import React from 'react';
import {
  getSafeHoverAreaPolygons,
  type SafeHoverPoint,
} from '../../src/util/safeHover';
import '../../assets/index.less';

type SafeHoverPolygon = {
  points: SafeHoverPoint[];
  fill: string;
  stroke: string;
};

const safeHoverPolygonStyles = [
  {
    fill: 'rgba(255, 176, 32, 0.22)',
    stroke: 'rgba(222, 121, 0, 0.6)',
  },
  {
    fill: 'rgba(22, 119, 255, 0.16)',
    stroke: 'rgba(22, 119, 255, 0.55)',
  },
];

const builtinPlacements = {
  top: {
    points: ['bc', 'tc'],
    offset: [0, -56],
  },
};

const popupStyle: React.CSSProperties = {
  width: 240,
  padding: 12,
  background: '#fff',
  border: '1px solid #d9d9d9',
  boxShadow: '0 6px 16px rgba(0, 0, 0, 0.12)',
};

const SafeHoverDemo = () => {
  const triggerRef = React.useRef<TriggerRef>(null);

  const [safeHoverPolygons, setSafeHoverPolygons] = React.useState<
    SafeHoverPolygon[]
  >([]);

  const updateSafeHoverPolygons = (
    event: React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement>,
  ) => {
    const target = triggerRef.current?.nativeElement;
    const popup = triggerRef.current?.popupElement;

    if (!target || !popup) {
      setSafeHoverPolygons([]);
      return;
    }

    const leavePoint: SafeHoverPoint = [event.clientX, event.clientY];
    setSafeHoverPolygons(
      getSafeHoverAreaPolygons(
        leavePoint,
        target.getBoundingClientRect(),
        popup.getBoundingClientRect(),
      ).map((points, index) => ({
        points,
        ...safeHoverPolygonStyles[index],
      })),
    );
  };

  return (
    <div style={{ minHeight: 320, padding: '160px 80px 80px' }}>
      {safeHoverPolygons.length > 0 && (
        <svg
          aria-hidden
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            pointerEvents: 'none',
            zIndex: 999,
          }}
        >
          {safeHoverPolygons.map(({ points, fill, stroke }, index) => (
            <polygon
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              points={points.map((point) => point.join(',')).join(' ')}
              fill={fill}
              stroke={stroke}
              strokeDasharray="4 3"
              strokeWidth={1}
            />
          ))}
        </svg>
      )}
      <Trigger
        ref={triggerRef}
        action={['hover']}
        mouseLeaveDelay={0.12}
        popupPlacement="top"
        builtinPlacements={builtinPlacements}
        popupStyle={popupStyle}
        onOpenChange={(nextOpen) => {
          if (!nextOpen) {
            setSafeHoverPolygons([]);
          }
        }}
        popup={
          <div onMouseEnter={() => setSafeHoverPolygons([])}>
            <strong>Safe hover popup</strong>
            <div style={{ marginTop: 8 }}>
              Move through the gap to reach me.
            </div>
            <button style={{ marginTop: 12 }} type="button">
              Popup action
            </button>
          </div>
        }
      >
        <button
          style={{ padding: '8px 16px' }}
          type="button"
          onMouseLeave={updateSafeHoverPolygons}
          onPointerLeave={updateSafeHoverPolygons}
        >
          Hover target
        </button>
      </Trigger>

      <div
        style={{
          width: 240,
          marginTop: 16,
          color: '#666',
          fontSize: 13,
          lineHeight: 1.5,
        }}
      >
        The popup is offset upward, leaving a blank hover gap.
      </div>
    </div>
  );
};

export default SafeHoverDemo;
