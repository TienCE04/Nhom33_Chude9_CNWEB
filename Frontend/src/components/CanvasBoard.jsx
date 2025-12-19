import { useRef, useEffect, useState, useLayoutEffect } from "react";
import { Brush, Eraser, Trash2 } from "lucide-react";
import { GameButton } from "./GameButton";
import { socket } from "@/lib/socket";

// Dời các hằng số ra ngoài để dễ quản lý
const COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
];

const BRUSH_SIZES = [
  { size: 3, label: "Nhỏ" },
  { size: 8, label: "Vừa" },
  { size: 16, label: "Lớn" },
];

export const CanvasBoard = ({ canDraw = true, keyword }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(8);
  const [tool, setTool] = useState("brush");
  const [showSizePicker, setShowSizePicker] = useState(false);

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

  // Lấy tọa độ (hỗ trợ cả chuột và cảm ứng)
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

  // useLayoutEffect(() => {
  //   const canvas = canvasRef.current;
  //   const container = containerRef.current;
  //   if (!canvas || !container) return;

  //   const updateSize = () => {
  //     // 1. Lấy kích thước hiển thị của container
  //     const newWidth = container.clientWidth;
  //     const newHeight = container.clientHeight;

  //     // 2. Cập nhật thuộc tính logic của canvas. 
  //     // Việc này TỰ ĐỘNG xóa canvas.
  //     if (canvas.width !== newWidth || canvas.height !== newHeight) {
  //       setCanvasWidth(newWidth);
  //       setCanvasHeight(newHeight);
  //     }
      
  //     // 3. Thiết lập lại context và vẽ nền trắng
  //     const ctx = canvas.getContext("2d");
  //     if (ctx) {
  //         ctx.fillStyle = "#FFFFFF";
  //         ctx.fillRect(0, 0, newWidth, newHeight);
  //     }
  //   };
    
  //   // Khởi tạo kích thước lần đầu
  //   updateSize();

  //   // Thiết lập ResizeObserver để lắng nghe sự thay đổi kích thước container
  //   const observer = new ResizeObserver(updateSize);
  //   observer.observe(container);

  //   return () => {
  //     observer.unobserve(container);
  //   };
  // }, [clearCanvas]);
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
                title="Bút vẽ"
              >
                <Brush className="w-5 h-5" />
              </GameButton>
              
              <GameButton
                variant={tool === "eraser" ? "primary" : "secondary"}
                size="sm"
                onClick={() => handleToolClick("eraser")}
                className="w-12 h-12 p-0"
                title="Tẩy"
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
              title="Xóa bảng"
            >
              <Trash2 className="w-5 h-5" />
            </GameButton>
          </div>

          {/* Popover chọn kích thước */}
          {showSizePicker && (
            // *** THAY ĐỔI Ở ĐÂY: Thêm "bg-muted" ***
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
        <div className="absolute left-1/2 -translate-x-1/2 -top-6 bg-primary text-primary-foreground font-bold text-xl px-8 py-2 rounded-full shadow-lg border-4 border-white z-10">
          {keyword?.toUpperCase()}
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