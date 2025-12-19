import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trophy, Home, Medal } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { PlayerCard } from "@/components/PlayerCard";
import { playerApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

const Rank = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [leaderboard, setLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const response = await playerApi.getLeaderboard();
        if (response.success) {
          setLeaderboard(response.data.leaderboard);
          setUserRank(response.data.userRank);
        } else {
          toast({
            title: t('common.error'),
            description: response.message,
            variant: "destructive",
          });
        }
      } catch (error) {
        toast({
          title: t('common.error'),
          description: "Failed to load leaderboard",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, [toast, t]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center p-4 pt-20">
      <div className="max-w-2xl w-full bg-card rounded-xl shadow-xl border border-border overflow-hidden flex flex-col max-h-[80vh]">
        {/* Header - Compact */}
        <div className="p-6 border-b border-border bg-muted/30 flex items-center gap-4 shrink-0">
          <div className="p-3 bg-yellow-500/10 rounded-full">
            <Trophy className="w-8 h-8 text-yellow-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-primary">{t('rank.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('rank.subtitle')}</p>
          </div>
        </div>

        {/* Scrollable List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {leaderboard.length > 0 ? (
            leaderboard.map((player, index) => (
              <div
                key={player.username || index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PlayerCard
                  name={player.username}
                  points={player.totalPoint}
                  rank={player.rank || index + 1}
                  avatar={player.avatar}
                />
              </div>
            ))
          ) : (
            <div className="h-full flex items-center justify-center text-muted-foreground">
              {t('rank.noData')}
            </div>
          )}
        </div>

        {/* Fixed User Rank at Bottom */}
        {userRank && (
          <div className="p-4 border-t border-border bg-primary/5 shrink-0 z-10">
            <div className="flex items-center gap-2 mb-2 text-sm font-semibold text-primary">
              <Medal className="w-4 h-4" />
              {t('rank.yourRank')}
            </div>
            <PlayerCard
              name={userRank.username}
              rank={userRank.rank}
              points={leaderboard.find(p => p.username === userRank.username)?.totalPoint}
              avatar={leaderboard.find(p => p.username === userRank.username)?.avatar}
              className="bg-background shadow-sm border-primary/20"
            />
          </div>
        )}
      </div>

      <div className="mt-6 flex justify-center animate-fade-in">
        <GameButton
          variant="secondary"
          size="lg"
          onClick={() => navigate("/")}
          className="min-w-[200px]"
        >
          <Home className="w-5 h-5 mr-2" />
          {t('rank.backToHome')}
        </GameButton>
      </div>
    </div>
  );
};

export default Rank;
