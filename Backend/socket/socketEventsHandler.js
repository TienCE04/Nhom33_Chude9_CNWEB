const room = require("../models/room");
const players = require("../service/playerRedisService");
const playerMongo = require("../models/player");
const gamePlay = require("../service/gamePlayService");
const socketUser = require("../socket/socketUserService.js");

const roomIntervals = new Map();
const countdownIntervals = new Map();

/* ==================== HELPER ==================== */
function getCurrentPlayers(io, roomId) {
  const roomSet = io.sockets.adapter.rooms.get(roomId);
  return roomSet ? roomSet.size : 0;
}

/* ==================== CHECK STOP GAME ==================== */
async function checkAndStopGame(io, room_id, curPlayers) {
  if (curPlayers < 2) {
    await room.setStatus(room_id, "waiting");

    if (roomIntervals.has(room_id)) {
      clearInterval(roomIntervals.get(room_id));
      roomIntervals.delete(room_id);
    }

    if (countdownIntervals.has(room_id)) {
      clearInterval(countdownIntervals.get(room_id));
      countdownIntervals.delete(room_id);
    }

    // 🔥 UPDATE REDIS
    await room.updateCurrentPlayers(room_id, curPlayers);

    io.to(room_id).emit("roomData", await room.getRoomById(room_id));
    io.to(room_id).emit(
      "playersData",
      await players.getRankByRoomId(room_id)
    );

    io.emit("rooms", await room.listRooms());
  }
}

/* ==================== ROUND LOGIC ==================== */
async function runRoundLogic(io, room_id, topic_type, currentRoomData) {
  const { drawer_username, keyword } = await gamePlay.handler(
    room_id,
    currentRoomData.room?.idTopic || currentRoomData.idTopic,
    await players.getTmpPlayers(room_id),
    await players.getTmpKeywords(room_id),
    topic_type
  );
  console.log(`New round in room ${room_id}: Drawer - ${drawer_username}, Keyword - ${keyword}`);

  await players.setRoundState(room_id, {
    drawer_username,
    keyword,
    timeLeft: 62,
  });

  io.to(room_id).emit("roomData", await room.getRoomById(room_id));

  io.to(room_id).emit("keyword", {
    drawer_username,
    keyword: null,
  });

  const drawerSocketId = socketUser.getSocketIdByUsername(drawer_username);
  if (drawerSocketId) {
    io.to(drawerSocketId).emit("keyword", {
      drawer_username,
      keyword: keyword, // Chỉ người vẽ mới nhận được từ khóa này
    });
  }

  io.to(room_id).emit("newRound");

  startCountdown(io, room_id);
}

/* ==================== START ROUND ==================== */
async function startRound(io, room_id, topic_type) {
  const roomData = await room.getRoomById(room_id);
  if (!roomData) return;

  await players.initRoundState(room_id);
  await players.resetAddPoint(room_id);
  await players.resetAnswered(room_id);

  if (roomIntervals.has(room_id)) {
    clearInterval(roomIntervals.get(room_id));
    roomIntervals.delete(room_id);
  }

  await runRoundLogic(io, room_id, topic_type, roomData);

  const intervalID = setInterval(async () => {
    const currentRoomData = await room.getRoomById(room_id);
    if (!currentRoomData || currentRoomData.status !== "playing") {
      clearInterval(intervalID);
      roomIntervals.delete(room_id);
      return;
    }

    const maxPoint = await players.findMaxScore(room_id);
    if (maxPoint >= currentRoomData.max_scores) {
      clearInterval(intervalID);
      roomIntervals.delete(room_id);
      await endGame(io, room_id);
      return;
    }

    await runRoundLogic(io, room_id, topic_type, currentRoomData);
  }, roomData.time * 1000);

  roomIntervals.set(room_id, intervalID);
}

/* ==================== COUNTDOWN ==================== */
function startCountdown(io, room_id) {
  if (countdownIntervals.has(room_id)) {
    clearInterval(countdownIntervals.get(room_id));
    countdownIntervals.delete(room_id);
  }

  let timeLeft = 62;
  const countdownInterval = setInterval(() => {
    timeLeft--;
    io.to(room_id).emit("countdown", { timeLeft });

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      countdownIntervals.delete(room_id);
    }
  }, 1000);

  countdownIntervals.set(room_id, countdownInterval);
}

