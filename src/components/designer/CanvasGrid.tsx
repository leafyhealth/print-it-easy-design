
import React from 'react';

interface CanvasGridProps {
  showGrid: boolean;
  width: number;
  height: number;
  zoomLevel: number;
  gridSize: number;
}

const CanvasGrid: React.FC<CanvasGridProps> = ({
  showGrid,
  width,
  height,
  zoomLevel,
  gridSize = 10
}) => {
  if (!showGrid) return null;
  
  const scaledGridSize = gridSize * (zoomLevel / 100);
  const numHorizontalLines = Math.floor(height / gridSize);
  const numVerticalLines = Math.floor(width / gridSize);
  
  return (
    <>
      {Array.from({ length: numHorizontalLines + 1 }).map((_, i) => (
        <div
          key={`h-grid-${i}`}
          className="absolute left-0 w-full border-t border-gray-200"
          style={{
            top: `${i * scaledGridSize}px`,
            borderTopWidth: '0.5px'
          }}
        />
      ))}
      
      {Array.from({ length: numVerticalLines + 1 }).map((_, i) => (
        <div
          key={`v-grid-${i}`}
          className="absolute top-0 h-full border-l border-gray-200"
          style={{
            left: `${i * scaledGridSize}px`,
            borderLeftWidth: '0.5px'
          }}
        />
      ))}
    </>
  );
};

export default CanvasGrid;
