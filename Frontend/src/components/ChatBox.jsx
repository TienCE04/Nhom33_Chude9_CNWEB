import { useState } from "react";
import { Send, AlertTriangle } from "lucide-react";
import { GameButton } from "./GameButton";
import { useTranslation } from "react-i18next";

export const ChatBox = ({
  messages,
  onSendMessage,
  placeholder,
  typeBox,
  disabled = false
}) => {
  const { t } = useTranslation();
  const [input, setInput] = useState("");
  const effectivePlaceholder = placeholder || t('chatBox.placeholder');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="game-card h-full flex flex-col w-full">
      <h3 className="font-bold text-lg mb-3">{typeBox==="chat" ? t('chatBox.chat') : typeBox==="answer" ? t('chatBox.answer') : ""}</h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0 pr-[10px]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg flex items-center justify-between gap-2 ${
              msg.isSystem
                ? "bg-muted/50 text-muted-foreground text-sm justify-center"
                : msg.isCorrect
                ? "bg-success text-white font-bold"
                : msg.isClose
                ? "bg-yellow-100 text-yellow-800 border border-yellow-300"
                : "bg-muted/30"
            }`}
          >
            <div className="min-w-0 break-words">
              {!msg.isSystem && (
                <span className="font-bold">{msg.player}: </span>
              )}
              <span>{msg.text}</span>
            </div>
            {msg.isClose && (
              <span className="inline-flex items-center gap-1 text-xs font-bold uppercase text-yellow-700 shrink-0">
                <AlertTriangle className="w-3 h-3" />
                {t('chatBox.close')}
              </span>
            )}
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={disabled ? t('chatBox.drawing') : effectivePlaceholder}
          className="input-rounded flex-1 py-2"
          disabled={disabled}
        />
        <GameButton type="submit" variant="primary" size="sm" disabled={disabled}>
          <Send className="w-4 h-4" />
        </GameButton>
      </form>
    </div>
  );
};
