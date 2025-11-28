import { useState } from "react"; // Xóa useState vì không còn dùng
import { useNavigate } from "react-router-dom";
import { CanvasBoard } from "@/components/CanvasBoard";
import { TimerBar } from "@/components/TimerBar";
import { ChatBox } from "@/components/ChatBox"; 
import { Scoreboard } from "@/components/Scoreboard"; 

// THAY ĐỔI: Nhận props từ Lobby.jsx
const Game = ({ players, messages, onSendMessage, drawTime }) => {

  const [answers, setAnswers] = useState([]);
  const navigate = useNavigate();
  const handleTimerComplete = () => {
    navigate("/results");
  };

  const handleSetAnswers = (answer) => {
    setAnswers([
      ...answers,
      { id: Date.now().toString(), player: "You", text: answer },
    ]);
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
        {/* <h2 className="text-2xl font-bold text-center">
          <span className="text-primary">ANSWER_ _ _</span>
        </h2> */}

        {/* Main Game Area */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 flex-1 min-h-0">
          {/* Canvas */}
          <div className="relative mt-6" style={{maxHeight: "500px"}}>
            {/* Current Word Hint - đặt đè lên Canvas */}
            {/* <div className="absolute left-1/2 -translate-x-1/2 -top-6 bg-primary text-primary-foreground font-bold text-xl px-8 py-2 rounded-full shadow-lg border-4 border-white z-10">
              ANSWER_ _ _
            </div> */}
            <div className="flex">
              <CanvasBoard />
            </div>
          </div>

          {/* THÊM VÀO: Cột Bảng điểm và Chat */}
          <div className="flex flex-col gap-4 min-h-0 mt-6">
            <Scoreboard players={players} />
          </div>

          <div className="flex gap-4 min-h-0 w-full">
            <ChatBox
              messages={messages}
              onSendMessage={onSendMessage}
              placeholder="Nhập tin nhắn..."
              typeBox={"chat"}
            />
            <ChatBox
              messages={answers}
              onSendMessage={handleSetAnswers}
              placeholder="Nhập câu trả lời..."
              typeBox={"answer"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;