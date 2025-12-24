import { useEffect, useState } from "react";
import { Clock } from "lucide-react";
import { useTranslation } from "react-i18next";

export const TimerBar = ({ endTime, duration = 60, onComplete }) => {
  const { t } = useTranslation();
  const [secondsLeft, setSecondsLeft] = useState(() => {
    if (!endTime || endTime === 0) return 0;
    const now = Date.now();
    const difference = endTime - now;
    return Math.max(0, Math.floor(difference / 1000));
  });

  useEffect(() => {
    // Nếu không có endTime (game chưa bắt đầu hoặc đang dừng), reset về 0
    if (!endTime || endTime === 0) {
      setSecondsLeft(0);
      return;
    }

    const calculateTimeLeft = () => {
      const now = Date.now();
      const difference = endTime - now;
      
      // Chuyển đổi sang giây và đảm bảo không nhỏ hơn 0
      const seconds = Math.max(0, Math.floor(difference / 1000));
      
      setSecondsLeft(seconds);

      if (seconds <= 0) {
        onComplete?.();
        return true; // Đánh dấu đã kết thúc
      }
      return false;
    };

    // Chạy ngay lập tức lần đầu
    const isFinished = calculateTimeLeft();
    if (isFinished) return;

    // Thiết lập interval để cập nhật mỗi giây
    const timer = setInterval(() => {
      const finished = calculateTimeLeft();
      if (finished) clearInterval(timer);
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onComplete]);

  // Tính toán % dựa trên tổng thời gian duration được cấu hình từ phòng
  const percentage = duration > 0 ? (secondsLeft / duration) * 100 : 0;
  const isLow = secondsLeft < 10; // Đổi màu đỏ khi còn dưới 10 giây

  return (
    <div className="game-card bg-white p-4 rounded-xl shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className={`w-5 h-5 ${isLow ? "text-red-500 animate-pulse" : "text-slate-500"}`} />
          <span className="font-bold text-slate-700">{t('game.timeLeft')}</span>
        </div>
        <span className={`font-mono font-bold text-2xl ${isLow ? "text-red-500" : "text-blue-600"}`}>
          {secondsLeft}s
        </span>
      </div>
      
      <div className="w-full bg-slate-100 rounded-full h-[12px] overflow-hidden border border-slate-50">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            isLow ? "bg-red-500" : "bg-green-500"
          }`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        />
      </div>
    </div>
  );
};