import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { ArrowLeft, Gamepad2, Plus, Loader, MoreVertical, Edit, Trash2 } from "lucide-react";
import { GameButton } from "../components/GameButton";
import { Select, Dropdown } from "antd";
import { topicApi, authApi, roomApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { socket } from "@/lib/socket";
import { getUserInfo } from "../lib/utils";

import { ConfirmModal } from "../components/ConfirmModal";

// Material Icon mapping
const TOPIC_ICONS = {
  "Động vật": "cruelty_free",
  "Animals": "cruelty_free",
  "Công nghệ": "laptop_mac",
  "Technology": "laptop_mac",
  "Thiên nhiên": "nature",
  "Nature": "nature",
  "Thực phẩm": "cookie",
  "Food": "cookie",
  "Thể thao": "sports_soccer",
  "Sports": "sports_soccer",
  "Điện ảnh": "videocam",
  "Movies": "videocam",
  "Âm nhạc": "queue_music",
  "Music": "queue_music",
  "Du lịch": "flight",
  "Travel": "flight",
  "Nghệ thuật": "palette",
  "Art": "palette",
  "Trò chơi": "sports_esports",
  "Games": "sports_esports",
  "General": "category",
  "Chung": "category"
};

// Material Icon Component
const MaterialIcon = ({ iconName, className = "" }) => (
  <span className={`material-symbols-rounded ${className}`}>
    {iconName}
  </span>
);

const CreateRoom = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [maxPlayers, setMaxPlayers] = useState("6");
  const [targetScore, setTargetScore] = useState("100");
  const [typeRoom, setTypeRoom] = useState("private");
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [topics, setTopics] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, topicId: null });
  const [isEditing, setIsEditing] = useState(false);
  const [editingRoomId, setEditingRoomId] = useState(null);

  useEffect(() => {
    const fetchTopics = async () => {
      setIsLoading(true);
      try {
        const defaultTopicsRes = await topicApi.getDefaultTopics();
        let allTopics = defaultTopicsRes.success ? defaultTopicsRes.data : []

        const user = authApi.getUser();
        if (user && user.username) {
          const userTopicsRes = await topicApi.getUserTopics(user.username);
          if (userTopicsRes.success) {
            allTopics = [...allTopics, ...userTopicsRes.data];
          }
        }
        
        setTopics(allTopics);

        if (location.state?.room) {
          const room = location.state.room;
          setIsEditing(true);
          setEditingRoomId(room.id);
          setMaxPlayers(room.maxPlayers.toString());
          setTargetScore(room.maxPoints.toString());
          
          const roomDetails = await roomApi.getRoomById(room.id);
          if (roomDetails.success && roomDetails.room) {
             const r = roomDetails.room;
             setTypeRoom(r.room_type || "private");
             // Find the topic in the list
             const topicId = r.idTopic || r.metadata?.topicId;
             const foundTopic = allTopics.find(t => (t._id === topicId || t.idTopic === topicId));
             if (foundTopic) {
               setSelectedTopic(foundTopic);
             }
          }
        }

      } catch (error) {
        console.error("Error fetching topics:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopics();
  }, [location.state]);

  const handleDeleteTopic = (topicId, e) => {
    e.stopPropagation();
    setDeleteModal({ isOpen: true, topicId });
  };

  const confirmDeleteTopic = async () => {
    const topicId = deleteModal.topicId;
    if (!topicId) return;

    try {
      const result = await topicApi.deleteTopic(topicId);
      if (result.success) {
        toast({
          title: "Xóa chủ đề thành công",
          variant: "success",
        });
        const updatedTopics = topics.filter(t => (t._id || t.idTopic) !== topicId);
        setTopics(updatedTopics);
        if (selectedTopic && (selectedTopic._id === topicId || selectedTopic.idTopic === topicId)) {
          setSelectedTopic(null);
        }
      } else {
        toast({
          title: "Xóa chủ đề thất bại",
          description: result.message,
          variant: "error",
        });
      }
    } catch (error) {
      console.error("Error deleting topic:", error);
      toast({
        title: "Lỗi khi xóa chủ đề",
        description: "Có lỗi xảy ra khi xóa chủ đề",
        variant: "error",
      });
    }
  };

  const handleEditTopic = (topic, e) => {
    e.stopPropagation();
    navigate("/create/theme", { state: { topic } });
  };

  const handleCreateRoom = async () => {
    if (!selectedTopic) {
      toast({
        title: "Chưa chọn chủ đề",
        description: "Vui lòng chọn một chủ đề",
        variant: "error",
      });
      return;
    }

    setIsCreating(true);
    try {
      const roomData = {
        name: selectedTopic.nameTopic,
        maxPlayer: parseInt(maxPlayers),
        maxScore: parseInt(targetScore),
        metadata: {
          topicId: selectedTopic._id || selectedTopic.idTopic,
          topicIcon: selectedTopic.topicIcon || "category",
          topicName: selectedTopic.nameTopic
        },
        roomType: typeRoom,
      };

      if (isEditing) {
        const result = await roomApi.updateRoom(editingRoomId, roomData);
        if (result.success) {
          toast({
            title: "Cập nhật phòng thành công",
            variant: "success",
          });
          navigate("/rooms");
        } else {
          toast({
            title: "Cập nhật phòng thất bại",
            description: result.message || "Không thể cập nhật phòng",
            variant: "error",
          });
        }
      } else {
        const result = await roomApi.createRoom(roomData);
        if (result.success) {
          toast({
            title: "Tạo phòng thành công",
            variant: "success",
          });
          const user = getUserInfo();
          const data = {
            roomData: result.room,
            user: user
          }
          socket.emit("create_room", data)
          // Navigate to lobby with the new room ID
          navigate(`/lobby/${result.room.id}`);
        } else {
          toast({
            title: "Tạo phòng thất bại",
            description: result.message || "Không thể tạo phòng",
            variant: "error",
          });
        }
      }
    } catch (error) {
      console.error("Create/Update room error:", error);
      toast({
        title: "Lỗi kết nối",
        description: "Không thể kết nối tới máy chủ",
        variant: "error",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3 px-6">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-extrabold">{isEditing ? "Cập nhật phòng" : "Tạo phòng"}</h1>
        </div>
        <GameButton variant="secondary" size="md" onClick={() => navigate("/rooms")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </GameButton>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 sm:h-0">
        {/* Left Column - Configuration (1/3 width) */}
        <div className="sm:col-span-1 bg-card game-card flex flex-col min-h-0 shadow-lg">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            Cấu hình phòng
          </h2>

          {/* Max Players */}
          <div className="mb-6">
            <label className="block text-md font-semibold text-foreground mb-2">
              Số người chơi tối đa
            </label>
            <Select
                value={maxPlayers}
                onChange={(value) => setMaxPlayers(value)}
                options={[
                    { value: "5", label: "5 người" },
                    { value: "6", label: "6 người" },
                    { value: "7", label: "7 người" },
                    { value: "8", label: "8 người" },
                    { value: "9", label: "9 người" },
                    { value: "10", label: "10 người" },
                    { value: "15", label: "15 người" },
                    { value: "20", label: "20 người" },
                ]}
                className="w-full h-[45px]"
            />
          </div>

          {/* Target Score */}
          <div className="mb-8">
            <label className="block text-md font-semibold text-foreground mb-2">
              Mục tiêu điểm
            </label>
            <Select
                value={targetScore}
                onChange={(value) => setTargetScore(value)}
                options={[
                    { value: "20", label: "20 điểm" },
                    { value: "70", label: "70 điểm" },
                    { value: "100", label: "100 điểm" },
                    { value: "150", label: "150 điểm" },
                    { value: "200", label: "200 điểm" },
                    { value: "300", label: "300 điểm" },
                    { value: "350", label: "350 điểm" },
                    { value: "400", label: "400 điểm" },
                ]}
                className="w-full h-[45px]"
            />
          </div>
          <div className="mb-8">
            <label className="block text-md font-semibold text-foreground mb-2">
              Loại phòng
            </label>
            <Select
                value={typeRoom}
                onChange={(value) => setTypeRoom(value)}
                options={[
                    { value: "private", label: "Phòng riêng" },
                    { value: "public", label: "Phòng công cộng" },
                ]}
                className="w-full h-[45px]"
            />
          </div>
          {/* Display Settings Summary */}
          <div className="mt-auto pt-6 border-t border-border">
            <div className="bg-muted/30 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground mb-2">
                <span className="font-semibold text-foreground">
                  Người chơi:
                </span>{" "}
                {maxPlayers}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Mục tiêu:</span>{" "}
                {targetScore} điểm
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Topic Selection (2/3 width) */}
        <div className="sm:col-span-2 bg-card game-card flex flex-col min-h-0 shadow-lg">
          {/* Header with Create Topic Button */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Chủ đề</h2>
            <GameButton
              variant="primary"
              size="md"
              className="flex items-center gap-2"
              onClick={() => navigate("/create/theme")}
            >
              <Plus className="w-5 h-5" />
              Tạo chủ đề
            </GameButton>
          </div>

          {/* Topics Grid with Internal Scroll */}
          <div className="flex-1 overflow-y-auto mb-6 p-2">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader className="w-10 h-10 animate-spin text-primary" />
              </div>
            ) : (
              <div className="flex flex-wrap gap-4">
                {topics.length > 0 ? (
                  topics.map((topic) => (
                    <div key={topic._id || topic.idTopic} className="relative group">
                      <button
                        onClick={() => setSelectedTopic(topic)}
                        className={`
                          w-32 h-32 border-2 border-border flex flex-col items-center justify-center gap-3 rounded-xl
                          transition-all duration-500
                          hover:scale-105
                          ${
                            selectedTopic?._id === topic._id || selectedTopic?.idTopic === topic.idTopic
                              ? "bg-primary border-primary shadow-[0_8px_24px_hsl(210_60%_70%_/_0.25)]"
                              : "bg-card hover:bg-muted/30"
                          }
                        `}
                      >
                        <div
                          className={`
                            w-16 h-16 rounded-full
                            flex items-center justify-center
                            transition-colors duration-200
                            ${
                              selectedTopic?._id === topic._id || selectedTopic?.idTopic === topic.idTopic
                                ? "bg-white"
                                : "bg-primary/20"
                            }
                          `}
                        >
                          <MaterialIcon
                            iconName={TOPIC_ICONS[topic.nameTopic] || topic.topicIcon || "category"}
                            className={`text-3xl ${
                              selectedTopic?._id === topic._id || selectedTopic?.idTopic === topic.idTopic
                                ? "text-primary"
                                : "text-primary"
                            }`}
                          />
                        </div>
                        <span
                          className={`font-semibold text-center text-md line-clamp-2 px-2 ${
                            selectedTopic?._id === topic._id || selectedTopic?.idTopic === topic.idTopic
                              ? "text-primary-foreground"
                              : "text-foreground"
                          }`}
                        >
                          {topic.nameTopic}
                        </span>
                      </button>
                      
                      {topic.createdBy !== "system" && (
                        <div className="absolute top-2 right-2 z-10">
                          <Dropdown
                            menu={{
                              items: [
                                {
                                  key: 'edit',
                                  label: 'Chỉnh sửa',
                                  icon: <Edit className="w-4 h-4" />,
                                  onClick: ({ domEvent }) => handleEditTopic(topic, domEvent)
                                },
                                {
                                  key: 'delete',
                                  label: 'Xóa',
                                  icon: <Trash2 className="w-4 h-4 text-danger" />,
                                  danger: true,
                                  onClick: ({ domEvent }) => handleDeleteTopic(topic._id || topic.idTopic, domEvent)
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
                    </div>
                  ))
                ) : (
                  <div className="w-full text-center text-muted-foreground py-10">
                    Không có chủ đề nào. Hãy tạo chủ đề mới!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Create Button */}
          <div className="pt-4 border-t border-border flex gap-3">
            <GameButton
              variant="secondary"
              size="lg"
              onClick={() => navigate("/rooms")}
              className="flex-1"
            >
              Hủy
            </GameButton>
            <GameButton
              variant="success"
              size="lg"
              onClick={handleCreateRoom}
              disabled={!selectedTopic || isCreating}
              className="flex-1 flex items-center justify-center gap-2"
            >
              {isCreating && <Loader className="w-5 h-5 animate-spin" />}
              {isCreating ? (isEditing ? "Đang cập nhật..." : "Đang tạo...") : (isEditing ? "Cập nhật phòng" : "Tạo phòng")}
            </GameButton>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })}
        onConfirm={confirmDeleteTopic}
        title="Xóa chủ đề"
        message="Bạn có chắc chắn muốn xóa chủ đề này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
        type="danger"
      />
    </div>
  );
};

export default CreateRoom;