/* ==================== END GAME ==================== */
async function endGame(io, room_id) {
  if (countdownIntervals.has(room_id)) {
    clearInterval(countdownIntervals.get(room_id));
    countdownIntervals.delete(room_id);
  }

  const top3 = await players.getTop3(room_id);
  io.to(room_id).emit("top3", top3);

  for (let i = 0; i < top3.length; i++) {
    await playerMongo.updateAchievement(top3[i], i + 1);
  }

  await playerMongo.updatePlayerRank(await playerMongo.getAllPlayer());
  await players.resetPlayerScore(room_id);
  await room.setStatus(room_id, "waiting");

  io.to(room_id).emit(
    "playersData",
    await players.getRankByRoomId(room_id)
  );
}

/* ==================== SOCKET EVENTS ==================== */
function attachSocketEvents(io, socket) {

  /* -------- CREATE ROOM -------- */
  socket.on("create_room", async ({ roomData, user }) => {
    socket.join(roomData.id);

    await players.updatePlayerJoin(roomData.id, user);

    const curPlayers = getCurrentPlayers(io, roomData.id);
    await room.updateCurrentPlayers(roomData.id, curPlayers);

    io.to(roomData.id).emit("room_created", roomData);
    io.to(roomData.id).emit(
      "playersData",
      await players.getRankByRoomId(roomData.id)
    );

    io.to(roomData.id).emit("roomData", await room.getRoomById(roomData.id));

    io.emit("rooms_updated");
  });

  /* -------- JOIN ROOM -------- */
  socket.on("join_room", async ({ roomId, user }) => {
    if (!roomId || !user) return;

    const roomResult = await room.getRoomById(roomId);
    if (roomResult.success && roomResult.room) {
      const currentPlayersCount = getCurrentPlayers(io, roomId);
      if (currentPlayersCount >= roomResult.room.maxPlayer) {
        socket.emit("room_full", {
          message: "Phòng chơi đã đầy, vui lòng tham gia phòng chơi khác",
        });
        return;
      }
    }

    socket.join(roomId);
    socketUser.bindSocketToUser(socket.id, user.username);

    await players.updatePlayerJoin(roomId, user);

    const curPlayers = getCurrentPlayers(io, roomId);
    await room.updateCurrentPlayers(roomId, curPlayers);

    io.to(roomId).emit(
      "playersData",
      await players.getRankByRoomId(roomId)
    );

    io.to(roomId).emit("roomData", await room.getRoomById(roomId));

    const roomData = await room.getRoomById(roomId);
    if (roomData.status === "playing") {
      socket.emit(
        "syncGameState",
        await players.getRoundState(roomId)
      );
    }

    io.emit("rooms_updated");
  });

  /* -------- START GAME -------- */
  socket.on("startGame", async ({ room_id, topic_id, timePerRound }) => {
    const username = socketUser.getUsernameBySocket(socket.id);
    const roomResult = await room.getRoomById(room_id);
    
    if (!roomResult.success || !roomResult.room) return;

    // Validate Host
    if (roomResult.room.username !== username) {
      return;
    }

    const curPlayers = getCurrentPlayers(io, room_id);

    if (curPlayers < 2) {
      socket.emit("notEnoughPlayers");
      return;
    }

    await room.setTime(room_id, timePerRound);
    await room.setStatus(room_id, "playing");
    await room.updateCurrentPlayers(room_id, curPlayers);

    await players.resetPlayerScore(room_id);
    await players.resetAddPoint(room_id);

    const allPlayers = await players.getPlayersByRoomId(room_id);
    await players.setTmpPlayers(room_id, allPlayers);

    io.to(room_id).emit("playersData", allPlayers);
    io.to(room_id).emit("roomData", await room.getRoomById(room_id));

    io.to(room_id).emit("gameStarted", {
      room_id,
      topic_id,
      players: allPlayers,
    });

    startRound(io, room_id, topic_id);
  });

  // Người chơi gửi câu trả lời
  socket.on("sendAnswer", async (data) => {
    const { room_id, username, guess } = data;
    if (!room_id || !username || !guess) return;

    const roundState = await players.getRoundState(room_id);

    // Nếu người chơi đã đoán đúng trước đó, bỏ qua
    if (roundState.answered.includes(username)) return;

    // Server kiểm tra đoán đúng
    if (guess.toLowerCase() === roundState.keyword.toLowerCase()) {
      let addPoint = await players.getAddPoint(room_id);

      // Cập nhật điểm cho người đoán
      await players.updatePlayerScore(room_id, username, addPoint);

      // Cập nhật điểm cho người vẽ
      await players.updatePlayerScore(room_id, roundState.drawer, 2);

      // Giảm điểm cộng cho lượt đoán tiếp theo
      if (addPoint > 2) {
        await players.updateAddPoint(room_id, addPoint - 1);
      }

      // Thêm người chơi vào danh sách đã đoán đúng
      await players.addAnsweredPlayer(room_id, username);

      // Emit thông báo đoán đúng và cập nhật bảng xếp hạng
      io.to(room_id).emit("correctGuess", { username, points: addPoint });
      const playersData = await players.getRankByRoomId(room_id);
      io.to(room_id).emit("playersData", playersData);

      // Kiểm tra kết thúc vòng sớm
      if (await players.everyoneAnswered(room_id)) {
        console.log(
          `All players in ${room_id} guessed correctly. Ending round early.`
        );

        // Lấy từ khóa hiển thị
        const currentRoundState = await players.getRoundState(room_id);
        io.to(room_id).emit("allGuessed", {
          keyword: currentRoundState.keyword,
        });

        // Dừng interval 63s hiện tại
        if (roomIntervals.has(room_id)) {
          clearInterval(roomIntervals.get(room_id));
          roomIntervals.delete(room_id);
        }

        // Dừng interval đếm ngược UI
        if (countdownIntervals.has(room_id)) {
          clearInterval(countdownIntervals.get(room_id));
          countdownIntervals.delete(room_id);
        }

        // Chờ 3 giây để người chơi xem từ khóa, sau đó bắt đầu vòng mới
        setTimeout(async () => {
          const roomData = await room.getRoomById(room_id);
          const current_topic_type = roomData.topic_type;

          // Kiểm tra điều kiện kết thúc game
          const maxPoint = await players.findMaxScore(room_id);
          if (maxPoint >= roomData.max_scores) {
            await endGame(io, room_id);
          } else {
            await startRound(io, room_id, current_topic_type);
          }
        }, 3000);
      }
    }
    startRound(io, room_id, topic_id);
  });

  /* -------- LEAVE ROOM -------- */
  socket.on("leave_room", async ({ roomId, username }) => {
    if (!roomId || !username) return;

    socket.leave(roomId);

    await players.updatePlayerLeave(roomId, username);
    await players.removeTmpPlayer(roomId, username);

    const curPlayers = getCurrentPlayers(io, roomId);
    await room.updateCurrentPlayers(roomId, curPlayers);

    await checkAndStopGame(io, roomId, curPlayers);

    io.to(roomId).emit("roomData", await room.getRoomById(roomId));

    io.emit("rooms_updated");
  });

  // ---------------- CANVAS SYNC ----------------
  socket.on("canvas-data", (data) => {
    const { room_id, snapshot } = data;
    socket.to(room_id).emit("update-canvas", { snapshot });
  });

  // ---------------- CHAT ----------------
  socket.on("newChat", async (data) => {
    const { room_id, user, message } = data;
    const username = user.username;
    if (!message) return;
    io.to(room_id).emit("updateChat", { username, message });
  });

  // ---------------- HINT REQUEST ----------------
  socket.on("requestHint", async ({ room_id, hintLevel }) => {
    const roundState = await players.getRoundState(room_id);
    if (!roundState?.keyword) return;

    const keyword = roundState.keyword;

    const hint =
      hintLevel === 1
        ? keyword.slice(0, 1)
        : hintLevel === 2
        ? keyword.slice(0, 2)
        : null;

    if (!hint) return;

    io.to(room_id).emit("hint", hint);
  });

  /* -------- PAUSE GAME -------- */
  socket.on("pauseGame", async ({ roomId }) => {
    const username = socketUser.getUsernameBySocket(socket.id);
    const roomResult = await room.getRoomById(roomId);

    if (!roomResult.success || !roomResult.room) return;

    // Validate Host
    if (roomResult.room.username !== username) return;

    await room.setStatus(roomId, "waiting");
    
    // Clear intervals
    if (roomIntervals.has(roomId)) {
      clearInterval(roomIntervals.get(roomId));
      roomIntervals.delete(roomId);
    }
    if (countdownIntervals.has(roomId)) {
      clearInterval(countdownIntervals.get(roomId));
      countdownIntervals.delete(roomId);
    }

    io.to(roomId).emit("gamePaused");
    io.to(roomId).emit("roomData", await room.getRoomById(roomId));
  });

  /* -------- DISCONNECT -------- */
  socket.on("disconnect", async () => {
    const username = socketUser.getUsernameBySocket(socket.id);
    if (!username) return;

    for (const room_id of socket.rooms) {
      if (room_id === socket.id) continue;

      await players.updatePlayerLeave(room_id, username);
      await players.removeTmpPlayer(room_id, username);

      const curPlayers = getCurrentPlayers(io, room_id);
      await room.updateCurrentPlayers(room_id, curPlayers);

      await checkAndStopGame(io, room_id, curPlayers);

      io.to(room_id).emit("roomData", await room.getRoomById(room_id));
    }

    socketUser.removeSocket(socket.id);
  });
}

module.exports = { attachSocketEvents };
