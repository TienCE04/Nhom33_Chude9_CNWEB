import { NavLink, useNavigate } from "react-router-dom";
import { Home, User, Settings, LogOut, Gamepad2, Palette } from "lucide-react";
import { GameButton } from "@/components/GameButton";

const Navbar = ({ onLogout }) => {
  const navigate = useNavigate();

  // Hàm tạo class cho link, tự động highlight khi active
  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-200 font-bold ${
      isActive
        ? "bg-primary text-primary-foreground shadow-md"
        : "text-muted-foreground hover:bg-muted hover:text-foreground"
    }`;

  // THÊM HÀM XỬ LÝ LOGOUT
  const handleLogout = () => {
    // Xóa trạng thái đăng nhập
    localStorage.removeItem("isLoggedIn");
    // Gọi callback nếu có (để cập nhật state ở component cha)
    if (onLogout) {
      onLogout();
    }
    // Điều hướng về trang chủ
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 w-full p-4">
      <div className="game-card flex items-center justify-between px-6 py-3 shadow-lg bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/60">
        {/* Logo / Brand */}
        <div 
          className="flex items-center gap-2 cursor-pointer hover:scale-105 transition-transform"
          onClick={() => navigate("/")}
        >
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-primary-foreground">
            <Palette className="w-6 h-6" />
          </div>
          <span className="text-2xl font-extrabold text-foreground hidden sm:block">
            Gartic
          </span>
        </div>

        {/* Navigation Links */}
        <div className="flex items-center gap-2 sm:gap-4">
          <NavLink to="/" className={navLinkClass} title="Trang chủ">
            <Home className="w-5 h-5" />
            <span className="hidden md:block">Home</span>
          </NavLink>

          <NavLink to="/rooms" className={navLinkClass} title="Danh sách phòng">
            <Gamepad2 className="w-5 h-5" />
            <span className="hidden md:block">Rooms</span>
          </NavLink>

          <NavLink to="/profile" className={navLinkClass} title="Hồ sơ">
            <User className="w-5 h-5" />
            <span className="hidden md:block">Profile</span>
          </NavLink>

          <NavLink to="/settings" className={navLinkClass} title="Cài đặt">
            <Settings className="w-5 h-5" />
            <span className="hidden md:block">Settings</span>
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
          <span className="hidden sm:block">Exit</span>
        </GameButton>
      </div>
    </nav>
  );
};

export default Navbar;