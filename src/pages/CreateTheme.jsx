import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Palette, X } from "lucide-react";
import { GameButton } from "../components/GameButton";
import { Input } from "antd";

const CreateTheme = () => {
  const navigate = useNavigate();
  const [themeName, setThemeName] = useState("");
  const [keywordInput, setKeywordInput] = useState("");
  const [keywords, setKeywords] = useState([]);
  const [duplicateMessage, setDuplicateMessage] = useState("");

  const handleAddKeyword = (e) => {
    if (e.key === "Enter" && keywordInput.trim()) {
      e.preventDefault();
      if (!keywords.includes(keywordInput.trim())) {
        setKeywords([...keywords, keywordInput.trim()]);
        setKeywordInput("");
        setDuplicateMessage("");
      } else {
        setDuplicateMessage("Từ khóa này đã tồn tại");
        setTimeout(() => setDuplicateMessage(""), 3000);
      }
    }
  };

  const isDuplicate =
    keywordInput.trim() && keywords.includes(keywordInput.trim());

  const handleRemoveKeyword = (index) => {
    setKeywords(keywords.filter((_, i) => i !== index));
  };

  const handleCreateTheme = () => {
    if (!themeName.trim()) {
      alert("Vui lòng nhập tên chủ đề");
      return;
    }
    if (keywords.length === 0) {
      alert("Vui lòng nhập ít nhất một từ khóa");
      return;
    }
    console.log({ themeName, keywords });
    navigate("/lobby");
  };

  return (
    <div className="h-screen p-4 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Palette className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-extrabold">Tạo chủ đề</h1>
        </div>
        <GameButton variant="secondary" size="md" onClick={() => navigate("/")}>
          <ArrowLeft className="w-5 h-5 mr-2" />
          Quay lại
        </GameButton>
      </div>

      {/* Two-column layout */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 sm:h-0">
        {/* Left Column - Theme Configuration (1/3 width) */}
        <div className="sm:col-span-1 bg-card game-card flex flex-col min-h-0">
          <h2 className="text-2xl font-bold mb-6 text-foreground">
            Cấu hình chủ đề
          </h2>

          {/* Theme Name */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tên chủ đề
            </label>
            <Input
              placeholder="Nhập tên chủ đề..."
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              className="h-[45px]"
            />
          </div>

          {/* Keyword Input */}
          <div className="mb-8">
            <label className="block text-sm font-semibold text-foreground mb-2">
              Từ khóa
            </label>
            <Input
              placeholder="Nhập từ khóa và bấm Enter..."
              value={keywordInput}
              onChange={(e) => setKeywordInput(e.target.value)}
              onKeyPress={handleAddKeyword}
              className={`h-[45px] ${
                isDuplicate ? "!border-[2px] !border-danger" : ""
              }`}
              status={isDuplicate ? "error" : ""}
            />
            {duplicateMessage && (
              <p className="text-xs text-danger mt-2 font-semibold">
                {duplicateMessage}
              </p>
            )}
          </div>

          {/* Display Settings Summary */}
          <div className="mt-auto pt-6 border-t border-border">
            <div className="bg-muted/30 rounded-lg p-4 text-sm">
              <p className="text-muted-foreground mb-2">
                <span className="font-semibold text-foreground">Chủ đề:</span>{" "}
                {themeName || "Chưa nhập"}
              </p>
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">Từ khóa:</span>{" "}
                {keywords.length}
              </p>
            </div>
          </div>
        </div>

        {/* Right Column - Keywords List (2/3 width) */}
        <div className="sm:col-span-2 bg-card game-card flex flex-col min-h-0">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-foreground">
              Danh sách từ khóa
            </h2>
          </div>

          {/* Keywords List with Internal Scroll */}
          <div className="flex-1 overflow-y-auto pr-4 mb-6">
            {keywords.length === 0 ? (
              <div className="flex items-center justify-center h-full text-center">
                <p className="text-muted-foreground">
                  Chưa có từ khóa nào. Hãy thêm từ khóa để bắt đầu.
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                {keywords.map((keyword, index) => (
                  <div
                    key={index}
                    className="bg-primary text-primary-foreground px-4 py-2 rounded-full flex items-center gap-2 font-semibold shadow-[0_4px_12px_hsl(210_60%_70%_/_0.15)] hover:shadow-[0_8px_24px_hsl(210_60%_70%_/_0.2)] transition-all duration-200"
                  >
                    <span>{keyword}</span>
                    <button
                      onClick={() => handleRemoveKeyword(index)}
                      className="flex items-center justify-center w-5 h-5 rounded-full hover:bg-white/20 transition-colors"
                      aria-label="Xóa từ khóa"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
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
              onClick={handleCreateTheme}
              disabled={!themeName.trim() || keywords.length === 0}
              className="flex-1"
            >
              Tạo chủ đề
            </GameButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateTheme;
