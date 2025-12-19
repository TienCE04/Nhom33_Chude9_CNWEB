import { createPortal } from "react-dom";
import { GameButton } from "./GameButton";

export const RoundResultPopup = ({ keyword, onClose }) => {
  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] animate-fade-in">
      <div className="bg-card p-8 rounded-3xl shadow-2xl border-4 border-primary max-w-md w-full text-center space-y-6 animate-scale-in">
        <h2 className="text-3xl font-black text-primary uppercase tracking-wider">
          Vòng chơi kết thúc!
        </h2>
        
        <div className="space-y-2">
          <p className="text-muted-foreground text-lg">Đáp án là:</p>
          <div className="text-4xl font-black text-foreground bg-muted/50 py-4 rounded-xl border-2 border-dashed border-primary/30">
            {keyword}
          </div>
        </div>

        <p className="text-sm text-muted-foreground animate-pulse">
          Đang chuẩn bị vòng mới...
        </p>
      </div>
    </div>,
    document.body
  );
};
