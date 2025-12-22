import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Palette, Users, LogIn, Loader, Globe, Volume2, Settings } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { authApi } from "@/lib/api";
import { useGoogleLogin } from "@react-oauth/google";
import { useToast } from "@/hooks/use-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { roomApi } from "@/lib/api";

const Login = () => {
  const [nicknameLogin, setNicknameLogin] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [regTab, setRegTab] = useState("account");
  const [isPlayNowLoading, setIsPlayNowLoading] = useState(false);
  const [isLoginLoading, setIsLoginLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setIsLoginLoading(true);
      try {
        // Gọi API backend với access token từ Google
        const result = await authApi.googleLogin(tokenResponse.access_token);

        if (result.success) {
          localStorage.setItem("authToken", result.accessToken);
          localStorage.setItem("user", JSON.stringify(result.user));
          localStorage.setItem("isLoggedIn", "true");
          toast({
            title: "Đăng nhập thành công!",
            description: `Chào mừng ${result.user.username}`,
            variant: "success",
          });
          navigate("/rooms");
        } else {
          toast({
            title: "Đăng nhập thất bại",
            description: result.message || "Có lỗi xảy ra, vui lòng thử lại",
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: "Lỗi kết nối",
          description: "Vui lòng thử lại sau",
          variant: "destructive",
        });
        console.error("Google login error:", error);
      } finally {
        setIsLoginLoading(false);
      }
    },
    onError: (error) => {
      console.error("Google Login Failed:", error);
      toast({
        title: "Đăng nhập Google thất bại",
        description: "Vui lòng thử lại",
        variant: "destructive",
      });
    },
  });

  const handlePlayNow = async () => {
    if (!nicknameLogin.trim()) return;
    setIsPlayNowLoading(true);

    try {
      const loginResult = await authApi.guestLogin(nicknameLogin);

      if (loginResult.success) {
        localStorage.setItem("authToken", loginResult.accessToken);
        localStorage.setItem("user", JSON.stringify(loginResult.user));
        localStorage.setItem("isLoggedIn", "true");

        const response = await roomApi.getRooms();
        
        if (response.success && response.rooms.length > 0) {
            let targetRoom = response.rooms.find(r => r.roomName === "Sảnh Chung" && r.currentPlayers < r.maxPlayer);
            if (targetRoom) {
                navigate(`/lobby/${targetRoom.id}`);
            } else {
                navigate("/rooms");
            }
        } else {
             navigate("/rooms");
        }
      } else {
        toast({ title: "Lỗi", description: "Không thể tạo tài khoản khách", variant: "destructive" });
      }
    } catch (error) {
      console.error("Lỗi:", error);
      toast({ title: "Lỗi kết nối", variant: "destructive" });
    } finally {
      setIsPlayNowLoading(false);
    }
  };

  const handleCreateRoom = () => {
    if (nicknameLogin.trim()) {
      toast({
        title: "Yêu cầu đăng nhập",
        description: "Vui lòng đăng nhập để tạo phòng",
        variant: "destructive",
      });
    }
  };

  const handleJoinRoom = () => {
    if (nicknameLogin.trim()) {
      navigate("/rooms");
    }
  };

  const handleLogin = async () => {
    if (!username.trim()) {
      toast({
        title: "Lỗi",
        description: "Tên đăng nhập là bắt buộc",
        variant: "destructive",
      });
      return;
    }
    if (!password.trim()) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu là bắt buộc",
        variant: "destructive",
      });
      return;
    }
    if (password.length < 4) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu phải có ít nhất 4 ký tự",
        variant: "destructive",
      });
      return;
    }

    setIsLoginLoading(true);
    try {
      const result = await authApi.login(username, password);

      if (result.success) {
        // Lưu token và user info
        localStorage.setItem("authToken", result.accessToken);
        localStorage.setItem("refreshToken", result.refreshToken);

        localStorage.setItem("user", JSON.stringify(result.user));
        localStorage.setItem("isLoggedIn", "true");

        toast({
          title: "Đăng nhập thành công!",
          description: `Chào mừng ${result.user.username}`,
          variant: "success",
        });

        // Redirect tới lobby sau 1.5s
        setTimeout(() => navigate("/rooms"), 1500);
      } else {
        toast({
          title: "Đăng nhập thất bại",
          description: result.message || "Tên đăng nhập hoặc mật khẩu không đúng",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Lỗi kết nối",
        description: "Vui lòng thử lại sau",
        variant: "destructive",
      });
      console.error("Login error:", error);
    } finally {
      setIsLoginLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="text-center mb-8 animate-fade-in">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Palette className="w-16 h-16 text-primary" />
          <h1 className="text-4xl md:text-6xl font-extrabold text-foreground">Drawify</h1>
        </div>
        <p className="text-lg md:text-xl text-muted-foreground font-semibold">
          Vẽ, Đoán & Vui cùng bạn bè!
        </p>
      </div>

      <div className="w-full max-w-5xl animate-scale-in">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Guess Block */}
          <div className="bg-card p-6 rounded-lg shadow-md flex flex-col">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <LogIn className="w-6 h-6" />Khách
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
                  disabled={!nicknameLogin.trim() || isPlayNowLoading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isPlayNowLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {isPlayNowLoading ? "Đang vào..." : "Chơi Ngay"}
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
                className={`transition-all duration-100 ${regTab === "account" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none absolute inset-0"
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
                  onChange={(e) => {
                    const value = e.target.value;
                    const noSpaceValue = value.replace(/\s/g, "");
                    setPassword(noSpaceValue);
                  }}
                  onKeyPress={(e) => e.key === "Enter" && handleLogin()}
                  className="input-rounded w-full text-center text-lg mb-3"
                  autoComplete="current-password"
                />

                <GameButton
                  variant="primary"
                  size="md"
                  onClick={handleLogin}
                  disabled={isLoginLoading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isLoginLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {isLoginLoading ? "Đang đăng nhập..." : "Đăng Nhập để Chơi"}
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
                className={`transition-all duration-100 ${regTab === "social" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none absolute inset-0"
                  }`}
              >
                <div className="space-y-3">
                  <GameButton
                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 border border-slate-200 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={() => googleLogin()}
                    disabled={isLoginLoading}
                    aria-label="Đăng nhập với Google"
                  >
                    {/* Google SVG */}
                    <svg className="w-5 h-5" viewBox="-3 0 262 262" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid"><path d="M255.878 133.451c0-10.734-.871-18.567-2.756-26.69H130.55v48.448h71.947c-1.45 12.04-9.283 30.172-26.69 42.356l-.244 1.622 38.755 30.023 2.685.268c24.659-22.774 38.875-56.282 38.875-96.027" fill="#4285F4" /><path d="M130.55 261.1c35.248 0 64.839-11.605 86.453-31.622l-41.196-31.913c-11.024 7.688-25.82 13.055-45.257 13.055-34.523 0-63.824-22.773-74.269-54.25l-1.531.13-40.298 31.187-.527 1.465C35.393 231.798 79.49 261.1 130.55 261.1" fill="#34A853" /><path d="M56.281 156.37c-2.756-8.123-4.351-16.827-4.351-25.82 0-8.994 1.595-17.697 4.206-25.82l-.073-1.73L15.26 71.312l-1.335.635C5.077 89.644 0 109.517 0 130.55s5.077 40.905 13.925 58.602l42.356-32.782" fill="#FBBC05" /><path d="M130.55 50.479c24.514 0 41.05 10.589 50.479 19.438l36.844-35.974C195.245 12.91 165.798 0 130.55 0 79.49 0 35.393 29.301 13.925 71.947l42.211 32.783c10.59-31.477 39.891-54.251 74.414-54.251" fill="#EB4335" /></svg>
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
