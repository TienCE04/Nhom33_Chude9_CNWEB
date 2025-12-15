import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, Trophy, Hash, Gamepad2, ArrowRight, Plus, Loader } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { roomApi } from "@/lib/api";
import { socket } from "@/lib/socket";
import { getUserInfo } from "../lib/utils";

// Material Icon mapping for room topics (simple mapping for displayed topics)
const TOPIC_ICONS = {
  Animals: "cruelty_free",
  Food: "cookie",
  Objects: "directions_car",
  Nature: "nature",
  Sports: "sports_soccer",
  Technology: "laptop_mac",
};

// Small wrapper to render Google Material Symbols
const MaterialIcon = ({ iconName, className = "" }) => (
  <span className={`material-symbols-rounded ${className}`}>{iconName}</span>
);

const RoomList = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRooms();
    const handleRoomUpdate = (data) => {
      fetchRooms();
    };
    const handleJoinRoomEvent = (roomId) => {
      console.log("room_join data:");

      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId
            ? {
                ...room,
                currentPlayers: room.currentPlayers + 1,
                status:
                  room.currentPlayers + 1 >= room.maxPlayers
                    ? "Đã đầy"
                    : "Sẵn sàng",
              }
            : room
        )
      );
    };
    const handleLeaveRoomEvent = (roomId) => {
      setRooms((prevRooms) =>
        prevRooms.map((room) =>
          room.id === roomId
            ? {
                ...room,
                currentPlayers: room.currentPlayers - 1,
                status:
                  room.currentPlayers - 1 < room.maxPlayers
                    ? "Sẵn sàng"
                    : "Đã đầy",
              }
            : room
        )
      );
    };
    socket.on("room_created", handleRoomUpdate);
    socket.on("joined_room", handleJoinRoomEvent);
    socket.on("leaved_room", handleLeaveRoomEvent);
    return () => {
      socket.off("room_created", handleRoomUpdate);
      socket.off("joined_room", handleJoinRoomEvent);
      socket.off("leaved_room", handleLeaveRoomEvent);

    };
  }, []);

  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const result = await roomApi.getRooms();
      if (result.success) {
        const mappedRooms = result.rooms.map((room) => ({
          id: room.id,
          topic: room.name,
          topicIcon: room.metadata?.topicIcon || "extension",
          roomCode: room.id.substring(0, 8).toUpperCase(),
          currentPlayers: room.currentPlayers || 0,
          maxPlayers: room.maxPlayer,
          maxPoints: room.maxScore,
          status: (room.currentPlayers || 0) >= room.maxPlayer ? "Đã đầy" : "Sẵn sàng",
        }));
        setRooms(mappedRooms);
      } else {
        setError(result.message || "Không thể tải danh sách phòng");
      }
    } catch (err) {
      setError("Lỗi kết nối");
    } finally {
      setIsLoading(false);
    }
  };

  const getAvatarForTopic = (topic) => {
    const avatars = {
      Animals: "🦁",
      Food: "🍕",
      Objects: "🚗",
      Nature: "🌲",
      Sports: "⚽",
      Technology: "💻",
    };
    return avatars[topic] || "🎮";
  };

  const handleJoinRoom = () => {
    if (selectedRoom) {
      const userInfo = getUserInfo();
      if(selectedRoom.currentPlayers < selectedRoom.maxPlayers){
        socket.emit("join_room", { roomId: selectedRoom.id, user: userInfo });
        navigate(`/lobby?room=${selectedRoom.id}`);
      }
  
    }
  };

  const handleCreateRoom = () => {
    navigate("/create/room");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-6">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-extrabold">Danh sách phòng chơi</h1>
          </div>
          <div className="flex items-center gap-3">
            <GameButton
              variant="primary"
              size="md"
              onClick={handleCreateRoom}
              className="flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Tạo phòng mới
            </GameButton>
            <GameButton
              variant="success"
              size="md"
              onClick={handleJoinRoom}
              disabled={!selectedRoom || selectedRoom.currentPlayers >= selectedRoom.maxPlayers}
              className="flex items-center gap-2"
            >
              Vào chơi
            </GameButton>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Lỗi!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}

        {/* Room Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 bg-white p-4 rounded-lg shadow-sm">
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => room.currentPlayers < room.maxPlayers && setSelectedRoom(room)}
              className={`game-card hover:shadow-lg transition-all duration-300 flex flex-col h-full border-2 relative ${
                room.currentPlayers >= room.maxPlayers
                  ? "cursor-not-allowed opacity-70"
                  : "cursor-pointer"
              } ${
                selectedRoom?.id === room.id ? "border-primary bg-primary/10 shadow-lg" : "border-border"
              }`}
            >
              {/* Status Badge */}
              <div className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-semibold ${
                room.status === "Đã đầy"
                  ? "bg-red-500 text-white"
                  : "bg-primary text-primary-foreground"
              }`}>
                {room.status}
              </div>
              {/* Topic Avatar */}
              <div className="flex justify-center mb-4 mt-2">
                <div className="w-24 h-24 rounded-full flex items-center justify-center border-2 border-border shadow-sm">
                  <div className="w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 bg-primary/20">
                    <MaterialIcon
                      iconName={room.topicIcon || "extension"}
                      className="text-3xl text-primary"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-2">
                {/* Topic Name */}
                <h3 className="text-xl font-bold text-center mb-4">
                  {room.topic}
                </h3>

                {/* Room Code */}
                <div className="flex items-center justify-center mb-4">
                  <Hash className="w-4 h-4 text-muted-foreground" />
                  <code className="bg-primary/20 px-3 py-1.5 rounded-lg font-mono font-semibold text-sm">
                    {room.roomCode}
                  </code>
                </div>
              </div>

              {/* Players Info and Max Points */}
              <div className="flex items-center justify-center gap-4 mb-2">
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

export default RoomList;

