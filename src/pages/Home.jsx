import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Palette, Users, LogIn, Globe, Volume2, Settings } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDiscord } from '@fortawesome/free-brands-svg-icons';

const Home = () => {
  const [nicknameLogin, setNicknameLogin] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [regError, setRegError] = useState("");
  const [regTab, setRegTab] = useState("account");
  const navigate = useNavigate();

  const handlePlayNow = () => {
    if (nicknameLogin.trim()) {
      navigate("/lobby");
    }
  };

  const handleCreateRoom = () => {
    if (nicknameLogin.trim()) {
      navigate("/lobby");
    }
  };

  const handleJoinRoom = () => {
    if (nicknameLogin.trim()) {
      navigate("/rooms");
    }
  };

  const handleRegister = () => {
    setRegError("");
    if (!username.trim()) {
      setRegError("Nickname is required");
      return;
    }
    if (!email.trim()) {
      setRegError("Email is required");
      return;
    }
    if (password.length < 4) {
      setRegError("Password must be at least 4 characters");
      return;
    }
    if (password !== confirmPassword) {
      setRegError("Passwords do not match");
      return;
    }

    // No backend in this template — proceed to lobby for now
    navigate("/lobby");
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

      <div className="w-full max-w-5xl animate-scale-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Login Block */}
          <div className="bg-card p-6 rounded-lg shadow-md flex flex-col">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <LogIn className="w-6 h-6" /> Login
            </h2>
            <div className="flex flex-col justify-center flex-1">
              <input
                type="text"
                placeholder="Enter your nickname..."
                value={nicknameLogin}
                onChange={(e) => setNicknameLogin(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handlePlayNow()}
                className="input-rounded w-full text-center text-lg font-semibold mb-4"
                maxLength={20}
              />

              <div className="space-y-3">
                <GameButton
                  variant="primary"
                  size="lg"
                  onClick={handlePlayNow}
                  disabled={!nicknameLogin.trim()}
                  className="w-full"
                >
                  Play Now
                </GameButton>

                <div className="grid grid-cols-2 gap-3">
                  <GameButton
                    variant="success"
                    size="md"
                    onClick={handleCreateRoom}
                    disabled={!nicknameLogin.trim()}
                    className="w-full"
                  >
                    <Users className="w-5 h-5 mr-2" />
                    Create Room
                  </GameButton>

                  <GameButton
                    variant="secondary"
                    size="md"
                    onClick={handleJoinRoom}
                    disabled={!nicknameLogin.trim()}
                    className="w-full"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Join Room
                  </GameButton>
                </div>
              </div>
            </div>
          </div>

          {/* Register Block */}
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" /> Register
              </h2>
              {/* Tabs nav */}
              <div className="inline-flex rounded-full bg-transparent p-1 shadow-sm">
                <button
                  onClick={() => setRegTab("account")}
                  className={
                    "px-3 py-1 rounded-full text-sm font-medium transition " +
                    (regTab === "account"
                      ? "bg-primary text-white"
                      : "text-muted-foreground bg-card")
                  }
                >
                  Account
                </button>
                <button
                  onClick={() => setRegTab("social")}
                  className={
                    "ml-2 px-3 py-1 rounded-full text-sm font-medium transition " +
                    (regTab === "social"
                      ? "bg-primary text-white"
                      : "text-muted-foreground bg-card")
                  }
                >
                  Social
                </button>
              </div>
            </div>

            {regTab === "account" ? (
              <>
                <input
                  type="text"
                  placeholder="Username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-rounded w-full text-center text-lg mb-3"
                  maxLength={20}
                />

                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-rounded w-full text-center text-lg mb-3"
                />

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-rounded w-full text-center text-lg mb-3"
                />

                <input
                  type="password"
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="input-rounded w-full text-center text-lg mb-3"
                />

                {regError && (
                  <p className="text-sm text-red-500 mb-2 text-center">{regError}</p>
                )}

                <GameButton
                  variant="primary"
                  size="md"
                  onClick={handleRegister}
                  className="w-full"
                >
                  Register & Play
                </GameButton>

                <p className="mt-3 text-xs text-muted-foreground text-center">
                  By registering you agree to the local template behaviour. This is a
                  frontend-only placeholder — integrate a backend to persist accounts.
                </p>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center mb-2">
                  Use your Google or Discord account to quickly sign up.
                </p>

                <GameButton
                  className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 border border-slate-200 hover:shadow-md"
                  onClick={() => navigate("/lobby")}
                  aria-label="Sign up with Google"
                >
                  {/* Google SVG */}
                  <svg className="w-5 h-5" viewBox="0 0 533.5 544.3" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M533.5 278.4c0-17.4-1.4-34.2-4.1-50.4H272v95.2h147.1c-6.3 34-25 62.8-53.5 82.1v68.1h86.4c50.6-46.6 80-115.2 80-195z" fill="#4285F4"/>
                    <path d="M272 544.3c72.7 0 133.8-24 178.5-65.5l-86.4-68.1c-24.1 16.2-55 25.7-92.1 25.7-71 0-131-47.9-152.3-112.2H30.2v70.2C74.8 489.9 168 544.3 272 544.3z" fill="#34A853"/>
                    <path d="M119.7 323.9c-10.8-32.2-10.8-66.9 0-99.1V154.6H30.2c-41.7 82.3-41.7 179.6 0 261.9l89.5-92.6z" fill="#FBBC05"/>
                    <path d="M272 107.7c39.6 0 75.2 13.6 103.2 40.4l77.4-77.4C402.9 24.9 344 0 272 0 168 0 74.8 54.4 30.2 135.8l89.5 70.2C141 155.6 201 107.7 272 107.7z" fill="#EA4335"/>
                  </svg>
                  <span>Sign up with Google</span>
                </GameButton>

                <GameButton
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={() => navigate("/lobby")}
                  aria-label="Sign up with Discord"
                >
                  <FontAwesomeIcon icon={faDiscord} className="w-5 h-5" />
                  <span>Sign up with Discord</span>
                </GameButton>

                <p className="mt-2 text-xs text-muted-foreground text-center">No backend connected — these are placeholders.</p>
              </div>
            )}
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
