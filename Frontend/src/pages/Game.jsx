import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { CanvasBoard } from "@/components/CanvasBoard";
import { TimerBar } from "@/components/TimerBar";
import { ChatBox } from "@/components/ChatBox"; 
import { Scoreboard } from "@/components/Scoreboard"; 
import { socket } from "@/lib/socket";
import { getUserInfo } from "@/lib/utils";

// THAY ĐỔI: Nhận props từ Lobby.jsx
const Game = ({ players, messages, onSendMessage, drawTime }) => {
  const [keyword, setKeyword] = useState(null);
  const [isDrawer, setIsDrawer] = useState(false);
  const [answers, setAnswers] = useState([]);
  const [chatMessages, setChatMessages] = useState(messages || []);
  const [currentPlayers, setCurrentPlayers] = useState(players || []);
  const navigate = useNavigate();

  useEffect(() => {
    setCurrentPlayers(players);
  }, [players]);

  useEffect(() => {
    setChatMessages(messages);
  }, [messages]);

  useEffect(() => {
    const user = getUserInfo();
    
    const handleKeyword = (data) => {
      setKeyword(data.keyword);
      setIsDrawer(data.drawer_username === user?.username);
    };

    const handleNewRound = () => {
      // Reset trạng thái nếu cần
    };

    const handlePlayersData = (data) => {
      console.log("Received players data:", data);
      setCurrentPlayers(data);
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
      const { username, guess } = data;
      setAnswers(prev => [
        ...prev,
        {
          id: crypto.randomUUID(),
          player: username,
          text: guess,
          isCorrect: false
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
          text: `đã đoán đúng từ khóa! (+${points} điểm)`,
          isCorrect: true
        },
      ]);
    };

    socket.on("keyword", handleKeyword);
    socket.on("newRound", handleNewRound);
    socket.on("playersData", handlePlayersData);
    socket.on("updateChat", handleUpdateChat);
    socket.on("wrongGuess", handleWrongGuess);
    socket.on("correctGuess", handleCorrectGuess);

    return () => {
      socket.off("keyword", handleKeyword);
      socket.off("newRound", handleNewRound);
      socket.off("playersData", handlePlayersData);
      socket.off("updateChat", handleUpdateChat);
      socket.off("wrongGuess", handleWrongGuess);
      socket.off("correctGuess", handleCorrectGuess);
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
    // THAY ĐỔI: Căn chỉnh lại layout để lấp đầy không gian
    <div className="flex flex-col flex-1 h-full min-h-0">
      <div className="max-w-[1600px] mx-auto space-y-4 flex flex-col flex-1 w-full">
        {/* Header with Timer */}
        <div className="flex items-center gap-4">
          <div className="flex-1">
            {/* THAY ĐỔI: Sử dụng prop drawTime */}
            <TimerBar totalSeconds={drawTime} 
            // onComplete={handleTimerComplete} 
            />
          </div>
        </div>

        {/* Current Word Hint */}
        {/* {isDrawer && keyword && (
          <h2 className="text-2xl font-bold text-center">
            <span className="text-primary">Từ khóa: {keyword}</span>
          </h2>
        )} */}

        {/* Main Game Area */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4 flex-1 min-h-0 !mb-4">
          {/* Canvas */}
          <div className="relative mt-6" style={{maxHeight: "500px"}}>
            {/* Current Word Hint - đặt đè lên Canvas */}
            {/* <div className="absolute left-1/2 -translate-x-1/2 -top-6 bg-primary text-primary-foreground font-bold text-xl px-8 py-2 rounded-full shadow-lg border-4 border-white z-10">
              ANSWER_ _ _
            </div> */}
            <div className="flex">
              <CanvasBoard canDraw={isDrawer} keyword={keyword}/>
            </div>
          </div>

          {/* THÊM VÀO: Cột Bảng điểm và Chat */}
          <div className="flex flex-col gap-4 min-h-0 mt-6">
            <Scoreboard players={currentPlayers} />
          </div>

          <div className="flex gap-4 h-[200px] w-full">
            <ChatBox
              messages={chatMessages}
              onSendMessage={onSendMessage}
              placeholder="Nhập tin nhắn..."
              typeBox={"chat"}
            />
            <ChatBox
              messages={answers}
              onSendMessage={handleSetAnswers}
              placeholder="Nhập câu trả lời..."
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