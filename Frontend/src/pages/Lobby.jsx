import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Copy, LogOut, Play, Pause } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { PlayerCard } from "@/components/PlayerCard";
import { toast } from "sonner";
import { Select } from "antd";
import { ChatBox } from "../components/ChatBox";
import Game from "./Game";
import { PlayRulePopup } from "../components/PlayRulePopup";
import { socket } from "@/lib/socket";
import { getUserInfo } from "../lib/utils";
import "../assets/styles/gamePage.css";

const Lobby = () => {
  const navigate = useNavigate();
  const [roomCode] = useState("GAME-1234");
  const [rounds, setRounds] = useState(3);
  const [drawTime, setDrawTime] = useState(60);
  const [topic, setTopic] = useState("Animals");
  const [roomType, setRoomType] = useState("Public");
  const [messages, setMessages] = useState([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [players, setPlayers] = useState([])
  useEffect(() => {
      const handleUpdatePlayerRoomEvent = (playersData) => {
        setPlayers(playersData)
      };
      const handleUpdateChat = (data) => {
        const { username, message } = data;
        const user = getUserInfo();

        if (user.username === username) return;

        setMessages(prev => [
          ...prev,
          {
            id: crypto.randomUUID(),
            player: username,
            text: message,
          },
        ]);
      };

      socket.on("playersData", handleUpdatePlayerRoomEvent);
      socket.on("updateChat", handleUpdateChat)
      return () => {
        socket.off("playersData", handleUpdatePlayerRoomEvent);
        socket.off("updateChat", handleUpdateChat)
      };
    }, []);

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast.success("Room code copied!");
  };

  const handleSendMessage = (message) => {
    const user = getUserInfo();
    setMessages([
      ...messages,
      { id: Date.now().toString() + user.username, player: "You", text: message },
    ]);
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("room");

    const data = {
      message: message,
      user: user,
      room_id: roomId
    }
    socket.emit("newChat", data)
  };

  const handleConfirmRules = () => {
    // include roomType in confirmation flow
    setShowRulesPopup(false);
    console.log("Starting game with roomType:", roomType);
    toast.success(`Bắt đầu phòng ${roomType}`);
    setIsGameStarted(true);
  };

  const handleLeaveRoom = () =>{
    const userInfo = getUserInfo();
    const params = new URLSearchParams(window.location.search);
    const roomId = params.get("room");
    socket.emit("leave_room", { roomId: roomId, username: userInfo.username });
    navigate("/rooms")
  }

  return (
    <div className="h-screen p-2 md:p-4">

      {/* RENDER POP-UP KHI STATE LÀ TRUE */}
      {showRulesPopup && (
        <PlayRulePopup 
          topic={topic}
          roomType={roomType}
          onConfirm={handleConfirmRules}
          onClose={() => setShowRulesPopup(false)}
        />
      )}
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="mb-3 flex flex-col md:flex-row items-center justify-between gap-2 px-6">
          <div className="flex items-center gap-3">
            <h2 className="text-3xl font-extrabold">Room Code:</h2>
            <code className="bg-primary/20 px-4 py-2 rounded-xl font-mono font-bold text-lg">
              {roomCode}
            </code>
            <button
              onClick={copyRoomCode}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex gap-3">
            {!isGameStarted ? (
              <GameButton
                variant="success"
                size="md"
                onClick={() => setShowRulesPopup(true)}
              >
                <Play className="w-5 h-5 mr-2" />
                Start Game
              </GameButton>
            ) : (
              <GameButton
                variant="pause"
                size="md"
                onClick={() => setIsGameStarted(false)}
              >
                <Pause className="w-5 h-5 mr-2" />
                Pause Game
              </GameButton>
            )}
            <GameButton
              variant="danger"
              size="md"
              onClick={() => handleLeaveRoom()}
            >
              <LogOut className="w-5 h-5 mr-2" />
              Leave
            </GameButton>
          </div>
        </div>

        {isGameStarted ? (
          <Game 
            messages={messages} 
            onSendMessage={handleSendMessage}
            drawTime={drawTime}
            players={players}
            onLeave={() => {
              setIsGameStarted(false);
              navigate("/");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:items-stretch flex-1">
            {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-3 lg:h-full lg:min-h-0">
            {/* Players Grid */}
            <div className="game-card overflow-auto flex-1 min-h-0">
              <h3 className="text-xl font-bold mb-4">Players</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {players.map((player) => (
                  <PlayerCard key={player.id} {...player} />
                ))}
              </div>
            </div>
            {/* Game Settings */}
            <div className="game-card flex-1 min-h-0 overflow-auto">
              <h3 className="text-xl font-bold mb-4">Game Settings</h3>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-3">
                  <label className="block font-semibold">Topic:</label>
                  <Select
                    value={topic}
                    onChange={(value) => setTopic(value)}
                    options={[
                      { value: "Animals", label: "Animals" },
                      { value: "Food", label: "Food" },
                      { value: "Objects", label: "Objects" },
                      { value: "Random", label: "Random" },
                    ]}
                    className="w-full h-[40px]"
                  />
                </div>

                <div className="flex items-center justify-center gap-3">
                  <label className="font-semibold flex-shrink-0">Loại phòng:</label>
                  <Select
                    value={roomType}
                    onChange={(value) => setRoomType(value)}
                    options={[
                      { value: "Public", label: "Public" },
                      { value: "Private", label: "Private" },
                    ]}
                    className="w-full h-[40px]"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Rounds: {rounds}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rounds}
                    onChange={(e) => setRounds(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-2">
                    Draw Time: {drawTime}s
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="120"
                    step="10"
                    value={drawTime}
                    onChange={(e) => setDrawTime(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Chat */}
          <div className="lg:col-span-1 overflow-auto">
            <div className="h-full">
              <ChatBox
                messages={messages}
                onSendMessage={handleSendMessage}
                placeholder="Chat with players..."
                typeBox={"chat"}
              />
            </div>
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Lobby;
