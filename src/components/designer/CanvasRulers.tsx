
import React from 'react';
import { cn } from '@/lib/utils';

interface CanvasRulersProps {
  showRulers: boolean;
  width: number;
  height: number;
  zoomLevel: number;
}

const CanvasRulers: React.FC<CanvasRulersProps> = ({
  showRulers,
  width,
  height,
  zoomLevel
}) => {
  if (!showRulers) return null;
  
  return (
    <>
      {renderHorizontalRuler(width, zoomLevel)}
      {renderVerticalRuler(height, zoomLevel)}
    </>
  );
};

const renderHorizontalRuler = (width: number, zoomLevel: number) => {
  const rulerHeight = 20;
  const scaledWidth = width * (zoomLevel / 100);
  const majorTick = 10;
  const minorTick = 5;
  const numTicks = Math.floor(width / minorTick);
  
  return (
    <div 
      className="absolute left-0 top-0 bg-gray-100 border-b border-r border-gray-300"
      style={{
        height: `${rulerHeight}px`,
        width: `${scaledWidth}px`,
        overflow: 'hidden',
        zIndex: 10
      }}
    >
      {Array.from({ length: numTicks }).map((_, i) => (
        <div
          key={`h-tick-${i}`}
          className={cn(
            "absolute top-0 h-full border-l border-gray-300",
            i % 2 === 0 ? "h-1/2" : "h-1/4"
          )}
          style={{
            left: `${(i * minorTick * (zoomLevel / 100))}px`,
            borderLeftWidth: i % (majorTick / minorTick) === 0 ? '1px' : '0.5px'
          }}
        >
          {i % (majorTick / minorTick) === 0 && (
            <span 
              className="absolute top-0 left-1 text-xs text-gray-600"
              style={{ fontSize: '8px' }}
            >
              {i * minorTick}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

const renderVerticalRuler = (height: number, zoomLevel: number) => {
  const rulerWidth = 20;
  const scaledHeight = height * (zoomLevel / 100);
  const majorTick = 10;
  const minorTick = 5;
  const numTicks = Math.floor(height / minorTick);
  
  return (
    <div 
      className="absolute left-0 top-0 bg-gray-100 border-r border-b border-gray-300"
      style={{
        width: `${rulerWidth}px`,
        height: `${scaledHeight}px`,
        overflow: 'hidden',
        zIndex: 10
      }}
    >
      {Array.from({ length: numTicks }).map((_, i) => (
        <div
          key={`v-tick-${i}`}
          className={cn(
            "absolute left-0 w-full border-t border-gray-300",
            i % 2 === 0 ? "w-1/2" : "w-1/4"
          )}
          style={{
            top: `${(i * minorTick * (zoomLevel / 100))}px`,
            borderTopWidth: i % (majorTick / minorTick) === 0 ? '1px' : '0.5px'
          }}
        >
          {i % (majorTick / minorTick) === 0 && (
            <span 
              className="absolute top-0 left-1 text-xs text-gray-600"
              style={{ fontSize: '8px' }}
            >
              {i * minorTick}
            </span>
          )}
        </div>
      ))}
    </div>
  );
};

export default CanvasRulers;
