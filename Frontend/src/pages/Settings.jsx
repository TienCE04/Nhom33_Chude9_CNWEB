import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, Globe, Moon, Sun, LogIn, Gamepad2 } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { Select } from "antd";

const Settings = () => {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState("vi");
  
  // Khởi tạo state dark mode từ localStorage hoặc mặc định false
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });

  // Kiểm tra user đã đăng nhập chưa
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // Xử lý hiệu ứng Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  const handleBack = () => {
    if (isLoggedIn) {
      navigate("/lobby");
    } else {
      // Nếu quay về login, xóa sạch trạng thái đăng nhập
      localStorage.removeItem("isLoggedIn");
      navigate("/login");
    }
  };

  return (
    <div className="flex items-center w-full justify-center p-4 bg-background transition-colors duration-300 min-h-screen">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2 text-foreground">Cài đặt</h1>
          <p className="text-muted-foreground">Tùy chỉnh trải nghiệm trò chơi của bạn</p>
        </div>
        
        <div className="game-card space-y-6">
             {/* Sound */}
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="w-6 h-6 text-primary" /> : <VolumeX className="w-6 h-6 text-muted-foreground" />}
                  <div>
                    <h3 className="font-bold text-foreground">Hiệu ứng âm thanh</h3>
                    <p className="text-sm text-muted-foreground">Bật âm thanh trò chơi</p>
                  </div>
                </div>
                <button onClick={() => setSoundEnabled(!soundEnabled)} className={`w-14 h-8 rounded-full transition-colors relative ${soundEnabled ? "bg-success" : "bg-muted"}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${soundEnabled ? "translate-x-7" : "translate-x-1"}`} />
                </button>
            </div>

            {/* Language */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-foreground">Ngôn ngữ</h3>
                    <p className="text-sm text-muted-foreground">Chọn ngôn ngữ của bạn</p>
                  </div>
                </div>
                <Select
                  value={language}
                  onChange={(value) => setLanguage(value)}
                  className="w-32 h-[40px]"
                  options={[
                    { value: "en", label: "English" },
                    { value: "vi", label: "Tiếng Việt" },
                  ]}
                />
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                {darkMode ? (
                    <Moon className="w-6 h-6 text-primary" />
                ) : (
                    <Sun className="w-6 h-6 text-primary" />
                )}
                <div>
                    <h3 className="font-bold text-foreground">Chế độ tối</h3>
                    <p className="text-sm text-muted-foreground">
                    Chuyển đổi giao diện tối
                    </p>
                </div>
                </div>
                <button
                onClick={() => setDarkMode(!darkMode)}
                className={`
                    w-14 h-8 rounded-full transition-colors relative
                    ${darkMode ? "bg-primary" : "bg-muted"}
                `}
                >
                <div
                    className={`
                    absolute top-1 w-6 h-6 bg-white rounded-full transition-transform
                    ${darkMode ? "translate-x-7" : "translate-x-1"}
                    `}
                />
                </button>
            </div>
        </div>

        {/* Nút điều hướng Back có điều kiện - ĐÃ ĐƯỢC THÊM LẠI */}
        <div className="mt-8 text-center">
          <GameButton
            variant="secondary"
            size="lg"
            onClick={handleBack}
          >
            {isLoggedIn ? (
                <>
                    <Gamepad2 className="w-5 h-5 mr-2" />
                    Back to Lobby
                </>
            ) : (
                <>
                    <LogIn className="w-5 h-5 mr-2" />
                    Back to Login
                </>
            )}
          </GameButton>
        </div>

      </div>
    </div>
  );
};

export default Settings;