import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { GameButton } from "./GameButton";
import { useTranslation } from "react-i18next";

export const JoinRoomModal = ({ 
  isOpen, 
  onClose, 
  roomCode, 
  setRoomCode, 
  onJoin, 
  isJoining 
}) => {
  const { t } = useTranslation();

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[9999] animate-fade-in backdrop-blur-sm">
      <div className="bg-card p-8 rounded-3xl shadow-2xl border-4 border-primary max-w-md w-full space-y-6 animate-scale-in relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-6 h-6" />
        </button>

        <div className="text-center space-y-2">
          <h2 className="text-3xl font-black text-primary uppercase tracking-wider">
            {t('modals.joinRoom.title')}
          </h2>
          <p className="text-muted-foreground">
            {t('modals.joinRoom.description')}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold mb-2 text-foreground/80 uppercase tracking-wide">
              {t('modals.joinRoom.roomCode')}
            </label>
            <input
              type="text"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
              placeholder={t('modals.joinRoom.placeholder')}
              className="w-full input-rounded py-4 px-4 text-center text-2xl font-black uppercase tracking-widest font-mono border-2 border-border focus:border-primary transition-colors bg-background"
              onKeyPress={(e) => e.key === 'Enter' && onJoin()}
              autoFocus
            />
          </div>

          <div className="flex gap-3 pt-2">
            <GameButton
              variant="secondary"
              size="lg"
              onClick={onClose}
              className="flex-1"
            >
              {t('modals.joinRoom.cancel')}
            </GameButton>
            <GameButton
              variant="success"
              size="lg"
              onClick={onJoin}
              disabled={isJoining || !roomCode.trim()}
              className="flex-1"
            >
              {isJoining ? t('modals.joinRoom.joining') : t('modals.joinRoom.join')}
            </GameButton>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
