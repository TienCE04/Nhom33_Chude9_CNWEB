import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Palette, Users, LogIn, Globe, Volume2, Settings } from "lucide-react";
import { GameButton } from "@/components/GameButton";

const Home = () => {
  const [nickname, setNickname] = useState("");
  const navigate = useNavigate();

  const handlePlayNow = () => {
    if (nickname.trim()) {
      navigate("/lobby");
    }
  };

  const handleCreateRoom = () => {
    if (nickname.trim()) {
      navigate("/lobby");
    }
  };

  const handleJoinRoom = () => {
    if (nickname.trim()) {
      navigate("/lobby");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Palette className="w-16 h-16 text-primary" />
          <h1 className="text-6xl font-extrabold text-foreground">Gartic</h1>
        </div>
        <p className="text-xl text-muted-foreground font-semibold">
          Draw, Guess & Have Fun with Friends!
        </p>
      </div>

      <div className="w-full max-w-md space-y-4 animate-scale-in">
        <input
          type="text"
          placeholder="Enter your nickname..."
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handlePlayNow()}
          className="input-rounded w-full text-center text-lg font-semibold"
          maxLength={20}
        />

        <div className="space-y-3">
          <GameButton
            variant="primary"
            size="lg"
            onClick={handlePlayNow}
            disabled={!nickname.trim()}
            className="w-full"
          >
            Play Now
          </GameButton>

          <div className="grid grid-cols-2 gap-3">
            <GameButton
              variant="success"
              size="md"
              onClick={handleCreateRoom}
              disabled={!nickname.trim()}
              className="w-full"
            >
              <Users className="w-5 h-5 mr-2" />
              Create Room
            </GameButton>

            <GameButton
              variant="secondary"
              size="md"
              onClick={handleJoinRoom}
              disabled={!nickname.trim()}
              className="w-full"
            >
              <LogIn className="w-5 h-5 mr-2" />
              Join Room
            </GameButton>
          </div>
        </div>
      </div>

      <div className="fixed bottom-8 flex gap-4">
        <button className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:scale-110 transition-transform shadow-[0_4px_12px_hsl(210_60%_70%_/_0.15)]">
          <Globe className="w-5 h-5 text-foreground" />
        </button>
        <button className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:scale-110 transition-transform shadow-[0_4px_12px_hsl(210_60%_70%_/_0.15)]">
          <Volume2 className="w-5 h-5 text-foreground" />
        </button>
        <button 
          onClick={() => navigate("/settings")}
          className="w-12 h-12 rounded-full bg-card flex items-center justify-center hover:scale-110 transition-transform shadow-[0_4px_12px_hsl(210_60%_70%_/_0.15)]"
        >
          <Settings className="w-5 h-5 text-foreground" />
        </button>
      </div>
    </div>
  );
};

export default Home;
