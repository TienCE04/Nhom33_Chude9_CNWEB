import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Gamepad2, Plus } from "lucide-react";
import { GameButton } from "../components/GameButton";
import { Select } from "antd";

const CreateRoom = () => {
  const navigate = useNavigate();
  const [maxPlayers, setMaxPlayers] = useState("6");
  const [targetScore, setTargetScore] = useState("100");
  const [selectedTopic, setSelectedTopic] = useState(null);

  // Mock topics data
  const topics = [
    { id: 1, name: "Động vật", avatar: "🦁" },
    { id: 2, name: "Công nghệ", avatar: "💻" },
    { id: 3, name: "Thiên nhiên", avatar: "🌲" },
    { id: 4, name: "Thực phẩm", avatar: "🍕" },
    { id: 5, name: "Thể thao", avatar: "⚽" },
    { id: 6, name: "Điện ảnh", avatar: "🎬" },
    { id: 7, name: "Âm nhạc", avatar: "🎵" },
    { id: 8, name: "Du lịch", avatar: "✈️" },
    { id: 9, name: "Nghệ thuật", avatar: "🎨" },
    { id: 10, name: "Trò chơi", avatar: "🎮" },
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
    <div className="h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Gamepad2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-extrabold">Tạo phòng</h1>
        </div>
        <GameButton variant="secondary" size="md" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </GameButton>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 sm:h-0">
        {/* Left Column - Configuration (1/3 width) */}
        <div className="sm:col-span-1 bg-card game-card flex flex-col min-h-0">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            Cấu hình phòng
          </h2>

          {/* Max Players */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">
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
            <label className="block text-sm font-semibold text-foreground mb-2">
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
        <div className="sm:col-span-2 bg-card game-card flex flex-col min-h-0">
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

          {/* Topics List with Internal Scroll */}
          <div className="flex-1 overflow-y-auto pr-4 mb-6">
            <div className="space-y-3">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className={`
                                        w-full p-4 rounded-xl transition-all duration-200
                                        border-2 border-border
                                        flex items-center gap-3
                                        hover:shadow-[0_8px_24px_hsl(210_60%_70%_/_0.2)]
                                        hover:scale-102
                                        ${
                                          selectedTopic?.id === topic.id
                                            ? "bg-primary border-primary shadow-[0_8px_24px_hsl(210_60%_70%_/_0.25)]"
                                            : "bg-card hover:bg-muted/50"
                                        }
                                    `}
                >
                  <span className="text-3xl">{topic.avatar}</span>
                  <span
                    className={`font-semibold ${
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
