import { createPortal } from "react-dom";
import { GameButton } from "./GameButton";
import { useTranslation } from "react-i18next";

export const RoundResultPopup = ({ keyword, onClose }) => {
  const { t } = useTranslation();

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] animate-fade-in">
      <div className="bg-card p-8 rounded-3xl shadow-2xl border-4 border-primary max-w-md w-full text-center space-y-6 animate-scale-in">
        <h2 className="text-3xl font-black text-primary uppercase tracking-wider">
          {t('modals.roundResult.title')}
        </h2>
        
        <div className="space-y-2">
          <p className="text-muted-foreground text-lg">{t('modals.roundResult.answerIs')}</p>
          <div className="text-4xl font-black text-foreground bg-muted/50 py-4 rounded-xl border-2 border-dashed border-primary/30">
            {keyword}
          </div>
        </div>

        <p className="text-sm text-muted-foreground animate-pulse">
          {t('modals.roundResult.preparingNextRound')}
        </p>
      </div>
    </div>,
    document.body
  );
};
