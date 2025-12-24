import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { CanvasBoard } from "@/components/CanvasBoard";
import { TimerBar } from "@/components/TimerBar";
import { ChatBox } from "@/components/ChatBox"; 
import { Scoreboard } from "@/components/Scoreboard"; 
import { RoundResultPopup } from "@/components/RoundResultPopup";
import { socket } from "@/lib/socket";
import { getUserInfo } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const Game = ({ players, messages, onSendMessage, drawTime }) => {
  const { t } = useTranslation();
  const [keyword, setKeyword] = useState(null);
  const [isDrawer, setIsDrawer] = useState(false);
  const drawerUsernameRef = useRef(null);
  const [answers, setAnswers] = useState([]);
  const [chatMessages, setChatMessages] = useState(messages || []);
  const [currentPlayers, setCurrentPlayers] = useState(players || []);
  const currentPlayersRef = useRef(players || []);
  const [roundResult, setRoundResult] = useState(null); // { keyword: "..." }
  const [endTime, setEndTime] = useState(0);
  const [roundKey, setRoundKey] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPlayers(players);
    currentPlayersRef.current = players || [];
  }, [players]);

  useEffect(() => {
    setChatMessages(messages);
  }, [messages]);

  useEffect(() => {
    const user = getUserInfo();
    
    const handleKeyword = (data) => {
      console.log("Received keyword data:", data.keyword);
      setKeyword(data.keyword);
      const isUserDrawer = data.drawer_username === user?.username;
      setIsDrawer(isUserDrawer);
      drawerUsernameRef.current = data.drawer_username;
    };

    const handleNewRound = (data) => {
      console.log("Starting new round with data:", data);
      const isUserDrawer = data.drawer_username === user?.username;

      setRoundResult(null);
      setAnswers([]);
      setRoundKey(prev => prev + 1);
      setEndTime(data.endTime); // Cập nhật mốc thời gian kết thúc
      setIsDrawer(isUserDrawer);
      drawerUsernameRef.current = data.drawer_username;

      if (!isUserDrawer) {
        setKeyword(null);
      }
    };

    const handleRoundEnd = (data) => {
      setRoundResult({ keyword: data.keyword });
      setEndTime(0); // Dừng đồng hồ
    };

    const handleSyncGameState = (data) => {
      if (data.endTime) setEndTime(data.endTime);
      if (data.drawer_username) {
        const isUserDrawer = data.drawer_username === user?.username;
        setIsDrawer(isUserDrawer);
        drawerUsernameRef.current = data.drawer_username;
      }
      if (data.keyword) setKeyword(data.keyword);
    };

    const handleHint = (hint) => {
      // Nếu là người vẽ thì không cập nhật hint (vì đã thấy từ khóa gốc)
      if (user?.username === drawerUsernameRef.current) return;
      setKeyword(hint);
    };

    const handlePlayersData = (data) => {
      console.log("Received players data:", data);
      setCurrentPlayers(data);
      currentPlayersRef.current = data;
    };

    const handleEndGame = () => {
      const roomId = window.location.pathname.split("/").pop();
      navigate(`/results/${roomId}`, { state: { players: currentPlayersRef.current, roomId } });
    };

    const handleUpdateChat = (data) => {
      const { username, message } = data;
      setChatMessages(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          player: username,
          text: message,
        },
      ]);
    };

    const handleWrongGuess = (data) => {
      const { username, guess, isClose } = data;
      setAnswers(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          player: username,
          text: guess,
          isCorrect: false,
          isClose: isClose
        },
      ]);
    };

    const handleCorrectGuess = (data) => {
      const { username, points } = data;
      setAnswers(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          player: username,
          text: t('game.correctGuess', { points }),
          isCorrect: true
        },
      ]);
    };

    socket.on("keyword", handleKeyword);
    socket.on("newRound", handleNewRound);
    socket.on("playersData", handlePlayersData);
    socket.on("endGame", handleEndGame);
    socket.on("updateChat", handleUpdateChat);
    socket.on("wrongGuess", handleWrongGuess);
    socket.on("correctGuess", handleCorrectGuess);
    socket.on("allGuessed", handleRoundEnd);
    socket.on("roundEndedTimeout", handleRoundEnd);
    socket.on("syncGameState", handleSyncGameState);
    socket.on("hint", handleHint);

    return () => {
      socket.off("keyword", handleKeyword);
      socket.off("newRound", handleNewRound);
      socket.off("playersData", handlePlayersData);
      socket.off("endGame", handleEndGame);
      socket.off("updateChat", handleUpdateChat);
      socket.off("wrongGuess", handleWrongGuess);
      socket.off("correctGuess", handleCorrectGuess);
      socket.off("allGuessed", handleRoundEnd);
      socket.off("roundEndedTimeout", handleRoundEnd);
      socket.off("syncGameState", handleSyncGameState);
      socket.off("hint", handleHint);
    };
  }, []);

  // const handleTimerComplete = () => {
  //   navigate("/results");
  // };

  const handleSetAnswers = (answer) => {
    const user = getUserInfo();
    // Gửi câu trả lời lên server
    socket.emit("sendAnswer", {
      room_id: players[0]?.room_id || window.location.pathname.split("/").pop(), // Lấy room_id từ URL hoặc players
      username: user?.username,
      guess: answer
    });
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 relative">
      {roundResult && (
        <RoundResultPopup 
          keyword={roundResult.keyword} 
        />
      )}
      <div className="max-w-[1600px] mx-auto space-y-4 flex flex-col flex-1 w-full">
        {/* Header with Timer */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <TimerBar key={roundKey} endTime={endTime} duration={drawTime} />
          </div>
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 flex-1 min-h-0 !mb-4">
          {/* Canvas */}
          <div className="relative mt-6" style={{maxHeight: "500px"}}>
            <div className="flex">
              <CanvasBoard canDraw={isDrawer} keyword={keyword}/>
            </div>
          </div>

          {/* Cột Bảng điểm và Chat */}
          <div className="flex flex-col gap-4 min-h-0 mt-6">
            <Scoreboard players={currentPlayers} />
          </div>

          <div className="flex flex-col md:flex-row gap-4 h-[400px] md:h-[200px] w-full">
            <ChatBox
              messages={chatMessages}
              onSendMessage={onSendMessage}
              placeholder={t('game.chatPlaceholder')}
              typeBox={"chat"}
            />
            <ChatBox
              messages={answers}
              onSendMessage={handleSetAnswers}
              placeholder={t('game.answerPlaceholder')}
              typeBox={"answer"}
              disabled={isDrawer}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Game;