import { useNavigate, useLocation, useParams } from "react-router-dom";
import { Trophy, RotateCcw, Home } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { PlayerCard } from "@/components/PlayerCard";

const Results = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { roomId: paramRoomId } = useParams();
  const players = location.state?.players || [];
  const roomId = location.state?.roomId || paramRoomId;

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8 animate-scale-in">
          <Trophy className="w-24 h-24 text-secondary mx-auto mb-4" />
          <h1 className="text-4xl md:text-5xl font-extrabold mb-2">Game Over!</h1>
          <p className="text-lg md:text-xl text-muted-foreground">Final Rankings</p>
        </div>

        <div className="space-y-3 mb-8 animate-fade-in">
          {players.length > 0 ? (
            players.map((player, index) => (
              <div
                key={player.username || index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <PlayerCard 
                  name={player.username} 
                  points={player.point} 
                  rank={index + 1}
                  avatar={player.avatar}
                />
              </div>
            ))
          ) : (
            <p className="text-center text-muted-foreground">No result data available.</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
          <GameButton
            variant="success"
            size="lg"
            onClick={() => navigate(roomId ? `/lobby/${roomId}` : "/lobby")}
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
