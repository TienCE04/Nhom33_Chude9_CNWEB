import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Palette, Users, LogIn, Loader, Globe, Volume2, Settings } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { authApi } from "@/lib/api";
import { useGoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";

const Login = () => {
  const [nicknameLogin, setNicknameLogin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [regTab, setRegTab] = useState("account");
  const [loginError, setLoginError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoginError("");
      setIsLoading(true);
      try {
        // Gọi API backend với access token từ Google
        const result = await authApi.googleLogin(tokenResponse.access_token);

        if (result.success) {
          localStorage.setItem("authToken", result.token);
          localStorage.setItem("user", JSON.stringify(result.user));
          localStorage.setItem("isLoggedIn", "true");
          navigate("/rooms");
        } else {
          setLoginError(result.message || "Đăng nhập Google thất bại");
        }
      } catch (error) {
        setLoginError("Lỗi kết nối. Vui lòng thử lại.");
        console.error("Google login error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Failed:", error);
      setLoginError("Đăng nhập Google thất bại");
    },
  });

  const handlePlayNow = () => {
    if (nicknameLogin.trim()) {
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem('user', nicknameLogin)
      navigate("/lobby");
    }
  };

  const handleCreateRoom = () => {
    if (nicknameLogin.trim()) {
      navigate("/create/room");
    }
  };

  const handleJoinRoom = () => {
    if (nicknameLogin.trim()) {
      navigate("/rooms");
    }
  };

  const handleLogin = async () => {
    setLoginError("");
    if (!username.trim()) {
      setLoginError("Tên đăng nhập là bắt buộc");
      return;
    }
    if (!password.trim()) {
      setLoginError("Mật khẩu là bắt buộc");
      return;
    }
    if (password.length < 4) {
      setLoginError("Mật khẩu phải có ít nhất 4 ký tự");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.login(username, password);
      
      if (result.success) {
        // Lưu token và user info
        localStorage.setItem("authToken", result.token);
        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("isLoggedIn", "true");
        
        // Redirect tới lobby
        navigate("/rooms");
      } else {
        setLoginError(result.message || "Đăng nhập thất bại");
      }
    } catch (error) {
      setLoginError("Lỗi kết nối. Vui lòng thử lại.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
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
          Vẽ, Đoán & Vui cùng bạn bè!
        </p>
      </div>

      <div className="w-full max-w-5xl animate-scale-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guess Block */}
          <div className="bg-card p-6 rounded-lg shadow-md flex flex-col">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <LogIn className="w-6 h-6" />Đoán
            </h2>
            <div className="flex flex-col justify-center flex-1">
              <input
                type="text"
                placeholder="Nhập biệt danh của bạn..."
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
                  Chơi Ngay
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
                    Tạo Phòng
                  </GameButton>

                  <GameButton
                    variant="secondary"
                    size="md"
                    onClick={handleJoinRoom}
                    disabled={!nicknameLogin.trim()}
                    className="w-full"
                  >
                    <LogIn className="w-5 h-5 mr-2" />
                    Tham Gia Phòng
                  </GameButton>
                </div>
              </div>
            </div>
          </div>

          {/* Login Block */}
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" /> Đăng Nhập
              </h2>
              {/* Tabs nav */}
              <div className="inline-flex rounded-full bg-transparent p-1 shadow-sm">
                <button
                  onClick={() => setRegTab("account")}
                  className={
                    "px-3 py-1 rounded-full text-sm font-medium transition transform hover:scale-105 hover:shadow-md " +
                    (regTab === "account"
                      ? "bg-primary text-white"
                      : "text-muted-foreground bg-card")
                  }
                >
                  Tài khoản
                </button>
                <button
                  onClick={() => setRegTab("social")}
                  className={
                    "ml-2 px-3 py-1 rounded-full text-sm font-medium transition transform hover:scale-105 hover:shadow-md " +
                    (regTab === "social"
                      ? "bg-primary text-white"
                      : "text-muted-foreground bg-card")
                  }
                >
                  Mạng xã hội
                </button>
              </div>
            </div>

            <div className="relative">
              <div
                className={`transition-all duration-100 ${
                  regTab === "account" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none absolute inset-0"
                }`}
              >
                <input
                  type="text"
                  placeholder="Tên đăng nhập"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-rounded w-full text-center text-lg mb-3"
                  maxLength={20}
                  autoComplete="off"
                />

                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-rounded w-full text-center text-lg mb-3"
                  autoComplete="current-password"
                />

                {loginError && (
                  <p className="text-sm text-red-500 mb-2 text-center">
                    {loginError}
                  </p>
                )}

                <GameButton
                  variant="primary"
                  size="md"
                  onClick={handleLogin}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {isLoading ? "Đang đăng nhập..." : "Đăng Nhập để Chơi"}
                </GameButton>

                <p className="text-center text-sm text-muted-foreground mt-3">
                  Chưa có tài khoản?{" "}
                  <button
                    onClick={() => navigate("/register")}
                    className="text-primary font-semibold hover:underline"
                  >
                    Đăng ký tại đây
                  </button>
                </p>
              </div>

              <div
                className={`transition-all duration-100 ${
                  regTab === "social" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none absolute inset-0"
                }`}
              >
                <div className="space-y-3">
                  <GameButton
                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 border border-slate-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => googleLogin()}
                    disabled={isLoading}
                    aria-label="Đăng nhập với Google"
                  >
                    {/* Google SVG */}
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 533.5 544.3"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    > <path
                        d="M272 544.3c72.7 0 133.8-24 178.5-65.5l-86.4-68.1c-24.1 16.2-55 25.7-92.1 25.7-71 0-131-47.9-152.3-112.2H30.2v70.2C74.8 489.9 168 544.3 272 544.3z"
                        fill="#34A853"
                      />
                      <path
                        d="M119.7 323.9c-10.8-32.2-10.8-66.9 0-99.1V154.6H30.2c-41.7 82.3-41.7 179.6 0 261.9l89.5-92.6z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M272 107.7c39.6 0 75.2 13.6 103.2 40.4l77.4-77.4C402.9 24.9 344 0 272 0 168 0 74.8 54.4 30.2 135.8l89.5 70.2C141 155.6 201 107.7 272 107.7z"
                        fill="#EA4335"
                      />
                    </svg>
                    <span>Đăng nhập với Google</span>
                  </GameButton>

                  <GameButton
                    className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => navigate("/lobby")}
                    aria-label="Đăng nhập với Discord"
                  >
                    <FontAwesomeIcon icon={faDiscord} className="w-5 h-5" />
                    <span>Đăng nhập với Discord</span>
                  </GameButton>
                </div>
              </div>
            </div>
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

export default Login;
