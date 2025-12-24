import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { Home, User, Settings, LogOut, Gamepad2, Palette, Library, Trophy } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { useTranslation } from "react-i18next";

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-2 md:px-4 py-2 rounded-xl transition-all duration-200 font-bold ${
      isActive
        ? "bg-primary text-primary-foreground shadow-md"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  const handleLogout = () => {
    // Xóa trạng thái đăng nhập
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("authToken")
    localStorage.removeItem("user")

    if (onLogout) {
      onLogout();
    }
    // Điều hướng về trang chủ
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full p-2 md:p-4">
      <div className="game-card flex items-center justify-between px-2 md:px-6 py-2 md:py-3 shadow-lg bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        {/* Logo / Brand */}
        <div 
          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform shrink-0"
          onClick={() => navigate("/")}
        >
          <div className="w-8 h-8 md:w-10 md:h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
            <Palette className="w-5 h-5 md:w-6 md:h-6" />
          </div>
          <span className="text-xl md:text-2xl font-extrabold text-foreground hidden sm:block">
            Drawify
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-1 sm:gap-4 overflow-x-auto no-scrollbar">
          <NavLink to="/" className={navLinkClass} title={t('navbar.home')}>
            <Home className="w-5 h-5" />
            <span className="hidden lg:block">{t('navbar.home')}</span>
          </NavLink>

          <NavLink
            to="/rooms"
            className={({ isActive }) =>
              navLinkClass({
                isActive:
                  isActive ||
                  location.pathname.startsWith("/create/room"),
              })
            }
            title={t('navbar.rooms')}
          >
            <Gamepad2 className="w-5 h-5" />
            <span className="hidden lg:block">{t('navbar.rooms')}</span>
          </NavLink>

          <NavLink
            to="/topics"
            className={({ isActive }) =>
              navLinkClass({
                isActive:
                  isActive ||
                  location.pathname.startsWith("/create/theme"),
              })
            }
            title={t('navbar.topics')}
          >
            <Library className="w-5 h-5" />
            <span className="hidden lg:block">{t('navbar.topics')}</span>
          </NavLink>

          <NavLink to="/rank" className={navLinkClass} title={t('navbar.rank')}>
            <Trophy className="w-5 h-5" />
            <span className="hidden lg:block">{t('navbar.rank')}</span>
          </NavLink>

          <NavLink to="/profile" className={navLinkClass} title={t('navbar.profile')}>
            <User className="w-5 h-5" />
            <span className="hidden lg:block">{t('navbar.profile')}</span>
          </NavLink>

          <NavLink to="/settings" className={navLinkClass} title={t('navbar.settings')}>
            <Settings className="w-5 h-5" />
            <span className="hidden lg:block">{t('navbar.settings')}</span>
          </NavLink>
        </div>

        {/* Logout Button */}
        <GameButton
          variant="danger"
          size="sm"
          onClick={handleLogout}
          className="hidden sm:flex"
        >
          <LogOut className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:block">{t('navbar.logout')}</span>
        </GameButton>
      </div>
    </nav>
  );
};

export default Navbar;