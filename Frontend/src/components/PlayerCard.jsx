import { User, CheckCircle2, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

export const PlayerCard = ({
  name,
  avatar,
  isReady,
  points,
  rank,
  isDrawing,
  className,
}) => {
  const { t } = useTranslation();

  return (
    <div className={cn(
      "game-card hover:shadow-[0_8px_24px_hsl(210_60%_70%_/_0.2)]",
      isDrawing && "ring-4 ring-secondary",
      className
    )}>
      <div className="flex items-center gap-3">
        <div className="relative">
          {avatar ? (
            <img
              src={avatar}
              alt={name}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
          )}
          {isDrawing && (
            <div className="absolute -top-1 -right-1 w-5 h-5 bg-secondary rounded-full animate-pulse" />
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-bold text-foreground truncate">{name}</p>
          {points !== undefined && (
            <p className="text-sm text-muted-foreground truncate">{points} {t('game.points')}</p>
          )}
        </div>
        
        {rank !== undefined && (
          <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold">
            {rank}
          </div>
        )}
        
        {isReady !== undefined && (
          isReady ? (
            <CheckCircle2 className="w-6 h-6 text-success" />
          ) : (
            <Clock className="w-6 h-6 text-muted-foreground" />
          )
        )}
      </div>
    </div>
  );
};
