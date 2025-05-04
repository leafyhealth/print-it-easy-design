
import React from 'react';

interface CanvasGridProps {
  showGrid: boolean;
  width: number;
  height: number;
  zoomLevel: number;
  gridSize: number;
  showMargins?: boolean;
  marginSize?: number;
}

const CanvasGrid: React.FC<CanvasGridProps> = ({
  showGrid,
  width,
  height,
  zoomLevel,
  gridSize = 10,
  showMargins = false,
  marginSize = 15
}) => {
  if (!showGrid && !showMargins) return null;
  
  const scaledGridSize = gridSize * (zoomLevel / 100);
  const numHorizontalLines = Math.floor(height / gridSize);
  const numVerticalLines = Math.floor(width / gridSize);
  
  return (
    <>
      {/* Grid lines */}
      {showGrid && (
        <>
          {Array.from({ length: numHorizontalLines + 1 }).map((_, i) => (
            <div
              key={`h-grid-${i}`}
              className="absolute left-0 w-full border-t border-gray-200"
              style={{
                top: `${i * scaledGridSize}px`,
                borderTopWidth: '0.5px',
                pointerEvents: 'none'
              }}
            />
          ))}
          
          {Array.from({ length: numVerticalLines + 1 }).map((_, i) => (
            <div
              key={`v-grid-${i}`}
              className="absolute top-0 h-full border-l border-gray-200"
              style={{
                left: `${i * scaledGridSize}px`,
                borderLeftWidth: '0.5px',
                pointerEvents: 'none'
              }}
            />
          ))}
        </>
      )}

      {/* Margins */}
      {showMargins && (
        <div 
          className="absolute border-2 border-dashed border-blue-300 pointer-events-none"
          style={{
            top: `${marginSize * (zoomLevel / 100)}px`,
            left: `${marginSize * (zoomLevel / 100)}px`,
            width: `${(width - marginSize * 2) * (zoomLevel / 100)}px`,
            height: `${(height - marginSize * 2) * (zoomLevel / 100)}px`,
          }}
        />
      )}
    </>
  );
};

export default CanvasGrid;
