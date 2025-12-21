import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Trophy, Hash, Gamepad2, Plus, Loader, X, MoreVertical, Edit, Trash2 } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { roomApi } from "@/lib/api";
import { socket } from "@/lib/socket";
import { getUserInfo } from "../lib/utils";
import { useToast } from "@/hooks/use-toast";
import { Dropdown } from "antd";
import { ConfirmModal } from "@/components/ConfirmModal";

const MaterialIcon = ({ iconName, className = "" }) => (
  <span className={`material-symbols-rounded ${className}`}>{iconName}</span>
);

const RoomList = () => {
  const navigate = useNavigate();
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [showJoinByCodeModal, setShowJoinByCodeModal] = useState(false);
  const [roomCode, setRoomCode] = useState("");
  const [isJoiningByCode, setIsJoiningByCode] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, roomId: null });
  const userInfo = getUserInfo();
  const { toast } = useToast();

  useEffect(() => {
    fetchRooms();

    const handleRoomsUpdate = () => {
      fetchRooms();
    };

    socket.on("rooms_updated", handleRoomsUpdate);

    return () => {
      socket.off("rooms_updated", handleRoomsUpdate);
    };
  }, []);


  const fetchRooms = async () => {
    setIsLoading(true);
    try {
      const result = await roomApi.getRooms();
      console.log("Fetched rooms:", result);
      if (result.success) {
        const mappedRooms = result.rooms.map((room) => ({
          id: room.id,
          topic: room.name,
          topicIcon: room.metadata?.topicIcon || "extension",
          roomCode: room.id.substring(0, 8).toUpperCase(),
          currentPlayers: room.currentPlayers || 0,
          maxPlayers: room.maxPlayer,
          maxPoints: room.maxScore,
          status:
            (room.currentPlayers || 0) >= room.maxPlayer
              ? "Đã đầy"
              : "Sẵn sàng",
          username: room.username
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

  const handleEditRoom = (room, e) => {
    e.stopPropagation();
    navigate("/create/room", { state: { room } });
  };

  const handleDeleteRoom = (roomId, e) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, roomId });
  };

  const confirmDeleteRoom = async () => {
    const roomId = deleteModal.roomId;
    if (!roomId) return;

    try {
      const result = await roomApi.deleteRoom(roomId);
      if (result.success) {
        toast({ title: "Xóa phòng thành công", variant: "success" });
        setRooms(prev => prev.filter(r => r.id !== roomId));
        if (selectedRoom?.id === roomId) {
          setSelectedRoom(null);
        }
      } else {
        toast({ title: "Xóa phòng thất bại", description: result.message, variant: "destructive" });
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      toast({ title: "Có lỗi xảy ra khi xóa phòng", variant: "destructive" });
    } finally {
      setDeleteModal({ isOpen: false, roomId: null });
    }
  };

  const handleJoinRoom = () => {
    if (!selectedRoom) return;

    const userInfo = getUserInfo();
    socket.emit("join_room", { roomId: selectedRoom.id, user: userInfo });
    navigate(`/lobby/${selectedRoom.id}`);
  };

  const handleJoinByCode = async () => {
    if (!roomCode.trim()) {
      toast({ title: "Vui lòng nhập room code", variant: "destructive" });
      return;
    }

    setIsJoiningByCode(true);
    try {
      const userInfo = getUserInfo();
      let targetRoom = null;

      // Tìm trong mảng rooms (public rooms)
      targetRoom = rooms.find(r => r.id.startsWith(roomCode.toLowerCase()) || r.roomCode === roomCode.toUpperCase());

      // Nếu không tìm thấy trong public rooms, gọi API để lấy room
      if (!targetRoom) {
        const roomData = await roomApi.getRoomById(roomCode);
        if (roomData.success && roomData.room) {
          targetRoom = {
            id: roomData.room.id,
            topic: roomData.room.name,
            topicIcon: roomData.room.metadata?.topicIcon || "extension",
            roomCode: roomData.room.id.substring(0, 8).toUpperCase(),
            currentPlayers: roomData.room.currentPlayers || 0,
            maxPlayers: roomData.room.maxPlayer,
            maxPoints: roomData.room.maxScore,
            status: (roomData.room.currentPlayers || 0) >= roomData.room.maxPlayer ? "Đã đầy" : "Sẵn sàng",
          };
        }
      }

      if (!targetRoom) {
        toast({ title: "Không tìm thấy phòng với code này", variant: "destructive" });
        return;
      }

      if (targetRoom.currentPlayers >= targetRoom.maxPlayers) {
        toast({ title: "Phòng này đã đầy", variant: "destructive" });
        return;
      }

      // Join room
      socket.emit("join_room", { roomId: targetRoom.id, user: userInfo });
      navigate(`/lobby/${targetRoom.id}`);

      toast({ title: "Vào phòng thành công!", variant: "success" });
      setShowJoinByCodeModal(false);
      setRoomCode("");
      navigate(`/lobby/${targetRoom.id}`);
    } catch (error) {
      console.error("Error joining room by code:", error);
      toast({ title: "Không thể vào phòng", variant: "destructive" });
    } finally {
      setIsJoiningByCode(false);
    }
  };

  const handleCreateRoom = () => {
    const userInfo = getUserInfo();
    if (userInfo && (userInfo.role === 'guest' || userInfo.isGuest)) {
        toast({ title: "Vui lòng đăng nhập để tạo phòng", variant: "destructive" });
        return;
    }
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
        <div className="flex flex-col md:flex-row items-center justify-between mb-4 px-4 md:px-6 gap-4 md:gap-0">
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-primary" />
            <h1 className="text-2xl md:text-3xl font-extrabold">Danh sách phòng chơi</h1>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-3">
            <GameButton
              variant="primary"
              size="md"
              onClick={() => setShowJoinByCodeModal(true)}
              className="flex items-center gap-2"
            >
              <Hash className="w-5 h-5" />
              Vào bằng code
            </GameButton>
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
              <div className={`absolute top-2 left-2 px-3 py-1 rounded-full text-xs font-semibold ${
                room.status === "Đã đầy"
                  ? "bg-red-500 text-white"
                  : "bg-primary text-primary-foreground"
              }`}>
                {room.status}
              </div>

              {/* Dropdown Menu */}
              {userInfo?.username === room.username && (
                <div className="absolute top-2 right-2 z-10">
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'edit',
                          label: 'Chỉnh sửa',
                          icon: <Edit className="w-4 h-4" />,
                          onClick: ({ domEvent }) => handleEditRoom(room, domEvent)
                        },
                        {
                          key: 'delete',
                          label: 'Xóa',
                          icon: <Trash2 className="w-4 h-4 text-danger" />,
                          danger: true,
                          onClick: ({ domEvent }) => handleDeleteRoom(room.id, domEvent)
                        }
                      ]
                    }}
                    trigger={['click']}
                  >
                    <button 
                      className="p-1 rounded-full hover:bg-black/10 transition-colors bg-white/50 backdrop-blur-sm"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreVertical className="w-4 h-4 text-foreground/80" />
                    </button>
                  </Dropdown>
                </div>
              )}
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

        {/* Join by Code Modal */}
        {showJoinByCodeModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-background rounded-lg shadow-lg p-6 max-w-md w-full">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">Vào phòng bằng code</h2>
                <button
                  onClick={() => {
                    setShowJoinByCodeModal(false);
                    setRoomCode("");
                  }}
                  className="p-1 hover:bg-muted rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Room Code</label>
                  <input
                    type="text"
                    value={roomCode}
                    onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                    placeholder="Nhập room code (ví dụ: GAME-1234)"
                    className="w-full input-rounded py-2 px-3 uppercase tracking-widest font-mono"
                    onKeyPress={(e) => e.key === 'Enter' && handleJoinByCode()}
                  />
                </div>

                <div className="flex gap-3">
                  <GameButton
                    variant="danger"
                    size="md"
                    onClick={() => {
                      setShowJoinByCodeModal(false);
                      setRoomCode("");
                    }}
                    className="flex-1"
                  >
                    Hủy
                  </GameButton>
                  <GameButton
                    variant="success"
                    size="md"
                    onClick={handleJoinByCode}
                    disabled={isJoiningByCode || !roomCode.trim()}
                    className="flex-1"
                  >
                    {isJoiningByCode ? "Đang vào..." : "Vào phòng"}
                  </GameButton>
                </div>
              </div>
            </div>
          </div>
        )}

        <ConfirmModal
          isOpen={deleteModal.isOpen}
          onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
          onConfirm={confirmDeleteRoom}
          title="Xóa phòng"
          message="Bạn có chắc chắn muốn xóa phòng này? Hành động này không thể hoàn tác."
          confirmText="Xóa"
          cancelText="Hủy"
          type="danger"
        />
      </div>
    </div>
  );
};

export default RoomList;

