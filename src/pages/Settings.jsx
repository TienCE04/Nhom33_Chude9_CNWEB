import { useState, useEffect } from "react"; // Nhớ import useEffect
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, Globe, Moon, Sun, LogIn, Gamepad2 } from "lucide-react"; // Import thêm icon
import { GameButton } from "@/components/GameButton";
import { Select } from "antd";

const Settings = () => {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState("en");
  
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
    <div className="flex items-center w-full justify-center p-4 bg-background transition-colors duration-300">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2 text-foreground">Settings</h1>
          <p className="text-muted-foreground">Customize your game experience</p>
        </div>

        {/* ... (Giữ nguyên phần Sound và Language) ... */}
        
        <div className="game-card space-y-6">
            {/* Phần code Sound và Language giữ nguyên, chỉ thay đổi phần Dark Mode bên dưới */}
            
             {/* Sound (Giữ nguyên code cũ) */}
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="w-6 h-6 text-primary" /> : <VolumeX className="w-6 h-6 text-muted-foreground" />}
                  <div>
                    <h3 className="font-bold text-foreground">Sound Effects</h3>
                    <p className="text-sm text-muted-foreground">Enable game sounds</p>
                  </div>
                </div>
                <button onClick={() => setSoundEnabled(!soundEnabled)} className={`w-14 h-8 rounded-full transition-colors relative ${soundEnabled ? "bg-success" : "bg-muted"}`}>
                  <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${soundEnabled ? "translate-x-7" : "translate-x-1"}`} />
                </button>
            </div>

            {/* Language (Giữ nguyên code cũ) */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Globe className="w-6 h-6 text-primary" />
                  <div>
                    <h3 className="font-bold text-foreground">Language</h3>
                    <p className="text-sm text-muted-foreground">Choose your language</p>
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
                    <h3 className="font-bold text-foreground">Dark Mode</h3>
                    <p className="text-sm text-muted-foreground">
                    Toggle dark theme
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
      </div>
    </div>
  );
};

export default Settings;