import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { DesignElement } from '@/types/designer';
import QRCode from 'qrcode';

interface CanvasElementProps {
  element: any; // Using any temporarily for compatibility
  zoomLevel: number;
  isSelected: boolean;
  onElementClick: (elementId: string, e: React.MouseEvent) => void;
  onElementDoubleClick: (elementId: string, elementType: string, e: React.MouseEvent) => void;
  onDragStart: (e: React.MouseEvent, elementId: string) => void;
  onResizeStart: (e: React.MouseEvent, elementId: string, direction: string) => void;
}

const CanvasElement: React.FC<CanvasElementProps> = ({
  element,
  zoomLevel,
  isSelected,
  onElementClick,
  onElementDoubleClick,
  onDragStart,
  onResizeStart
}) => {
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const elementPosition = element.position;
  const elementSize = element.size;
  const elementProperties = element.properties;
  
  const elementStyle: React.CSSProperties = {
    position: 'absolute',
    left: `${elementPosition.x * (zoomLevel / 100)}px`,
    top: `${elementPosition.y * (zoomLevel / 100)}px`,
    width: `${elementSize.width * (zoomLevel / 100)}px`,
    height: `${elementSize.height * (zoomLevel / 100)}px`,
    transform: element.rotation ? `rotate(${element.rotation}deg)` : undefined,
    cursor: 'move',
    zIndex: element.layer || 0,
    border: isSelected ? '1px solid #0284c7' : 'none'
  };
  
  useEffect(() => {
    if (element.type === 'barcode' && 
        element.properties.barcodeType === 'qrcode' && 
        element.properties.content && 
        qrCanvasRef.current) {
      
      const options = {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: element.size.width * (zoomLevel / 100),
        color: {
          dark: element.properties.foregroundColor || '#000000',
          light: element.properties.backgroundColor || '#FFFFFF'
        }
      };

      QRCode.toCanvas(
        qrCanvasRef.current,
        element.properties.content,
        options,
        (error) => {
          if (error) console.error('Error generating QR code:', error);
        }
      );
    }
  }, [element, zoomLevel]);

  return (
    <div
      key={element.id}
      style={elementStyle}
      onClick={(e) => onElementClick(element.id, e)}
      onMouseDown={(e) => onDragStart(e, element.id)}
      onDoubleClick={(e) => onElementDoubleClick(element.id, element.type, e)}
      className={cn(
        "select-none overflow-hidden",
        isSelected ? 'ring-2 ring-blue-500 ring-opacity-50' : ''
      )}
    >
      {element.type === 'text' && (
        <div 
          style={{
            fontFamily: elementProperties.fontFamily,
            fontSize: `${elementProperties.fontSize * (zoomLevel / 100)}px`,
            fontWeight: elementProperties.fontWeight,
            fontStyle: elementProperties.fontStyle,
            textAlign: elementProperties.textAlign,
            textDecoration: elementProperties.textDecoration,
            color: elementProperties.color,
            width: '100%',
            height: '100%',
            padding: '4px',
            overflow: 'hidden'
          }}
        >
          {elementProperties.content}
        </div>
      )}
      
      {element.type === 'image' && (
        <img
          src={elementProperties.src}
          alt={element.name}
          style={{
            width: '100%',
            height: '100%',
            objectFit: elementProperties.objectFit || 'contain'
          }}
        />
      )}
      
      {element.type === 'barcode' && (
        <div className="w-full h-full flex items-center justify-center">
          {element.properties.barcodeType === 'qrcode' ? (
            <div className="w-full h-full flex items-center justify-center">
              <canvas
                ref={qrCanvasRef}
                className="max-w-full max-h-full"
              />
            </div>
          ) : (
            <div 
              className="barcode-placeholder bg-gradient-to-r from-black via-white to-black"
              style={{width: '100%', height: '50%'}}
              title={element.properties.content}
            />
          )}
          {element.properties.showText && element.properties.barcodeType !== 'qrcode' && (
            <div className="absolute bottom-0 text-center w-full text-xs">
              {element.properties.content}
            </div>
          )}
        </div>
      )}
      
      {isSelected && renderResizeHandles(element.id, onResizeStart)}
    </div>
  );
};

const renderResizeHandles = (
  elementId: string, 
  onResizeStart: (e: React.MouseEvent, elementId: string, direction: string) => void
) => {
  const directions = ['n', 'ne', 'e', 'se', 's', 'sw', 'w', 'nw'];
  
  return directions.map(dir => {
    const handleStyle: React.CSSProperties = {
      position: 'absolute',
      width: '8px',
      height: '8px',
      backgroundColor: 'white',
      border: '1px solid #0284c7',
      cursor: `${dir}-resize`
    };
    
    switch (dir) {
      case 'n': 
        handleStyle.top = '-4px';
        handleStyle.left = 'calc(50% - 4px)';
        break;
      case 'ne':
        handleStyle.top = '-4px';
        handleStyle.right = '-4px';
        break;
      case 'e':
        handleStyle.top = 'calc(50% - 4px)';
        handleStyle.right = '-4px';
        break;
      case 'se':
        handleStyle.bottom = '-4px';
        handleStyle.right = '-4px';
        break;
      case 's':
        handleStyle.bottom = '-4px';
        handleStyle.left = 'calc(50% - 4px)';
        break;
      case 'sw':
        handleStyle.bottom = '-4px';
        handleStyle.left = '-4px';
        break;
      case 'w':
        handleStyle.top = 'calc(50% - 4px)';
        handleStyle.left = '-4px';
        break;
      case 'nw':
        handleStyle.top = '-4px';
        handleStyle.left = '-4px';
        break;
    }
    
    return (
      <div
        key={`${elementId}-${dir}`}
        style={handleStyle}
        onMouseDown={(e) => onResizeStart(e, elementId, dir)}
      />
    );
  });
};

export default CanvasElement;
