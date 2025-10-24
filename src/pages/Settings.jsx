import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Volume2, VolumeX, Globe, Moon, Sun } from "lucide-react";
import { GameButton } from "@/components/GameButton";

const Settings = () => {
  const navigate = useNavigate();
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [language, setLanguage] = useState("en");
  const [darkMode, setDarkMode] = useState(false);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold mb-2">Settings</h1>
          <p className="text-muted-foreground">Customize your game experience</p>
        </div>

        <div className="game-card space-y-6">
          {/* Sound */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {soundEnabled ? (
                <Volume2 className="w-6 h-6 text-primary" />
              ) : (
                <VolumeX className="w-6 h-6 text-muted-foreground" />
              )}
              <div>
                <h3 className="font-bold">Sound Effects</h3>
                <p className="text-sm text-muted-foreground">
                  Enable game sounds
                </p>
              </div>
            </div>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`
                w-14 h-8 rounded-full transition-colors relative
                ${soundEnabled ? "bg-success" : "bg-muted"}
              `}
            >
              <div
                className={`
                  absolute top-1 w-6 h-6 bg-white rounded-full transition-transform
                  ${soundEnabled ? "translate-x-7" : "translate-x-1"}
                `}
              />
            </button>
          </div>

          {/* Language */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="w-6 h-6 text-primary" />
              <div>
                <h3 className="font-bold">Language</h3>
                <p className="text-sm text-muted-foreground">
                  Choose your language
                </p>
              </div>
            </div>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="input-rounded py-2"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
              <option value="pt">Português</option>
              <option value="fr">Français</option>
            </select>
          </div>

          {/* Theme */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="w-6 h-6 text-primary" />
              ) : (
                <Sun className="w-6 h-6 text-primary" />
              )}
              <div>
                <h3 className="font-bold">Dark Mode</h3>
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

        <div className="mt-8 text-center">
          <GameButton
            variant="secondary"
            size="lg"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </GameButton>
        </div>
      </div>
    </div>
  );
};

export default Settings;
