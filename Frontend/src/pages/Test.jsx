import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Trophy, Hash, Gamepad2 } from "lucide-react";
import { GameButton } from "@/components/GameButton";

// Mock data for rooms
const MOCK_ROOMS = [
  {
    id: "1",
    topic: "Animals",
    topicAvatar: "🦁",
    roomCode: "GAME-1234",
    currentPlayers: 3,
    maxPlayers: 6,
    maxPoints: 1000,
  },
  {
    id: "2",
    topic: "Food",
    topicAvatar: "🍕",
    roomCode: "GAME-5678",
    currentPlayers: 5,
    maxPlayers: 6,
    maxPoints: 1500,
  },
  {
    id: "3",
    topic: "Objects",
    topicAvatar: "🚗",
    roomCode: "GAME-9012",
    currentPlayers: 2,
    maxPlayers: 8,
    maxPoints: 2000,
  },
  {
    id: "4",
    topic: "Nature",
    topicAvatar: "🌲",
    roomCode: "GAME-3456",
    currentPlayers: 6,
    maxPlayers: 6,
    maxPoints: 1200,
  },
  {
    id: "5",
    topic: "Sports",
    topicAvatar: "⚽",
    roomCode: "GAME-7890",
    currentPlayers: 4,
    maxPlayers: 8,
    maxPoints: 1800,
  },
  {
    id: "6",
    topic: "Technology",
    topicAvatar: "💻",
    roomCode: "GAME-2468",
    currentPlayers: 1,
    maxPlayers: 4,
    maxPoints: 1000,
  },
];

const Test = () => {
  const navigate = useNavigate();
  const [rooms] = useState(MOCK_ROOMS);

  const handleJoinRoom = (roomCode) => {
    // Navigate to lobby with room code
    navigate(`/lobby?room=${roomCode}`);
  };

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-extrabold">Danh sách phòng chơi</h1>
          </div>
          <GameButton
            variant="secondary"
            size="md"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Quay lại
          </GameButton>
        </div>

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              className="game-card hover:shadow-lg transition-all duration-300 flex flex-col h-full"
            >
              {/* Topic Avatar */}
              <div className="flex justify-center mb-4 mt-2">
                <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-4 border-primary text-5xl shadow-md">
                  {room.topicAvatar}
                </div>
              </div>

              {/* Topic Name */}
              <h3 className="text-xl font-bold text-center mb-4">
                {room.topic}
              </h3>

              {/* Room Code */}
              <div className="flex items-center justify-center gap-2 mb-4">
                <Hash className="w-4 h-4 text-muted-foreground" />
                <code className="bg-primary/20 px-3 py-1.5 rounded-lg font-mono font-semibold text-sm">
                  {room.roomCode}
                </code>
              </div>

              {/* Players Info and Max Points */}
              <div className="flex items-center justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    <span className={room.currentPlayers >= room.maxPlayers ? "text-danger" : "text-foreground"}>
                      {room.currentPlayers}
                    </span>
                    <span className="text-muted-foreground">/{room.maxPlayers}</span>
                  </span>
                </div>
                <div className="w-px h-4 bg-border"></div>
                <div className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-semibold text-foreground">
                    {room.maxPoints.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Join Button */}
              <GameButton
                variant={room.currentPlayers >= room.maxPlayers ? "danger" : "primary"}
                size="md"
                onClick={() => handleJoinRoom(room.roomCode)}
                disabled={room.currentPlayers >= room.maxPlayers}
                className="w-full mt-auto"
              >
                {room.currentPlayers >= room.maxPlayers ? "Đã đầy" : "Tham gia"}
              </GameButton>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {rooms.length === 0 && (
          <div className="text-center py-12">
            <Gamepad2 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-xl text-muted-foreground">
              Hiện tại không có phòng chơi nào
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Test;

