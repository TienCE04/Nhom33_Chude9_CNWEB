import * as room from "../controller/roomController.js";
import * as players from "../service/playerRedisService.js";
import * as playerMongo from "../models/player.js";
import * as gamePlay from "../service/gamePlayService.js";
import * as socketUser from "../socket/socketUserService.js";

const roomIntervals = new Map();
const countdownIntervals = new Map();

// --- Hàm kiểm tra và dừng game khi không đủ người chơi ---
async function checkAndStopGame(io, room_id, curPlayers) {
  if (curPlayers < 2) {
    await room.setStatus(room_id, "waiting");

    // Dừng interval logic game (63s)
    if (roomIntervals.has(room_id)) {
      clearInterval(roomIntervals.get(room_id));
      roomIntervals.delete(room_id);
    }

    // Dừng interval đếm ngược UI (nếu đang chạy)
    if (countdownIntervals.has(room_id)) {
      clearInterval(countdownIntervals.get(room_id));
      countdownIntervals.delete(room_id);
    }

    io.to(room_id).emit("roomData", await room.getRoomById(room_id));
    io.to(room_id).emit("playersData", await players.getRankByRoomId(room_id));
    io.emit("rooms", await room.listRooms());
  }
}

// -------------------- START ROUND --------------------
async function startRound(io, room_id, topic_type) {
  const roomData = await room.getRoomById(room_id);
  if (!roomData) return;

  console.log("startRound", "start");

  await players.initRoundState(room_id);
  await players.resetAddPoint(room_id);
  await players.resetAnswered(room_id); // Reset danh sách người đã đoán đúng

  // Hàm thực hiện logic 1 vòng chơi
  async function runRoundLogic(currentRoomData) {
    // Lấy người vẽ và từ khóa
    const { drawer_username, keyword } = await gamePlay.handler(
      room_id,
      currentRoomData.topic_id,
      await players.getTmpPlayers(room_id),
      await players.getTmpKeywords(room_id),
      topic_type
    );

    //  Lưu trạng thái Round
    await players.setRoundState(room_id, {
      drawer_username,
      keyword,
      timeLeft: 62,
    });

    // Emit sự kiện
    io.to(room_id).emit("roomData", currentRoomData);
    // Gửi từ khóa cho người vẽ, null cho người đoán
    io.to(room_id).emit("keyword", { drawer_username, keyword: null });
    io.to(room_id).emit("newRound");

    // Bắt đầu đếm ngược thời gian trong Round
    startCountdown(io, room_id);
  }

  // Xóa interval cũ nếu có để tránh xung đột timer khi gọi startRound sớm
  if (roomIntervals.has(room_id)) {
    clearInterval(roomIntervals.get(room_id));
    roomIntervals.delete(room_id);
  }

  await runRoundLogic(roomData); // Chạy vòng đầu tiên

  // Thiết lập Interval 63s cho các vòng chơi tiếp theo
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

    // Chuyển vòng chơi
    await runRoundLogic(currentRoomData);
  }, 63 * 1000);

  roomIntervals.set(room_id, intervalID);
}

// hàm đếm ngược
function startCountdown(io, room_id) {
  // Dừng interval đếm ngược cũ nếu có
  if (countdownIntervals.has(room_id)) {
    clearInterval(countdownIntervals.get(room_id));
    countdownIntervals.delete(room_id);
  }

  let timeLeft = 62;
  const countdownInterval = setInterval(async () => {
    timeLeft--;
    io.to(room_id).emit("countdown", { timeLeft });

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      countdownIntervals.delete(room_id); // Xóa khỏi Map khi hết giờ
    }
  }, 1000);

  // Lưu interval mới vào Map
  countdownIntervals.set(room_id, countdownInterval);
}

// kết thúc game
async function endGame(io, room_id) {
  // Dừng interval đếm ngược UI
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

  io.to(room_id).emit("playersData", await players.getRankByRoomId(room_id));
}

