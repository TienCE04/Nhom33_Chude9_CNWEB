import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, EyeOff, AlertCircle, X, Save } from "lucide-react";
import { authApi } from "@/lib/api";
import { toast } from "sonner";

const ChangePasswordModal = ({ isOpen, onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  
  // Password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState(0); // 0-3

  useEffect(() => {
    if (isOpen) {
      // Reset states when modal opens
      setOldPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
      setPasswordStrength(0);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!newPassword) {
      setPasswordStrength(0);
      return;
    }

    // Simple strength calculation
    let strength = 0;
    if (newPassword.length >= 8) strength++;
    if (/[A-Z]/.test(newPassword)) strength++;
    if (/[0-9!@#$%^&*]/.test(newPassword)) strength++;
    
    // Ensure at least 1 (Weak) if user typed something
    setPasswordStrength(Math.max(1, strength));
  }, [newPassword]);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword || !confirmNewPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }

    try {
      const result = await authApi.changePassword(oldPassword, newPassword);
      if (result.success) {
        toast.success("Đổi mật khẩu thành công");
        onClose();
      } else {
        toast.error(result.message || "Đổi mật khẩu thất bại");
      }
    } catch (error) {
      toast.error("Lỗi kết nối");
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      // Removed onClick={onClose} to prevent closing when clicking outside
    >
      <div 
        className="bg-card rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-border">
          <h3 className="text-xl font-bold text-foreground">Đổi mật khẩu</h3>
          <button 
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-muted-foreground">
              Mật khẩu hiện tại <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showOldPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="input-rounded w-full"
                placeholder="Nhập mật khẩu hiện tại"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowOldPassword(!showOldPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-muted-foreground">
              Mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="input-rounded w-full"
                placeholder="Nhập mật khẩu mới"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            
            {/* Strength Meter */}
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs text-muted-foreground">
                  Độ mạnh mật khẩu: <span className={`font-medium ${
                    passwordStrength === 0 ? 'text-muted-foreground' :
                    passwordStrength === 1 ? 'text-red-500' :
                    passwordStrength === 2 ? 'text-yellow-500' : 'text-green-500'
                  }`}>
                    {passwordStrength === 0 ? 'Chưa nhập' :
                     passwordStrength === 1 ? 'Yếu' :
                     passwordStrength === 2 ? 'Trung bình' : 'Mạnh'}
                  </span>
                </span>
              </div>
              <div className="flex space-x-1 h-1.5 w-full">
                <span className={`w-1/3 rounded-full transition-all duration-300 ${passwordStrength >= 1 ? 'bg-red-500' : 'bg-muted'}`}></span>
                <span className={`w-1/3 rounded-full transition-all duration-300 ${passwordStrength >= 2 ? 'bg-yellow-500' : 'bg-muted'}`}></span>
                <span className={`w-1/3 rounded-full transition-all duration-300 ${passwordStrength >= 3 ? 'bg-green-500' : 'bg-muted'}`}></span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Sử dụng ít nhất 8 ký tự, bao gồm chữ hoa, số và ký tự đặc biệt.</p>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-muted-foreground">
              Xác nhận mật khẩu mới <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                className={`input-rounded w-full ${
                  confirmNewPassword && newPassword !== confirmNewPassword 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'focus:ring-ring'
                }`}
                placeholder="Nhập lại mật khẩu mới"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground focus:outline-none"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {confirmNewPassword && newPassword !== confirmNewPassword && (
              <p className="text-xs text-red-500 flex items-center mt-1">
                <AlertCircle className="w-3 h-3 mr-1" />
                Mật khẩu không khớp
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 flex items-center justify-between border-t border-border gap-4">
          <button
            onClick={handleChangePassword}
            className="flex-1 px-4 py-2.5 rounded-lg bg-success text-success-foreground font-medium hover:brightness-110 transition-all flex items-center justify-center"
          >
            <Save className="w-5 h-5 mr-2" />
            Lưu thay đổi
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-danger text-danger-foreground font-medium hover:brightness-110 transition-all flex items-center justify-center"
          >
            <X className="w-5 h-5 mr-2" />
            Hủy
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default ChangePasswordModal;
