import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, Globe, Moon, Sun, LogIn, Gamepad2 } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { Select } from "antd";
import { useTranslation } from "react-i18next";

const Settings = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const [soundEnabled, setSoundEnabled] = useState(true);
  
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

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("language", lng);
  };

  return (
    <div className="flex items-center w-full justify-center p-4 bg-background transition-colors duration-300 mt-20">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2 text-foreground">{t('settings.title')}</h1>
          <p className="text-muted-foreground">{t('settings.subtitle')}</p>
        </div>
        
        <div className="game-card space-y-6">
             {/* Sound */}
             <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {soundEnabled ? <Volume2 className="w-6 h-6 text-primary" /> : <VolumeX className="w-6 h-6 text-muted-foreground" />}
                  <div>
                    <h3 className="font-bold text-foreground">{t('settings.sound')}</h3>
                    <p className="text-sm text-muted-foreground">{t('settings.soundDesc')}</p>
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
                    <h3 className="font-bold text-foreground">{t('settings.language')}</h3>
                    <p className="text-sm text-muted-foreground">{t('settings.languageDesc')}</p>
                  </div>
                </div>
                <Select
                  value={i18n.language}
                  onChange={changeLanguage}
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
                    <h3 className="font-bold text-foreground">{t('settings.darkMode')}</h3>
                    <p className="text-sm text-muted-foreground">
                    {t('settings.darkModeDesc')}
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