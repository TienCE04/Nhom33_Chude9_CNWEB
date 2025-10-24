import { Trophy } from "lucide-react";

export const Scoreboard = ({ players, title = "Scoreboard" }) => {
  const sortedPlayers = [...players].sort((a, b) => b.points - a.points);

  return (
    <div className="game-card">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5 text-secondary" />
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      
      <div className="space-y-2">
        {sortedPlayers.map((player, index) => (
          <div
            key={player.id}
            className={`flex items-center gap-3 p-2 rounded-xl transition-colors ${
              index < 3 ? "bg-secondary/20" : "bg-muted/30"
            }`}
          >
            <div className={`
              w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
              ${index === 0 ? "bg-secondary text-secondary-foreground" : 
                index === 1 ? "bg-muted text-foreground" :
                index === 2 ? "bg-primary/40 text-foreground" :
                "bg-muted/50 text-muted-foreground"}
            `}>
              {index + 1}
            </div>
            
            <div className="flex-1">
              <p className="font-semibold">{player.name}</p>
            </div>
            
            <div className="font-bold text-primary">
              {player.points} pts
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
