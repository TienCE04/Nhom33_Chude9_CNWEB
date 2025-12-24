import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { Brush, Eraser, Trash2, Lightbulb } from "lucide-react";
import { GameButton } from "./GameButton";
import { socket } from "@/lib/socket";
import { useTranslation } from "react-i18next";

const COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
];

export const CanvasBoard = ({ canDraw = true, keyword }) => {
  const { t } = useTranslation();
  const BRUSH_SIZES = [
    { size: 3, label: t('canvas.brushSizeSmall') },
    { size: 8, label: t('canvas.brushSizeMedium') },
    { size: 16, label: t('canvas.brushSizeLarge') },
  ];

  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(8);
  const [tool, setTool] = useState("brush");
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [hintLevel, setHintLevel] = useState(0);

  useEffect(() => {
    setHintLevel(0);
  }, [keyword]);

  const handleRequestHint = () => {
    if (hintLevel >= 3) return;
    const newLevel = hintLevel + 1;
    setHintLevel(newLevel);
    
    const roomId = window.location.pathname.split("/").pop();
    socket.emit("requestHint", { room_id: roomId, hintLevel: newLevel });
  };

  const containerRef = useRef(null); // Ref để đo kích thước phần tử cha

  const [canvasWidth, setCanvasWidth] = useState(0);
  const [canvasHeight, setCanvasHeight] = useState(0);

  console.log("CanvasBoard render - canDraw:", canDraw, "keyword:", keyword);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }

    const handleUpdateCanvas = (data) => {
      const image = new Image();
      image.onload = () => {
        const ctx = canvasRef.current?.getContext("2d");
        if (ctx) {
          ctx.drawImage(image, 0, 0);
        }
      };
      image.src = data.snapshot;
    };

    socket.on("update-canvas", handleUpdateCanvas);

    return () => {
      socket.off("update-canvas", handleUpdateCanvas);
    };
  }, []);

  // Lấy tọa độ
  const getEventCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (clientX === undefined || clientY === undefined) return null;

    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  const startDrawing = (e) => {
    if (!canDraw) return;
    const coords = getEventCoordinates(e);
    if (!coords) return;

    setIsDrawing(true);
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;

    ctx.beginPath();
    ctx.moveTo(coords.x, coords.y);
  };

  const stopDrawing = () => {
    if (isDrawing) {
      const canvas = canvasRef.current;
      if (canvas) {
        const snapshot = canvas.toDataURL();
        const roomId = window.location.pathname.split("/").pop();
        socket.emit("canvas-data", { room_id: roomId, snapshot });
      }
    }
    setIsDrawing(false);
    const ctx = canvasRef.current?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
    }
  };

  const draw = (e) => {
    if (!isDrawing) return;
    const coords = getEventCoordinates(e);
    if (!coords) return;
    
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;

    ctx.lineTo(coords.x, coords.y);
    ctx.stroke();
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    setShowSizePicker(false);
  };

  const handleToolClick = (newTool) => {
    if (showSizePicker && newTool === tool) {
      setShowSizePicker(false);
    } else {
      setTool(newTool);
      setShowSizePicker(true);
    }
  };

  useLayoutEffect(() => {
  const canvas = canvasRef.current;
  const container = containerRef.current;
  if (!canvas || !container) return;

  const updateSize = () => {
      const newWidth = container.clientWidth;
      const newHeight = container.clientHeight;

      if (canvas.width !== newWidth || canvas.height !== newHeight) {
        setCanvasWidth(newWidth);
        setCanvasHeight(newHeight);
        
        const ctx = canvas.getContext("2d");
        if (ctx) {
            ctx.fillStyle = "#FFFFFF";
            ctx.fillRect(0, 0, newWidth, newHeight);
        }
      }
      
    };
    
    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => {
      observer.unobserve(container);
    };
  }, [clearCanvas]);

  return (
    <div className="flex gap-4 w-full">
      {canDraw &&
        <div className="relative">
          {/* Thanh công cụ (Toolbar) */}
          <div className="game-card flex flex-col gap-3 p-3 items-center justify-center">
              <GameButton
                variant={tool === "brush" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleToolClick("brush")}
                className="w-12 h-12 p-0"
                title={t('canvas.brushTool')}
              >
                <Brush className="w-5 h-5" />
              </GameButton>
              
              <GameButton
                variant={tool === "eraser" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleToolClick("eraser")}
                className="w-12 h-12 p-0"
                title={t('canvas.eraserTool')}
              >
                <Eraser className="w-5 h-5" />
              </GameButton>
            
            {/* Màu sắc */}
            <div className="grid grid-cols-2 gap-2 items-center justify-center sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 border-t-2 border-b-2 pt-6 pb-6 flex-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  title={c}
                  onClick={() => {
                    setColor(c);
                    setTool("brush");
                    setShowSizePicker(false); 
                  }}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                    color === c && tool === "brush" ? "border-foreground scale-110 ring-2 ring-offset-2 ring-primary" : "border-border"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            
            <GameButton
              variant="secondary"
              size="sm"
              onClick={clearCanvas}
              className="w-12 h-12 p-0"
              title={t('canvas.clearCanvas')}
            >
              <Trash2 className="w-5 h-5" />
            </GameButton>
          </div>

          {/* Popover chọn kích thước */}
          {showSizePicker && (
            <div className="game-card bg-muted absolute left-full top-0 ml-2 z-10 p-3 flex flex-col gap-2 animate-fade-in">
              {BRUSH_SIZES.map((brush) => (
                <button
                  key={brush.label}
                  title={brush.label}
                  onClick={() => {
                    setBrushSize(brush.size);
                    setShowSizePicker(false); 
                  }}
                  className={`
                    w-12 h-12 p-0 flex items-center justify-center rounded-lg transition-colors
                    ${brushSize === brush.size ? 'bg-primary/30 ring-2 ring-primary' : 'hover:bg-card/50'}
                  `}
                >
                  <div
                    className="rounded-full bg-foreground"
                    style={{
                      width: `${Math.min(brush.size + 4, 24)}px`,
                      height: `${Math.min(brush.size + 4, 24)}px`,
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
      }

      {/* Canvas */}
      <div className={`game-card p-0 flex-1 relative`} style={{maxHeight: "500px", minHeight: "450px"}} ref={containerRef}>
        {keyword && 
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 flex items-center gap-2 z-10">
          <div className="bg-primary text-primary-foreground font-bold text-xl px-8 py-2 rounded-full shadow-lg border-4 border-white min-w-[150px] flex justify-center">
            {canDraw ? (
              <div className="flex gap-1">
                {keyword.split("").map((char, index) => {
                  if (char === " ") return <span key={index} className="w-4"></span>;
                  
                  // Logic xác định vị trí gợi ý thứ 2
                  let midIndex = Math.floor(keyword.length / 2);
                  if (keyword[midIndex] === " " || midIndex === 0) {
                    let found = false;
                    for (let i = midIndex + 1; i < keyword.length; i++) {
                      if (keyword[i] !== " ") { midIndex = i; found = true; break; }
                    }
                    if (!found) {
                      for (let i = midIndex - 1; i > 0; i--) {
                        if (keyword[i] !== " ") { midIndex = i; found = true; break; }
                      }
                    }
                  }

                  const isRevealed = (hintLevel >= 2 && index === 0) || 
                                   (hintLevel >= 3 && index === midIndex);
                  
                  return (
                    <span 
                      key={index} 
                      className={`
                        px-0.5 transition-all duration-300
                        ${hintLevel >= 1 ? "border-b-2 border-white/70" : ""}
                        ${isRevealed ? "text-yellow-300 scale-125 font-extrabold" : ""}
                      `}
                    >
                      {char.toUpperCase()}
                    </span>
                  );
                })}
              </div>
            ) : (
              <span className="whitespace-pre-wrap">{keyword?.toUpperCase()}</span>
            )}
          </div>
          {canDraw && (
            <GameButton
            variant="secondary" 
            size="sm" 
            onClick={handleRequestHint}
            disabled={hintLevel >= 3}
            className="!p-0 rounded-full w-12 h-12 border-4 border-white shadow-lg"
            title={t('canvas.hint')}
          >
            <Lightbulb className={`w-5 h-5 ${hintLevel >= 3 ? 'text-gray-400' : 'text-red-500'}`} />
          </GameButton>
          )}
        </div>}
        <canvas
          ref={canvasRef}
          // width={800}
          // height={600}
          width={canvasWidth}
          height={canvasHeight}
          className={`${canDraw && "cursor-crosshair"} w-full h-full block`}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          onTouchCancel={stopDrawing}
        />
      </div>
    </div>
  );
};