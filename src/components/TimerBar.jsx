import { useEffect, useState } from "react";
import { Clock } from "lucide-react";

export const TimerBar = ({ totalSeconds, onComplete }) => {
  const [secondsLeft, setSecondsLeft] = useState(totalSeconds);

  useEffect(() => {
    setSecondsLeft(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onComplete?.();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onComplete]);

  const percentage = (secondsLeft / totalSeconds) * 100;
  const isLow = percentage < 25;

  return (
    <div className="game-card">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5" />
          <span className="font-bold">Time Remaining</span>
        </div>
        <span className={`font-bold text-xl ${isLow ? "text-danger" : ""}`}>
          {secondsLeft}s
        </span>
      </div>
      
      <div className="w-full bg-muted rounded-full h-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-1000 ease-linear rounded-full ${
            isLow ? "bg-danger" : "bg-success"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
