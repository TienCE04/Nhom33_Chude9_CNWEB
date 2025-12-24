import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Palette, Users, LogIn, Globe, Volume2, Settings, Loader } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { authApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Register = () => {
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [nickname, setNickname] = useState("");
  const [regTab, setRegTab] = useState("account");
  const [isLoading, setIsLoading] = useState(false);
  const [touched, setTouched] = useState({
    username: false,
    email: false,
    password: false,
    confirmPassword: false,
  });
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  const hasWhitespace = /\s/;
  const navigate = useNavigate();
  const { toast } = useToast();

  const validateEmail = (email) => {
    return String(email)
      .toLowerCase()
      .match(
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
      );
  };

  const handleRegister = async () => {
    if (!username.trim()) {
      toast({
        title: t('common.error'),
        description: t('register.usernameRequired'),
        variant: "destructive",
      });
      return;
    }
    if (!emailRegex.test(email)) {
      toast({
        title: t('common.error'),
        description: "Email không đúng định dạng (ví dụ: user@example.com)",
        variant: "destructive",
      });
      return;
    }
    if (!validateEmail(email)) {
      toast({
        title: t('common.error'),
        description: t('register.emailInvalid'),
        variant: "destructive",
      });
      return;
    }
    if (hasWhitespace.test(password)) {
      toast({
        title: "Lỗi",
        description: "Mật khẩu không được chứa khoảng trắng",
        variant: "destructive",
      });
      return;
    }
    if (!passwordRegex.test(password)) {
      toast({
        title: "Mật khẩu yếu",
        description: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ hoa, chữ thường, số và ký tự đặc biệt (@$!%*?&)",
        variant: "destructive",
      });
      return;
    }
    if (password !== confirmPassword) {
      toast({
        title: t('common.error'),
        description: t('register.passwordMismatch'),
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authApi.signup(username, password, email, nickname || username);
      
      if (result.success) {
        toast({
          title: t('register.registerSuccess'),
          description: t('register.registerSuccessDesc'),
          variant: "success",
        });
        
        setTimeout(() => navigate("/login"), 1500);
      } else {
        toast({
          title: t('register.registerFailed'),
          description: result.message || t('login.errorOccurred'),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: t('login.connectionError'),
        description: t('login.tryAgainLater'),
        variant: "destructive",
      });
      console.error("Register error:", error);
    } finally {
      setIsLoading(false);
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
          {t('register.subtitle')}
        </p>
      </div>

      <div className="w-full max-w-lg animate-scale-in">
          {/* Register Block */}
          <div className="bg-card p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <Users className="w-6 h-6" /> {t('register.title')}
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
                  {t('register.accountTab')}
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
                  {t('register.socialTab')}
                </button>
              </div>
            </div>

            <div className="relative">
              <div
                className={`transition-all duration-100 ${
                  regTab === "account" ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2 pointer-events-none absolute inset-0"
                }`}
              >
                {/* Username Field */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-left">
                    {t('register.usernameLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder={t('register.usernamePlaceholder')}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setTouched({ ...touched, username: true })}
                    className="input-rounded w-full text-center text-lg"
                    maxLength={20}
                    autoComplete="off"
                  />
                  {touched.username && !username.trim() && (
                    <p className="text-xs text-red-500 mt-1 text-left">
                      {t('register.usernameRequired')}
                    </p>
                  )}
                </div>

                {/* Nickname Field */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-left">
                    {t('register.nicknameLabel')}
                  </label>
                  <input
                    type="text"
                    placeholder={t('register.nicknamePlaceholder')}
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="input-rounded w-full text-center text-lg"
                    maxLength={20}
                    autoComplete="off"
                  />
                </div>

                {/* Email Field */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-left">
                    {t('register.emailLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    placeholder={t('register.emailPlaceholder')}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setTouched({ ...touched, email: true })}
                    className="input-rounded w-full text-center text-lg"
                    autoComplete="off"
                  />
                  {touched.email && !email.trim() && (
                    <p className="text-xs text-red-500 mt-1 text-left">
                      {t('register.emailRequired')}
                    </p>
                  )}
                  {touched.email && email.trim() && !validateEmail(email) && (
                    <p className="text-xs text-red-500 mt-1 text-left">
                      {t('register.emailInvalid')}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-left">
                    {t('register.passwordLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder={t('register.passwordPlaceholder')}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setTouched({ ...touched, password: true })}
                    className="input-rounded w-full text-center text-lg"
                    autoComplete="new-password"
                  />
                  {touched.password && !password.trim() && (
                    <p className="text-xs text-red-500 mt-1 text-left">
                      Mật khẩu tối thiểu 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt.
                    </p>
                  )}
                </div>

                {/* Confirm Password Field */}
                <div className="mb-3">
                  <label className="block text-sm font-medium mb-1 text-left">
                    {t('register.confirmPasswordLabel')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    placeholder={t('register.confirmPasswordPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setTouched({ ...touched, confirmPassword: true })}
                    className="input-rounded w-full text-center text-lg"
                    autoComplete="new-password"
                  />
                  {touched.confirmPassword && !confirmPassword.trim() && (
                    <p className="text-xs text-red-500 mt-1 text-left">
                      {t('register.passwordMismatch')}
                    </p>
                  )}
                </div>

                <GameButton
                  variant="primary"
                  size="md"
                  onClick={handleRegister}
                  disabled={isLoading}
                  className="w-full flex items-center justify-center gap-2"
                >
                  {isLoading && <Loader className="w-4 h-4 animate-spin" />}
                  {isLoading ? t('register.registering') : t('register.registerButton')}
                </GameButton>

                <p className="text-center text-sm text-muted-foreground mt-3">
                  {t('register.loginPrompt')}{" "}
                  <button
                    onClick={() => navigate("/login")}
                    className="text-primary font-semibold hover:underline"
                  >
                    {t('register.loginLink')}
                  </button>
                </p>
              </div>

              <div
                className={`${
                  regTab === "social" ? "opacity-100 translate-x-0" : "opacity-0 translate-x-2 pointer-events-none absolute inset-0"
                }`}
              >
                <div className="space-y-3">
                  {/* <p className="text-sm text-muted-foreground text-center mb-2">
                    {t('login.socialTab')}
                  </p> */}

                  <GameButton
                    className="w-full flex items-center justify-center gap-3 bg-white text-slate-800 border border-slate-200 hover:shadow-md"
                    onClick={() => navigate("/lobby")}
                    aria-label={t('login.googleLogin')}
                  >
                    {/* Google SVG */}
                    <svg
                      className="w-5 h-5"
                      viewBox="0 0 533.5 544.3"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path
                        d="M533.5 278.4c0-17.4-1.4-34.2-4.1-50.4H272v95.2h147.1c-6.3 34-25 62.8-53.5 82.1v68.1h86.4c50.6-46.6 80-115.2 80-195z"
                        fill="#4285F4"
                      />
                      <path
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
                    <span>{t('login.googleLogin')}</span>
                  </GameButton>

                  <GameButton
                    className="w-full flex items-center justify-center gap-3 bg-indigo-600 text-white hover:bg-indigo-700"
                    onClick={() => navigate("/lobby")}
                    aria-label={t('login.discordLogin')}
                  >
                    <FontAwesomeIcon icon={faDiscord} className="w-5 h-5" />
                    <span>{t('login.discordLogin')}</span>
                  </GameButton>
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

export default Register;
