import { useNavigate } from "react-router-dom";
import { Trophy, RotateCcw, Home } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { PlayerCard } from "@/components/PlayerCard";

const FINAL_RANKINGS = [
  { id: "1", name: "Player 1", points: 2450, rank: 1 },
  { id: "2", name: "Player 2", points: 2100, rank: 2 },
  { id: "3", name: "Player 3", points: 1850, rank: 3 },
  { id: "4", name: "Player 4", points: 1420, rank: 4 },
];

const Results = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8 animate-scale-in">
          <Trophy className="w-24 h-24 text-secondary mx-auto mb-4" />
          <h1 className="text-5xl font-extrabold mb-2">Game Over!</h1>
          <p className="text-xl text-muted-foreground">Final Rankings</p>
        </div>

        <div className="space-y-3 mb-8 animate-fade-in">
          {FINAL_RANKINGS.map((player, index) => (
            <div
              key={player.id}
              className="animate-fade-in"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <PlayerCard {...player} />
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
          <GameButton
            variant="success"
            size="lg"
            onClick={() => navigate("/lobby")}
            className="min-w-[200px]"
          >
            <RotateCcw className="w-5 h-5 mr-2" />
            Play Again
          </GameButton>
          
          <GameButton
            variant="secondary"
            size="lg"
            onClick={() => navigate("/")}
            className="min-w-[200px]"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </GameButton>
        </div>
      </div>
    </div>
  );
};

export default Results;
