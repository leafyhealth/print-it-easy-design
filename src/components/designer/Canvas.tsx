
import React, { useState } from 'react';
import { cn } from '@/lib/utils';

interface CanvasProps {
  width?: number;
  height?: number;
  showGrid?: boolean;
}

const Canvas: React.FC<CanvasProps> = ({
  width = 600,
  height = 400,
  showGrid = true,
}) => {
  const [elements, setElements] = useState<any[]>([]);
  const [selectedElement, setSelectedElement] = useState<number | null>(null);

  return (
    <div className="relative overflow-auto h-full flex items-center justify-center bg-designer-canvas p-8">
      <div
        className={cn(
          "designer-canvas relative border border-gray-300",
          { "canvas-grid": showGrid }
        )}
        style={{
          width: `${width}px`,
          height: `${height}px`,
        }}
      >
        {/* Canvas content will go here */}
        <div className="absolute inset-0 p-4 text-center flex items-center justify-center text-gray-400">
          <p>Drag elements from the sidebar to start designing your label</p>
        </div>
      </div>
    </div>
  );
};

export default Canvas;
