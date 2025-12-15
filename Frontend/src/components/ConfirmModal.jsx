import React from "react";
import { X } from "lucide-react";
import { GameButton } from "./GameButton";

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  type = "danger", // danger, primary, success
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-card border-2 border-border rounded-xl shadow-2xl w-full max-w-md mx-4 transform transition-all scale-100 animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h3 className="text-xl font-bold text-foreground">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-muted-foreground text-base leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 pt-2 pb-2 pl-4 pr-4 border-t border-border bg-muted/30 rounded-b-xl">
          <GameButton
            variant="secondary"
            size="sm"
            onClick={onClose}
            className="min-w-[80px]"
          >
            {cancelText}
          </GameButton>
          <GameButton
            variant={type}
            size="sm"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="min-w-[80px]"
          >
            {confirmText}
          </GameButton>
        </div>
      </div>
    </div>
  );
};
