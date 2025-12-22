import { useState, useEffect, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Copy, LogOut, Play, Pause } from "lucide-react";
import { GameButton } from "@/components/GameButton";
import { PlayerCard } from "@/components/PlayerCard";
import { useToast } from "@/hooks/use-toast";
import { ChatBox } from "../components/ChatBox";
import Game from "./Game";
import { PlayRulePopup } from "../components/PlayRulePopup";
import { socket } from "@/lib/socket";
import { getUserInfo } from "../lib/utils";
import "../assets/styles/gamePage.css";
import { useTranslation } from "react-i18next";
import Navbar from "@/components/Navbar";
import PageTransition from "@/components/PageTransition";

const Lobby = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { roomId } = useParams();
  const dataLoadedRef = useRef(false);
  // const [rounds, setRounds] = useState(3);
  const [drawTime, setDrawTime] = useState(60);
  const [topic, setTopic] = useState("Animals");
  const [roomType, setRoomType] = useState("Public");
  const [room, setRoom] = useState({})
  const [messages, setMessages] = useState([]);
  const [isGameStarted, setIsGameStarted] = useState(false);
  const [showRulesPopup, setShowRulesPopup] = useState(false);
  const [players, setPlayers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  // Hàm để load dữ liệu phòng từ API
  const loadRoomData = async () => {
    try {
      setIsLoading(true);
      const user = getUserInfo();
      if (!user || !user.username) {
        navigate("/login");
        return;
      }

      // Join room thông qua socket
      const actualRoomId = roomId || room.id || room.room?.id;
      if (actualRoomId) {
        socket.emit("join_room", { roomId: actualRoomId, user });
      }
    } catch (error) {
      console.error("Error loading room data:", error);
      toast({ title: t('lobby.loadRoomError'), variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  // Hàm xử lý cập nhật dữ liệu player từ socket
  const handleUpdatePlayerRoomEvent = (playersData) => {
    console.log("Received players data:", playersData);
    setPlayers(playersData);
    if (playersData.length < 2) setIsGameStarted(false);
  };

  // Hàm xử lý chat
  const handleUpdateChat = (data) => {
    const { username, message } = data;

    setMessages(prev => [
      ...prev,
      {
        id: crypto.randomUUID(),
        player: username,
        text: message,
      },
    ]);
  };

  // Hàm xử lý cập nhật dữ liệu phòng
  const handleUpdateRoomData = (data) => {
    setRoom(data);
    const topicData = {
      value: data.metadata?.topicId || data.room?.metadata?.topicId,
      label: data.metadata?.topicName || data.room?.metadata?.topicName
    };
    setTopic(topicData);
    setRoomType(data.room_type || data.room?.room_type);
  };

  // Hàm xử lý khi game bắt đầu
  const handleStartGame = (data) => {
    setIsGameStarted(true);
  };

  // Hàm xử lý khi game tạm dừng
  const handleGamePaused = (data) => {
    setIsGameStarted(false);
  };

  // Setup socket listeners và load dữ liệu khi component mount
  useEffect(() => {
    // Chỉ load dữ liệu một lần khi component mount
    if (!dataLoadedRef.current) {
      dataLoadedRef.current = true;
      loadRoomData();
    }

    // Setup socket event listeners
    socket.on("gamePaused", handleGamePaused);
    socket.on("gameStarted", handleStartGame);
    socket.on("roomData", handleUpdateRoomData);
    socket.on("playersData", handleUpdatePlayerRoomEvent);
    socket.on("updateChat", handleUpdateChat);
    socket.on("room_full", (data) => {
      toast({ title: data.message, variant: "destructive" });
      navigate("/rooms");
    });

    // Cleanup listeners khi component unmount
    return () => {
      socket.off("gamePaused", handleGamePaused);
      socket.off("playersData", handleUpdatePlayerRoomEvent);
      socket.off("updateChat", handleUpdateChat);
      socket.off("roomData", handleUpdateRoomData);
      socket.off("gameStarted", handleStartGame);
      socket.off("room_full");
    };
  }, []);

  const copyRoomCode = () => {
    const actualRoomCode = room.id || room.room?.id || "";
    navigator.clipboard.writeText(actualRoomCode);
    toast({ title: t('lobby.copySuccess'), variant: "success" });
  };

  const handleSendMessage = (message) => {
    const user = getUserInfo();
    const data = {
      message: message,
      user: user,
      room_id: room.id || room.room?.id
    }
    // Emit event để backend broadcast cho tất cả mọi người
    socket.emit("newChat", data)
  };

  const handleConfirmRules = () => {
    const user = getUserInfo()
    const data = {room_id: room.id||room.room.id, topic_id: room.idTopic||room.room.idTopic, timePerRound: drawTime, user: user}
    socket.emit("startGame", data)
    setShowRulesPopup(false);
    console.log("Starting game with roomType:", roomType);
    toast({ title: `${t('lobby.startRoom')} ${roomType}`, variant: "success" });
    setIsGameStarted(true);
  };

  const handleLeaveRoom = () =>{
    const userInfo = getUserInfo();
    console.log(room)
    socket.emit("leave_room", { roomId: room.id||room.room.id, username: userInfo.username });
    navigate("/rooms")
  }
  const ROOM_TYPE_MAP = {
    public: t('lobby.public'),
    private: t('lobby.private'),
  };


  const emitPauseGame = () =>{
    console.log(room)
    socket.emit("pauseGame",{ roomId: room.id||room.room.id})
    setIsGameStarted(false);
  }

  const user = getUserInfo();
  const isHost = user?.username === (room.username || room.room?.username);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {!isGameStarted && <Navbar />}
      <main className="flex-1 w-full">
        <PageTransition>
          <div className="p-2 md:p-4">

      {/* RENDER POP-UP KHI STATE LÀ TRUE */}
      {showRulesPopup && (
        <PlayRulePopup 
          topic={topic}
          roomType={roomType}
          onConfirm={handleConfirmRules}
          onClose={() => setShowRulesPopup(false)}
        />
      )}
      <div className="h-[570px] flex flex-col">
        {/* Header */}
        <div className="mb-3 flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 px-4 md:px-6">
          <div className="flex flex-wrap justify-center items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold">{t('lobby.roomCode')}</h2>
            <code className="bg-primary/20 px-3 py-1.5 md:px-4 md:py-2 rounded-xl font-mono font-bold text-base md:text-lg">
              {room.id || room.room?.id || t('common.loading')}
            </code>
            <button
              onClick={copyRoomCode}
              className="p-2 hover:bg-muted rounded-xl transition-colors"
            >
              <Copy className="w-5 h-5" />
            </button>
          </div>
          
          <div className="flex flex-wrap justify-center gap-3">
            {!isGameStarted ? (
              <GameButton
                variant="success"
                size="md"
                disabled={players.length < 2 || !isHost}
                onClick={() => setShowRulesPopup(true)}
                className={!isHost ? "opacity-50 cursor-not-allowed" : ""}
              >
                <Play className="w-5 h-5 mr-2" />
                {isHost ? t('lobby.startGame') : t('lobby.waitingForHost')}
              </GameButton>
            ) : (
              isHost && (
                <GameButton
                  variant="pause"
                  size="md"
                  onClick={() => emitPauseGame()}
                >
                  <Pause className="w-5 h-5 mr-2" />
                  {t('lobby.pauseGame')}
                </GameButton>
              )
            )}
            <GameButton
              variant="danger"
              size="md"
              onClick={() => handleLeaveRoom()}
            >
              <LogOut className="w-5 h-5 mr-2" />
              {t('lobby.leave')}
            </GameButton>
          </div>
        </div>

        {isGameStarted ? (
          <Game 
            messages={messages} 
            onSendMessage={handleSendMessage}
            drawTime={drawTime}
            players={players}
            onLeave={() => {
              setIsGameStarted(false);
              navigate("/");
            }}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:items-stretch flex-1 min-h-0">
            {/* Main Content */}
          <div className="lg:col-span-2 flex flex-col gap-3 lg:h-full lg:min-h-0">
            {/* Players Grid */}
            <div className="game-card overflow-y-auto flex-1 min-h-0">
              <h3 className="text-xl font-bold mb-4">{t('lobby.players')}</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3">
                {players.map((player, index) => (
                  <PlayerCard key={index} name={player.username} points={player.point} />
                ))}
              </div>
            </div>
            {/* Game Settings */}
            <div className="game-card shrink-0">
              <h3 className="text-xl font-bold mb-4">{t('lobby.gameSettings')}</h3>
              
              <div className="space-y-5 px-2">
                <div className="flex justify-between gap-5">
                  <div className="flex flex-col w-1/2 justify-center gap-3">
                    <label className="block font-semibold">{t('lobby.topic')}</label>
                      <input
                        type="text"
                        value={topic.label}
                        readOnly
                        className="w-full h-[40px] px-3 border rounded-md bg-gray-100 cursor-not-allowed"
                      />
                  </div>

                  <div className="flex flex-col w-1/2 justify-center gap-3">
                    <label className="font-semibold flex-shrink-0">{t('lobby.roomType')}</label>
                    <input
                        type="text"
                        value={ROOM_TYPE_MAP[roomType] ?? ""}
                        readOnly
                        className="w-full h-[40px] px-3 border rounded-md bg-gray-100 cursor-not-allowed"
                      />
                  </div>
                </div>

                {/* <div>
                  <label className="block font-semibold mb-2">
                    Rounds: {rounds}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    value={rounds}
                    onChange={(e) => setRounds(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div> */}

                <div>
                  <label className="block font-semibold mb-2">
                    {t('lobby.drawTime')} {drawTime}s
                  </label>
                  <input
                    type="range"
                    min="30"
                    max="120"
                    step="10"
                    value={drawTime}
                    onChange={(e) => setDrawTime(Number(e.target.value))}
                    className="w-full accent-primary"
                  />
                </div>
              </div>
            </div>
          </div>
          {/* Chat */}
          <div className="lg:col-span-1 h-full min-h-0">
            <div className="h-full flex flex-col">
              <ChatBox
                messages={messages}
                onSendMessage={handleSendMessage}
                placeholder={t('lobby.chatPlaceholder')}
                typeBox={"chat"}
              />
            </div>
          </div>
          </div>
        )}
      </div>
          </div>
        </PageTransition>
      </main>
    </div>
  );
};

export default Lobby;
