import { useState } from "react"; // Xóa useState vì không còn dùng
import { useNavigate } from "react-router-dom";
import { CanvasBoard } from "@/components/CanvasBoard";
import { TimerBar } from "@/components/TimerBar";
import { ChatBox } from "@/components/ChatBox"; // <-- THÊM VÀO
import { Scoreboard } from "@/components/Scoreboard"; // <-- THÊM VÀO

// THAY ĐỔI: Nhận props từ Lobby.jsx
const Game = ({ players, messages, onSendMessage, drawTime }) => {
  const navigate = useNavigate();
  const handleTimerComplete = () => {
    navigate("/results");
  };

  return (
    // THAY ĐỔI: Căn chỉnh lại layout để lấp đầy không gian
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="max-w-[1600px] mx-auto space-y-4 flex flex-col flex-1 w-full">
        {/* Header with Timer */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            {/* THAY ĐỔI: Sử dụng prop drawTime */}
            <TimerBar totalSeconds={drawTime} onComplete={handleTimerComplete} />
          </div>
        </div>

        {/* Current Word Hint */}
        <div className="game-card text-center">
          <h2 className="text-2xl font-bold">
            Current word: <span className="text-primary">_ _ _ _ _ _ _ _</span>
          </h2>
        </div>

        {/* Main Game Area */}
        {/* THAY ĐỔI: Thêm flex-1 min-h-0 để grid lấp đầy không gian */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 flex-1 min-h-0">
          {/* Canvas */}
          <div className="space-y-4">
            <div className="flex">
              <CanvasBoard />
            </div>
          </div>

          {/* THÊM VÀO: Cột Bảng điểm và Chat */}
          <div className="flex flex-col gap-4 min-h-0">
            <Scoreboard players={players} />
            <ChatBox
              messages={messages}
              onSendMessage={onSendMessage}
              placeholder="Nhập câu trả lời..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;