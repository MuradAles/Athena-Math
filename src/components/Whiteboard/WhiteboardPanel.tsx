/**
 * WhiteboardPanel component
 * Interactive drawing canvas using Fabric.js
 * Supports free drawing, shapes, text, and eraser
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { Canvas, PencilBrush, Rect, Circle, IText, Path } from 'fabric';
import { useAuthContext } from '../../contexts/AuthContext';
import { useImageUpload } from '../../hooks/useImageUpload';
import './WhiteboardPanel.css';

interface WhiteboardPanelProps {
  chatId: string | null;
  width?: number;
  onClose?: () => void;
  onSendCanvas?: (imageUrl: string, message?: string) => void;
}

type Tool = 'pen' | 'eraser' | 'rectangle' | 'circle' | 'text' | 'select';

export const WhiteboardPanel = ({ 
  chatId,
  width = 400,
  onClose,
  onSendCanvas,
}: WhiteboardPanelProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fabricCanvasRef = useRef<Canvas | null>(null);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const activeToolRef = useRef<Tool>('pen'); // Ref to track active tool for eraser
  const [brushColor, setBrushColor] = useState('#000000');
  const [brushWidth, setBrushWidth] = useState(3);
  const brushWidthRef = useRef(brushWidth); // Ref to track brush width for eraser
  const [eraserPreview, setEraserPreview] = useState<{ x: number; y: number } | null>(null);
  const eraserPreviewCircleRef = useRef<Circle | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backgroundImageRef = useRef<any>(null); // Fabric.js Image object
  const { user } = useAuthContext();
  const { uploadImage, isUploading: isUploadingCanvas } = useImageUpload();

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
    
    // Calculate eraser radius
    const getEraserRadius = () => brushWidthRef.current * 2;
    
    // Show eraser preview circle
    const showEraserPreview = (pointer: { x: number; y: number }) => {
      if (!canvas) return;
      const eraserRadius = getEraserRadius();
      
      // Remove existing preview if any
      if (eraserPreviewCircleRef.current) {
        canvas.remove(eraserPreviewCircleRef.current);
      }
      
      // Create preview circle
      const previewCircle = new Circle({
        left: pointer.x,
        top: pointer.y,
        radius: eraserRadius,
        fill: 'rgba(255, 0, 0, 0.1)',
        stroke: 'rgba(255, 0, 0, 0.5)',
        strokeWidth: 2,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
        excludeFromExport: true,
      });
      
      canvas.add(previewCircle);
      canvas.renderAll();
      eraserPreviewCircleRef.current = previewCircle;
    };
    
    // Hide eraser preview circle
    const hideEraserPreview = () => {
      if (!canvas) return;
      if (eraserPreviewCircleRef.current) {
        canvas.remove(eraserPreviewCircleRef.current);
        canvas.renderAll();
        eraserPreviewCircleRef.current = null;
      }
    };
    
    const handleEraserMouseDown = (e: fabric.IEvent<MouseEvent>) => {
      const pointer = canvas.getPointer(e.e);
      const eraserRadius = getEraserRadius();
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
      const pointer = canvas.getPointer(e.e);
      
      // Show preview when hovering (not erasing)
      if (!isErasing && activeToolRef.current === 'eraser') {
        showEraserPreview(pointer);
        setEraserPreview({ x: pointer.x, y: pointer.y });
      }
      
      if (!isErasing) return;
      
      const eraserRadius = getEraserRadius();
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
      // Preview will be shown again on next mouse move
    };
    
    // Store eraser handlers - check activeToolRef for current tool
    const eraserMouseDownHandler = (e: fabric.IEvent<MouseEvent>) => {
      if (activeToolRef.current === 'eraser') {
        hideEraserPreview(); // Hide preview when starting to erase
        isErasing = true;
        handleEraserMouseDown(e);
      }
    };
    
    const eraserMouseMoveHandler = (e: fabric.IEvent<MouseEvent>) => {
      if (activeToolRef.current === 'eraser') {
        handleEraserMouseMove(e);
      }
    };
    
    const eraserMouseUpHandler = () => {
      if (activeToolRef.current === 'eraser') {
        handleEraserMouseUp();
      }
    };
    
    // Handle mouse leave to hide preview
    const eraserMouseOutHandler = () => {
      if (activeToolRef.current === 'eraser') {
        hideEraserPreview();
        setEraserPreview(null);
      }
    };
    
    canvas.on('mouse:down', eraserMouseDownHandler);
    canvas.on('mouse:move', eraserMouseMoveHandler);
    canvas.on('mouse:up', eraserMouseUpHandler);
    canvas.on('mouse:out', eraserMouseOutHandler);

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
        canvas.off('mouse:out', eraserMouseOutHandler);
        hideEraserPreview();
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
    
    // Update eraser preview circle if it exists and eraser is active
    if (activeTool === 'eraser' && eraserPreviewCircleRef.current) {
      const eraserRadius = brushWidth * 2;
      eraserPreviewCircleRef.current.set({ radius: eraserRadius });
      canvas.renderAll();
    }
  }, [brushColor, brushWidth, activeTool]);

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
    
    // Hide eraser preview when switching away from eraser
    if (tool !== 'eraser' && eraserPreviewCircleRef.current) {
      canvas.remove(eraserPreviewCircleRef.current);
      canvas.renderAll();
      eraserPreviewCircleRef.current = null;
    }
    
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
        // Hide preview when switching to eraser (will show on mouse move)
        if (eraserPreviewCircleRef.current) {
          canvas.remove(eraserPreviewCircleRef.current);
          canvas.renderAll();
          eraserPreviewCircleRef.current = null;
        }
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
      backgroundImageRef.current = null;
      fabricCanvasRef.current.renderAll();
    }
  };

  // Handle image upload to whiteboard
  const handleImageUpload = useCallback(async (file: File) => {
    if (!fabricCanvasRef.current || !user) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Image size must be less than 5MB');
      return;
    }

    try {
      // Create image from file
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageUrl = e.target?.result as string;
        
        // Use Fabric.js Image.fromURL to load image
        const { Image } = await import('fabric');
        Image.fromURL(imageUrl, (img) => {
          if (!fabricCanvasRef.current) return;

          // Remove existing background image if any
          if (backgroundImageRef.current) {
            fabricCanvasRef.current.remove(backgroundImageRef.current);
          }

          // Resize canvas to image dimensions
          const imgWidth = img.width || 800;
          const imgHeight = img.height || 600;
          
          // Keep aspect ratio but fit within available space
          const maxWidth = width;
          const maxHeight = fabricCanvasRef.current.height || 600;
          const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight, 1);
          
          const scaledWidth = imgWidth * scale;
          const scaledHeight = imgHeight * scale;

          // Set canvas size
          fabricCanvasRef.current.setWidth(scaledWidth);
          fabricCanvasRef.current.setHeight(scaledHeight);

          // Scale and position image
          img.scale(scale);
          img.set({
            left: 0,
            top: 0,
            selectable: false,
            evented: false,
            excludeFromExport: false,
          });

          // Add image to canvas (send to back)
          fabricCanvasRef.current.add(img);
          fabricCanvasRef.current.sendToBack(img);
          backgroundImageRef.current = img;
          
          fabricCanvasRef.current.renderAll();
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error loading image:', error);
      alert('Failed to load image');
    }
  }, [user, width]);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageUpload(file);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Export canvas as image and send to chat
  const handleSendCanvasToAI = useCallback(async () => {
    if (!fabricCanvasRef.current || !user || !onSendCanvas) return;

    try {
      // Export canvas as data URL (PNG)
      const dataURL = fabricCanvasRef.current.toDataURL({
        format: 'png',
        quality: 0.9,
        multiplier: 1,
      });

      // Convert data URL to blob
      const response = await fetch(dataURL);
      const blob = await response.blob();
      
      // Create File object from blob
      const file = new File([blob], 'whiteboard-canvas.png', { type: 'image/png' });

      // Upload to Firebase Storage
      const imageUrl = await uploadImage(file, user.uid);

      // Send to chat
      onSendCanvas(imageUrl, 'Here is my whiteboard:');
    } catch (error) {
      console.error('Error sending canvas to AI:', error);
      alert('Failed to send canvas. Please try again.');
    }
  }, [user, onSendCanvas, uploadImage]);





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
              title={activeTool === 'eraser' ? `Eraser radius: ${brushWidth * 2}px` : `Brush width: ${brushWidth}px`}
              aria-label={activeTool === 'eraser' ? `Eraser radius: ${brushWidth * 2}px` : `Brush width: ${brushWidth}px`}
            />
            {activeTool === 'eraser' && (
              <span className="eraser-radius-label" title={`Eraser radius: ${brushWidth * 2}px`}>
                R: {brushWidth * 2}px
              </span>
            )}
            {activeTool !== 'eraser' && (
              <span title={`Brush width: ${brushWidth}px`}>
                {brushWidth}px
              </span>
            )}
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
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            style={{ display: 'none' }}
          />
          <button
            className="control-btn"
            onClick={handleImageUploadClick}
            title="Upload Image"
            aria-label="Upload image to whiteboard"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </button>
          {onSendCanvas && (
            <button
              className="control-btn export-btn"
              onClick={handleSendCanvasToAI}
              disabled={isUploadingCanvas}
              title="Send Canvas to AI"
              aria-label="Send canvas snapshot to AI"
            >
              {isUploadingCanvas ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              )}
            </button>
          )}
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