// gắn các sự kiện socket
function attachSocketEvents(io, socket) {
  //Join Room
  socket.on("joinRoom", async (data) => {
    const { room_id, username } = data;
    if (!room_id || !username) return;

    const roomData = await room.getRoomById(room_id);
    if (!roomData) return;

    socket.join(room_id);

    await players.updatePlayerJoin(room_id, username);

    //gắn socketId với username
    socketUser.bindSocketToUser(socket.id, username);

    const playersData = await players.getRankByRoomId(room_id);
    io.to(room_id).emit("playersData", playersData);

    io.to(room_id).emit("roomData", roomData);

    io.emit("rooms", await room.listRooms());

    if (roomData.status === "playing") {
      const roundState = await players.getRoundState(room_id);
      socket.emit("syncGameState", roundState);
    }
  });

  //startGame
  socket.on("startGame", async (data) => {
    const { room_id, topic_type } = data;
    const roomData = await room.getRoomById(room_id);

    if (!roomData || roomData.cur_players < 2) {
      socket.emit("notEnoughPlayers");
      return;
    }

    await room.setStatus(room_id, "playing");
    await players.resetPlayerScore(room_id);
    await players.resetAddPoint(room_id);

    // Cần reset lại danh sách người vẽ tạm thời
    const allPlayers = await players.getPlayersByRoomId(room_id);
    await players.setTmpPlayers(room_id, allPlayers);

    startRound(io, room_id, topic_type);
  });

  // correctAnswer
  socket.on("correctAnswer", async (data) => {
    const { room_id, username, drawer_username, topic_type } = data;
    if (!room_id || !username || !drawer_username) return;

    const roundState = await players.getRoundState(room_id);
    // Kiểm tra nếu người chơi đã đoán đúng, bỏ qua
    if (roundState.answered.includes(username)) {
      return;
    }

    let addPoint = await players.getAddPoint(room_id);

    // Cập nhật điểm
    await players.updatePlayerScore(room_id, username, addPoint);
    await players.updatePlayerScore(room_id, drawer_username, 2);

    // Giảm điểm cộng
    if (addPoint > 2) {
      await players.updateAddPoint(room_id, addPoint - 1);
    }

    // Thêm người chơi vào danh sách đã đoán đúng
    await players.addAnsweredPlayer(room_id, username);

    // Emit thông báo đoán đúng và cập nhật bảng điểm
    io.to(room_id).emit("correctGuess", { username, points: addPoint });
    const playersData = await players.getRankByRoomId(room_id);
    io.to(room_id).emit("playersData", playersData);

    // LOGIC KẾT THÚC VÒNG SỚM
    if (await players.everyoneAnswered(room_id)) {
      console.log(
        `All players in ${room_id} guessed correctly. Ending round early.`
      );

      // Lấy từ khóa để hiển thị
      const currentRoundState = await players.getRoundState(room_id);

      // Gửi sự kiện kết thúc sớm, hiển thị từ khóa
      io.to(room_id).emit("allGuessed", { keyword: currentRoundState.keyword });

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
        // Đảm bảo có topic_type để truyền vào startRound
        const current_topic_type = topic_type || roomData.topic_type;

        // Kiểm tra điều kiện kết thúc game trước khi chuyển vòng
        const maxPoint = await players.findMaxScore(room_id);
        if (maxPoint >= roomData.max_scores) {
          await endGame(io, room_id);
        } else {
          await startRound(io, room_id, current_topic_type);
        }
      }, 3000);
    }
  });

  // ---------------- LEAVE ROOM ----------------
  socket.on("leaveRoom", async (data) => {
    const { room_id, username } = data;
    if (!room_id || !username) return;

    socket.leave(room_id);

    const curPlayers = await players.updatePlayerLeave(room_id, username);

    // Cập nhật danh sách người vẽ tạm thời khi người chơi rời đi
    //debug
    await players.removeTmpPlayer(room_id, username);

    await checkAndStopGame(io, room_id, curPlayers);

    if (curPlayers >= 2) {
      io.to(room_id).emit("roomData", await room.getRoomById(room_id));
      io.to(room_id).emit(
        "playersData",
        await players.getRankByRoomId(room_id)
      );
      io.emit("rooms", await room.listRooms());
    }
  });

  // ---------------- CANVAS SYNC ----------------
  socket.on("canvas-data", (data) => {
    const { room_id, snapshot } = data;
    socket.to(room_id).emit("update-canvas", { snapshot });
  });

  // ---------------- CHAT ----------------
  socket.on("newChat", async (data) => {
    const { room_id, username, chat } = data;
    if (!chat) return;
    io.to(room_id).emit("newChat", { username, chat });
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

  // ---------------- DISCONNECT ----------------
  socket.on("disconnect", async () => {
    const roomsOfSocket = Array.from(socket.rooms).filter(
      (r) => r !== socket.id
    );

    for (const room_id of roomsOfSocket) {
      //debug
      const username = socketUser.getUsernameBySocket(socket.id);

      if (username) {
        const curPlayers = await players.updatePlayerLeave(room_id, username);

        //Cập nhật danh sách người vẽ tạm thời khi disconnect
        await players.removeTmpPlayer(room_id, username);

        await checkAndStopGame(io, room_id, curPlayers);
      }
    }

    // Xóa user khoi socket
     socketUser.removeSocket(socket.id);
  });
}

export { attachSocketEvents };
