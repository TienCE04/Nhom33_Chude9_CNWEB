import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gamepad2, Plus } from "lucide-react";
import { GameButton } from "../components/GameButton";
import { Select } from "antd";

// Material Icon mapping
const TOPIC_ICONS = {
  "Động vật": "cruelty_free",
  "Công nghệ": "laptop_mac",
  "Thiên nhiên": "nature",
  "Thực phẩm": "cookie",
  "Thể thao": "sports_soccer",
  "Điện ảnh": "videocam",
  "Âm nhạc": "queue_music",
  "Du lịch": "flight",
  "Nghệ thuật": "palette",
  "Trò chơi": "sports_esports",
};

// Material Icon Component
const MaterialIcon = ({ iconName, className = "" }) => (
  <span className={`material-symbols-rounded ${className}`}>
    {iconName}
  </span>
);

const CreateRoom = () => {
  const navigate = useNavigate();
  const [maxPlayers, setMaxPlayers] = useState("6");
  const [targetScore, setTargetScore] = useState("100");
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Mock topics data
  const topics = [
    { id: 1, name: "Động vật" },
    { id: 2, name: "Công nghệ" },
    { id: 3, name: "Thiên nhiên" },
    { id: 4, name: "Thực phẩm" },
    { id: 5, name: "Thể thao" },
    { id: 6, name: "Điện ảnh" },
    { id: 7, name: "Âm nhạc" },
    { id: 8, name: "Du lịch" },
    { id: 9, name: "Nghệ thuật" },
    { id: 10, name: "Trò chơi" },
  ];

  const handleCreateRoom = () => {
    if (!selectedTopic) {
      alert("Vui lòng chọn một chủ đề");
      return;
    }
    console.log({ maxPlayers, targetScore, selectedTopic });
    navigate("/lobby");
  };

  return (
    <div className="p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 px-6">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-extrabold">Tạo phòng</h1>
        </div>
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
            >
              <Plus className="w-5 h-5" />
              Tạo chủ đề
            </GameButton>
          </div>

          {/* Topics Grid with Internal Scroll */}
          <div className="flex-1 overflow-y-auto mb-6 p-2">
            <div className="flex flex-wrap gap-4">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`
                    w-32 h-32 border-2 border-border flex flex-col items-center justify-center gap-3 rounded-xl
                    transition-all duration-500
                    hover:scale-105
                    ${
                      selectedTopic?.id === topic.id
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
                        selectedTopic?.id === topic.id
                          ? "bg-white"
                          : "bg-primary/20"
                      }
                    `}
                  >
                    <MaterialIcon
                      iconName={TOPIC_ICONS[topic.name]}
                      className={`text-3xl ${
                        selectedTopic?.id === topic.id
                          ? "text-primary"
                          : "text-primary"
                      }`}
                    />
                  </div>
                  <span
                    className={`font-semibold text-center text-md line-clamp-2 ${
                      selectedTopic?.id === topic.id
                        ? "text-primary-foreground"
                        : "text-foreground"
                    }`}
                  >
                    {topic.name}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Create Button */}
          <div className="pt-4 border-t border-border flex gap-3">
            <GameButton
              variant="secondary"
              size="lg"
              onClick={() => navigate("/")}
              className="flex-1"
            >
              Hủy
            </GameButton>
            <GameButton
              variant="success"
              size="lg"
              onClick={handleCreateRoom}
              disabled={!selectedTopic}
              className="flex-1"
            >
              Tạo phòng
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
