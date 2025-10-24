import { useRef, useEffect, useState } from "react";
import { Brush, Eraser, Undo2, Trash2 } from "lucide-react";
import { GameButton } from "./GameButton";

const COLORS = [
  "#000000", "#FFFFFF", "#FF0000", "#00FF00", "#0000FF",
  "#FFFF00", "#FF00FF", "#00FFFF", "#FFA500", "#800080",
];

export const CanvasBoard = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(3);
  const [tool, setTool] = useState("brush");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

  const startDrawing = (e) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx) {
      ctx.beginPath();
    }
  };

  const draw = (e) => {
    if (!isDrawing && e.type !== "mousedown") return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!ctx || !canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineWidth = brushSize;
    ctx.lineCap = "round";
    ctx.strokeStyle = tool === "eraser" ? "#FFFFFF" : color;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (ctx && canvas) {
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="flex gap-4">
      {/* Toolbar */}
      <div className="game-card flex flex-col gap-3 p-3">
        <GameButton
          variant={tool === "brush" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setTool("brush")}
          className="w-12 h-12 p-0"
        >
          <Brush className="w-5 h-5" />
        </GameButton>
        
        <GameButton
          variant={tool === "eraser" ? "primary" : "secondary"}
          size="sm"
          onClick={() => setTool("eraser")}
          className="w-12 h-12 p-0"
        >
          <Eraser className="w-5 h-5" />
        </GameButton>
        
        <div className="border-t border-border my-2" />
        
        <div className="flex flex-col gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => {
                setColor(c);
                setTool("brush");
              }}
              className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c && tool === "brush" ? "border-foreground scale-110" : "border-border"
              }`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        
        <div className="border-t border-border my-2" />
        
        <GameButton
          variant="secondary"
          size="sm"
          onClick={clearCanvas}
          className="w-12 h-12 p-0"
        >
          <Trash2 className="w-5 h-5" />
        </GameButton>
      </div>

      {/* Canvas */}
      <div className="game-card p-0 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={800}
          height={600}
          className="cursor-crosshair bg-white"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
    </div>
  );
};
