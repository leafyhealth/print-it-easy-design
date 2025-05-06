
import React from 'react';
import { GridSettings } from '@/types/designer';

interface CanvasGridProps {
  showGrid: boolean;
  width: number;
  height: number;
  zoomLevel: number;
  gridSize?: number;
  showMargins?: boolean;
  marginSize?: number;
  showLabelGrid?: boolean;
  gridSettings?: GridSettings | null;
}

const CanvasGrid: React.FC<CanvasGridProps> = ({
  showGrid,
  width,
  height,
  zoomLevel,
  gridSize = 10,
  showMargins = false,
  marginSize = 15,
  showLabelGrid = false,
  gridSettings = null
}) => {
  if (!showGrid && !showMargins && !showLabelGrid) {
    return null;
  }

  const scaledGridSize = gridSize * (zoomLevel / 100);
  const gridCountWidth = Math.ceil(width / gridSize);
  const gridCountHeight = Math.ceil(height / gridSize);

  const gridElements = [];

  // Draw grid lines
  if (showGrid) {
    // Vertical lines
    for (let i = 1; i < gridCountWidth; i++) {
      gridElements.push(
        <line
          key={`vline-${i}`}
          x1={i * scaledGridSize}
          y1={0}
          x2={i * scaledGridSize}
          y2={height * (zoomLevel / 100)}
          stroke="#CCCCCC"
          strokeWidth={0.5}
          strokeDasharray="2,2"
        />
      );
    }

    // Horizontal lines
    for (let i = 1; i < gridCountHeight; i++) {
      gridElements.push(
        <line
          key={`hline-${i}`}
          x1={0}
          y1={i * scaledGridSize}
          x2={width * (zoomLevel / 100)}
          y2={i * scaledGridSize}
          stroke="#CCCCCC"
          strokeWidth={0.5}
          strokeDasharray="2,2"
        />
      );
    }
  }

  // Draw margins
  if (showMargins) {
    const marginOffset = marginSize * (zoomLevel / 100);
    
    gridElements.push(
      <rect
        key="margin"
        x={marginOffset}
        y={marginOffset}
        width={(width - 2 * marginSize) * (zoomLevel / 100)}
        height={(height - 2 * marginSize) * (zoomLevel / 100)}
        fill="none"
        stroke="#E16262"
        strokeWidth={0.75}
        strokeDasharray="5,3"
      />
    );
  }

  // Draw label grid (for multi-label templates)
  if (showLabelGrid && gridSettings && gridSettings.labelLayout === 'grid' && 
      gridSettings.columns && gridSettings.rows && 
      gridSettings.labelWidth && gridSettings.labelHeight) {
    
    const { columns, rows, horizontalGap = 0, verticalGap = 0, labelWidth, labelHeight, cornerRadius = 0 } = gridSettings;
    
    // Calculate label positions
    const marginPercent = 0.05; // 5% margin around the edges
    const marginLeft = width * marginPercent * (zoomLevel / 100);
    const marginTop = height * marginPercent * (zoomLevel / 100);
    
    const availableWidth = (width * (1 - 2 * marginPercent)) * (zoomLevel / 100);
    const availableHeight = (height * (1 - 2 * marginPercent)) * (zoomLevel / 100);
    
    const scaledLabelWidth = labelWidth * (zoomLevel / 100);
    const scaledLabelHeight = labelHeight * (zoomLevel / 100);
    const scaledHorizontalGap = horizontalGap * (zoomLevel / 100);
    const scaledVerticalGap = verticalGap * (zoomLevel / 100);
    
    // Add multi-label grid
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < columns; col++) {
        // Calculate position for each label
        const x = marginLeft + col * (scaledLabelWidth + scaledHorizontalGap);
        const y = marginTop + row * (scaledLabelHeight + scaledVerticalGap);
        
        // Highlight the first label differently (this is the one being designed)
        const isFirstLabel = row === 0 && col === 0;
        
        gridElements.push(
          <rect
            key={`label-${row}-${col}`}
            x={x}
            y={y}
            width={scaledLabelWidth}
            height={scaledLabelHeight}
            rx={cornerRadius * (zoomLevel / 100)}
            ry={cornerRadius * (zoomLevel / 100)}
            fill={isFirstLabel ? "rgba(230, 244, 255, 0.2)" : "rgba(245, 245, 245, 0.2)"}
            stroke={isFirstLabel ? "#3B82F6" : "#CCCCCC"}
            strokeWidth={isFirstLabel ? 1.5 : 0.75}
            strokeDasharray={isFirstLabel ? "" : "4,2"}
          />
        );
        
        // Add label indicator (only for non-first labels)
        if (!isFirstLabel) {
          gridElements.push(
            <text
              key={`label-text-${row}-${col}`}
              x={x + scaledLabelWidth / 2}
              y={y + scaledLabelHeight / 2}
              fontSize={10 * (zoomLevel / 100)}
              fill="#888888"
              textAnchor="middle"
              dominantBaseline="middle"
            >
              Copy
            </text>
          );
        }
      }
    }
  }

  return (
    <svg className="absolute inset-0 pointer-events-none z-0" width="100%" height="100%">
      {gridElements}
    </svg>
  );
};

export default CanvasGrid;
