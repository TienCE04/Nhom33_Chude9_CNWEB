import { useState } from "react";
import { Send } from "lucide-react";
import { GameButton } from "./GameButton";

export const ChatBox = ({
  messages,
  onSendMessage,
  placeholder = "Type your guess...",
}) => {
  const [input, setInput] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() && onSendMessage) {
      onSendMessage(input.trim());
      setInput("");
    }
  };

  return (
    <div className="game-card h-full flex flex-col">
      <h3 className="font-bold text-lg mb-3">Chat</h3>
      
      <div className="flex-1 overflow-y-auto space-y-2 mb-3 min-h-0">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`p-2 rounded-lg ${
              msg.isSystem
                ? "bg-muted/50 text-muted-foreground text-sm text-center"
                : msg.isCorrect
                ? "bg-success/20 text-success-foreground"
                : "bg-muted/30"
            }`}
          >
            {!msg.isSystem && (
              <span className="font-bold">{msg.player}: </span>
            )}
            <span>{msg.text}</span>
          </div>
        ))}
      </div>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          className="input-rounded flex-1 py-2"
        />
        <GameButton type="submit" variant="primary" size="sm">
          <Send className="w-4 h-4" />
        </GameButton>
      </form>
    </div>
  );
};
