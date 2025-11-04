/**
 * WhiteboardPanel component
 * Interactive drawing canvas using Fabric.js
 * Supports free drawing, shapes, text, and eraser
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, PencilBrush, Rect, Circle, IText, Path } from 'fabric';
import './WhiteboardPanel.css';

interface WhiteboardPanelProps {
  chatId: string | null;
  width?: number;
  onClose?: () => void;
}

type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text' | 'select';

export const WhiteboardPanel = ({ 
  chatId,
  width = 400,
  onClose,
}: WhiteboardPanelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const activeToolRef = useRef<Tool>('pen'); // Ref to track active tool for eraser
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(3);
  const brushWidthRef = useRef(brushWidth); // Ref to track brush width for eraser

  // Initialize Fabric.js canvas (only once)
  useEffect(() => {
    if (!canvasRef.current || fabricCanvasRef.current) return;

    // Calculate canvas dimensions - full available space
    const whiteboardPanel = canvasRef.current.closest('.whiteboard-panel');
    if (!whiteboardPanel) return;
    
    const panelHeight = whiteboardPanel.clientHeight;
    const header = whiteboardPanel.querySelector('.whiteboard-header');
    const headerHeight = header ? header.clientHeight : 60;
    const availableHeight = panelHeight - headerHeight; // Full height minus header
    const availableWidth = width; // Full width
    
    // Canvas uses full available space
    const canvasWidth = availableWidth;
    const canvasHeight = availableHeight;

    const canvas = new Canvas(canvasRef.current, {
      isDrawingMode: true,
      width: canvasWidth,
      height: canvasHeight,
      backgroundColor: '#ffffff',
      enableRetinaScaling: true,
    });

    // Set initial brush properties
    canvas.freeDrawingBrush = new PencilBrush(canvas);
    canvas.freeDrawingBrush.color = brushColor;
    canvas.freeDrawingBrush.width = brushWidth;


    // Prevent objects from being moved beyond canvas borders
    canvas.on('object:moving', (e) => {
      const obj = e.target;
      if (!obj) return;
      
      const canvasWidth = canvas.width!;
      const canvasHeight = canvas.height!;
      const objWidth = obj.getScaledWidth();
      const objHeight = obj.getScaledHeight();
      
      // Get object coordinates
      let left = obj.left!;
      let top = obj.top!;
      
      // Clamp to canvas bounds
      left = Math.max(0, Math.min(left, canvasWidth - objWidth));
      top = Math.max(0, Math.min(top, canvasHeight - objHeight));
      
      obj.set({ left, top });
      obj.setCoords();
    });


    fabricCanvasRef.current = canvas;

    // Handle window resize
    const handleResize = () => {
      if (canvas && canvasRef.current) {
        const whiteboardPanel = canvasRef.current.closest('.whiteboard-panel');
        if (!whiteboardPanel) return;
        
        const panelHeight = whiteboardPanel.clientHeight;
        const header = whiteboardPanel.querySelector('.whiteboard-header');
        const headerHeight = header ? header.clientHeight : 60;
        const availableHeight = panelHeight - headerHeight;
        const availableWidth = width;
        
        // Canvas uses full available space
        if (Math.abs(canvas.width! - availableWidth) > 10 || Math.abs(canvas.height! - availableHeight) > 10) {
          canvas.setWidth(availableWidth);
          canvas.setHeight(availableHeight);
        }
        canvas.renderAll();
      }
    };

    // No zoom functionality - canvas uses full available space

    // Eraser functionality: remove objects on mouse move
    let isErasing = false;
    
    const handleEraserMouseDown = (e: fabric.IEvent<MouseEvent>) => {
      const pointer = canvas.getPointer(e.e);
      const eraserRadius = brushWidthRef.current * 2; // Dynamic eraser size
      const objectsToRemove: fabric.Object[] = [];
      
      // Check all objects to see if they intersect with eraser area
      canvas.getObjects().forEach((obj) => {
        const objBounds = obj.getBoundingRect();
        const centerX = objBounds.left + objBounds.width / 2;
        const centerY = objBounds.top + objBounds.height / 2;
        const distance = Math.sqrt(
          Math.pow(pointer.x - centerX, 2) +
          Math.pow(pointer.y - centerY, 2)
        );
        
        // If object center is within eraser radius, mark for removal
        if (distance < eraserRadius + Math.max(objBounds.width, objBounds.height) / 2) {
          objectsToRemove.push(obj);
        }
      });
      
      // Remove objects
      objectsToRemove.forEach((obj) => canvas.remove(obj));
      if (objectsToRemove.length > 0) {
        canvas.renderAll();
      }
    };
    
    const handleEraserMouseMove = (e: fabric.IEvent<MouseEvent>) => {
      if (!isErasing) return;
      
      const pointer = canvas.getPointer(e.e);
      const eraserRadius = brushWidthRef.current * 2; // Dynamic eraser size
      const objectsToRemove: fabric.Object[] = [];
      
      // Check all objects to see if they intersect with eraser area
      canvas.getObjects().forEach((obj) => {
        const objBounds = obj.getBoundingRect();
        const centerX = objBounds.left + objBounds.width / 2;
        const centerY = objBounds.top + objBounds.height / 2;
        const distance = Math.sqrt(
          Math.pow(pointer.x - centerX, 2) +
          Math.pow(pointer.y - centerY, 2)
        );
        
        // If object center is within eraser radius, mark for removal
        if (distance < eraserRadius + Math.max(objBounds.width, objBounds.height) / 2) {
          objectsToRemove.push(obj);
        }
      });
      
      // Remove objects
      objectsToRemove.forEach((obj) => canvas.remove(obj));
      if (objectsToRemove.length > 0) {
        canvas.renderAll();
      }
    };
    
    const handleEraserMouseUp = () => {
      isErasing = false;
    };
    
    // Store eraser handlers - check activeToolRef for current tool
    const eraserMouseDownHandler = (e: fabric.IEvent<MouseEvent>) => {
      if (activeToolRef.current === 'eraser') {
        isErasing = true;
        handleEraserMouseDown(e);
      }
    };
    
    const eraserMouseMoveHandler = (e: fabric.IEvent<MouseEvent>) => {
      if (activeToolRef.current === 'eraser' && isErasing) {
        handleEraserMouseMove(e);
      }
    };
    
    const eraserMouseUpHandler = () => {
      if (activeToolRef.current === 'eraser') {
        handleEraserMouseUp();
      }
    };
    
    canvas.on('mouse:down', eraserMouseDownHandler);
    canvas.on('mouse:move', eraserMouseMoveHandler);
    canvas.on('mouse:up', eraserMouseUpHandler);

    // Handle Backspace/Delete for deleting selected objects
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'Backspace' || e.key === 'Delete') && canvas) {
        const activeObjects = canvas.getActiveObjects();
        if (activeObjects.length > 0) {
          e.preventDefault();
          activeObjects.forEach((obj) => canvas.remove(obj));
          canvas.discardActiveObject();
          canvas.renderAll();
        }
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      if (fabricCanvasRef.current) {
        canvas.off('mouse:down', eraserMouseDownHandler);
        canvas.off('mouse:move', eraserMouseMoveHandler);
        canvas.off('mouse:up', eraserMouseUpHandler);
        fabricCanvasRef.current.dispose();
        fabricCanvasRef.current = null;
      }
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []); // Only run once on mount

  // Update brush when color or width changes (don't recreate canvas)
  useEffect(() => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    if (canvas.isDrawingMode && canvas.freeDrawingBrush) {
      // Only update brush properties, don't recreate
      canvas.freeDrawingBrush.color = brushColor;
      canvas.freeDrawingBrush.width = brushWidth;
    }
    brushWidthRef.current = brushWidth; // Update ref for eraser
  }, [brushColor, brushWidth]);

  // Update canvas size when width changes (but don't recreate)
  useEffect(() => {
    if (!fabricCanvasRef.current || !canvasRef.current) return;
    const canvas = fabricCanvasRef.current;
    const whiteboardPanel = canvasRef.current.closest('.whiteboard-panel');
    if (!whiteboardPanel) return;
    
        const panelHeight = whiteboardPanel.clientHeight;
        const header = whiteboardPanel.querySelector('.whiteboard-header');
        const headerHeight = header ? header.clientHeight : 60;
        const availableHeight = panelHeight - headerHeight;
        const availableWidth = width;
        
        // Canvas uses full available space
        if (Math.abs(canvas.width! - availableWidth) > 10 || Math.abs(canvas.height! - availableHeight) > 10) {
          canvas.setWidth(availableWidth);
          canvas.setHeight(availableHeight);
        }
    canvas.renderAll();
  }, [width]);

  const handleToolSelect = (tool: Tool) => {
    if (!fabricCanvasRef.current) return;

    const canvas = fabricCanvasRef.current;
    setActiveTool(tool);
    activeToolRef.current = tool; // Update ref immediately

    switch (tool) {
      case 'pen':
        canvas.isDrawingMode = true;
        canvas.selection = true;
        canvas.freeDrawingBrush = new PencilBrush(canvas);
        canvas.freeDrawingBrush.color = brushColor;
        canvas.freeDrawingBrush.width = brushWidth;
        break;

      case 'eraser':
        canvas.isDrawingMode = false;
        canvas.selection = false;
        // Eraser mode: remove objects on click/drag
        break;

      case 'select':
        canvas.isDrawingMode = false;
        canvas.selection = true;
        break;

      case 'rectangle': {
        canvas.isDrawingMode = false;
        canvas.selection = false;
        // Add rectangle at center of canvas
        const centerX = canvas.width! / 2;
        const centerY = canvas.height! / 2;
        const rect = new Rect({
          left: centerX - 50,
          top: centerY - 50,
          width: 100,
          height: 100,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: brushWidth,
        });
        canvas.add(rect);
        canvas.setActiveObject(rect);
        canvas.renderAll();
        setActiveTool('select');
        break;
      }

      case 'circle': {
        canvas.isDrawingMode = false;
        canvas.selection = false;
        // Add circle at center of canvas
        const centerX = canvas.width! / 2;
        const centerY = canvas.height! / 2;
        const circle = new Circle({
          left: centerX,
          top: centerY,
          radius: 50,
          fill: 'transparent',
          stroke: brushColor,
          strokeWidth: brushWidth,
          originX: 'center',
          originY: 'center',
        });
        canvas.add(circle);
        canvas.setActiveObject(circle);
        canvas.renderAll();
        setActiveTool('select');
        break;
      }

      case 'text': {
        canvas.isDrawingMode = false;
        canvas.selection = false;
        // Add text at center of canvas
        const centerX = canvas.width! / 2;
        const centerY = canvas.height! / 2;
        const text = new IText('Click to edit', {
          left: centerX,
          top: centerY,
          fontSize: 24,
          fill: brushColor,
          originX: 'center',
          originY: 'center',
        });
        canvas.add(text);
        canvas.setActiveObject(text);
        canvas.renderAll();
        setActiveTool('select');
        break;
      }
    }
  };

  const handleClearCanvas = () => {
    if (!fabricCanvasRef.current) return;
    if (confirm('Clear the entire canvas? This will remove all drawings.')) {
      fabricCanvasRef.current.clear();
      fabricCanvasRef.current.backgroundColor = '#ffffff';
      fabricCanvasRef.current.renderAll();
    }
  };





  return (
    <div className="whiteboard-panel">
      <div className="whiteboard-header">
        <div className="whiteboard-tools">
          <button
            className={`tool-btn ${activeTool === 'pen' ? 'active' : ''}`}
            onClick={() => handleToolSelect('pen')}
            title="Pen"
            aria-label="Pen tool"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 19l7-7 3 3-7 7-3-3z"/>
              <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/>
              <path d="M2 2l7.586 7.586"/>
              <circle cx="11" cy="11" r="2"/>
            </svg>
          </button>
          <button
            className={`tool-btn ${activeTool === 'eraser' ? 'active' : ''}`}
            onClick={() => handleToolSelect('eraser')}
            title="Eraser"
            aria-label="Eraser tool"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <path d="M9 9l6 6M15 9l-6 6"/>
            </svg>
          </button>
          <button
            className={`tool-btn ${activeTool === 'select' ? 'active' : ''}`}
            onClick={() => handleToolSelect('select')}
            title="Select"
            aria-label="Select tool"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z"/>
            </svg>
          </button>
          <button
            className="tool-btn"
            onClick={() => handleToolSelect('rectangle')}
            title="Rectangle"
            aria-label="Rectangle tool"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
            </svg>
          </button>
          <button
            className="tool-btn"
            onClick={() => handleToolSelect('circle')}
            title="Circle"
            aria-label="Circle tool"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
            </svg>
          </button>
          <button
            className="tool-btn"
            onClick={() => handleToolSelect('text')}
            title="Text"
            aria-label="Text tool"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 7 4 4 20 4 20 7"/>
              <line x1="9" y1="20" x2="15" y2="20"/>
              <line x1="12" y1="4" x2="12" y2="20"/>
            </svg>
          </button>
        </div>

        <div className="whiteboard-controls">
          <div className="color-picker-wrapper">
            <input
              id="brush-color"
              type="color"
              value={brushColor}
              onChange={(e) => setBrushColor(e.target.value)}
              title="Brush color"
              aria-label="Brush color"
            />
          </div>
          <div className="brush-width-wrapper">
            <input
              id="brush-width"
              type="range"
              min="1"
              max="20"
              value={brushWidth}
              onChange={(e) => setBrushWidth(Number(e.target.value))}
              title="Brush width"
              aria-label="Brush width"
            />
          </div>
          <button
            className="control-btn"
            onClick={handleClearCanvas}
            title="Clear Canvas"
            aria-label="Clear entire canvas"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 6h18"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
              <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="whiteboard-content">
        <div className="whiteboard-canvas-container">
          <canvas ref={canvasRef} id="whiteboard-canvas" />
        </div>
      </div>
    </div>
  );
};

