import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { CanvasBoard } from "@/components/CanvasBoard";
import { TimerBar } from "@/components/TimerBar";

const MOCK_PLAYERS = [
  { id: "1", name: "Player 1", points: 850 },
  { id: "2", name: "Player 2", points: 720 },
  { id: "3", name: "Player 3", points: 590 },
  { id: "4", name: "Player 4", points: 420 },
];

const MOCK_MESSAGES = [
  { id: "1", player: "System", text: "Draw: ELEPHANT", isSystem: true },
  { id: "2", player: "Player 2", text: "cat?" },
  { id: "3", player: "Player 3", text: "dog" },
  { id: "4", player: "Player 1", text: "ELEPHANT!", isCorrect: true },
];

const Game = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState(MOCK_MESSAGES);

  const handleSendMessage = (message) => {
    setMessages([
      ...messages,
      { id: Date.now().toString(), player: "You", text: message },
    ]);
  };

  const handleTimerComplete = () => {
    navigate("/results");
  };

  return (
    <div className="min-h-screen">
      <div className="max-w-[1600px] mx-auto space-y-4">
        {/* Header with Timer */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <TimerBar totalSeconds={60} onComplete={handleTimerComplete} />
          </div>
        </div>

        {/* Current Word Hint */}
        <div className="game-card text-center">
          <h2 className="text-2xl font-bold">
            Current word: <span className="text-primary">_ _ _ _ _ _ _ _</span>
          </h2>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">
          {/* Canvas and Chat */}
          <div className="space-y-4">
            <div className="flex">
              <CanvasBoard />
            </div>
            
            
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default Game;
