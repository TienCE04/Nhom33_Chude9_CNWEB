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

function levenshteinDistance(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];

  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

function isCloseAnswer(guess, keyword) {
  if (!guess || !keyword) return false;
  const cleanGuess = guess.trim().toLowerCase();
  const cleanKeyword = keyword.trim().toLowerCase();
  
  if (cleanGuess === cleanKeyword) return false;

  const distance = levenshteinDistance(cleanGuess, cleanKeyword);
  const threshold = cleanKeyword.length <= 5 ? 1 : 2;
  
  return distance <= threshold;
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
      clearTimeout(countdownIntervals.get(room_id));
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
    currentRoomData.idTopic,
    await players.getTmpPlayers(room_id),
    await players.getTmpKeywords(room_id),
    topic_type
  );
  console.log(`New round in room ${room_id}: Drawer - ${drawer_username}, Keyword - ${keyword}`);
  console.log("Current room data:", currentRoomData);

  // Cập nhật số từ đã vẽ cho người vẽ
  if (drawer_username) {
    await playerMongo.incrementWordsDrawn(drawer_username);
  }

  const duration = currentRoomData.time;
  const endTime = Date.now() + (duration + 1) * 1000;

  await players.setRoundState(room_id, {
    drawer_username,
    keyword,
    endTime,
    duration,
  });

  // 1. Gửi keyword RIÊNG cho người vẽ
  const drawerSocketId = socketUser.getSocketIdByUsername(drawer_username);
  if (drawerSocketId) {
    io.to(drawerSocketId).emit("keyword", { drawer_username, keyword });
  }

  // 2. Gửi thông báo vòng mới cho CẢ PHÒNG (Không kèm keyword)
  // Gửi dạng Object để FE dễ bóc tách
  io.to(room_id).emit("newRound", { drawer_username, endTime, duration });

  // 3. Quản lý Timeout để tránh lặp luồng
  if (countdownIntervals.has(room_id)) {
    clearTimeout(countdownIntervals.get(room_id));
  }

  const timeoutId = setTimeout(async () => {
    const roundState = await players.getRoundState(room_id);
    io.to(room_id).emit("roundEndedTimeout", { keyword: roundState.keyword });
    
    // Đợi 5s hiển thị kết quả rồi mới sang vòng tiếp theo
    const nextRoundId = setTimeout(async () => {
       const freshRoom = await room.getRoomById(room_id);
       if (freshRoom?.room?.status === "playing") {
          await runRoundLogic(io, room_id, topic_type, freshRoom.room);
       }
    }, 5000);

    countdownIntervals.set(room_id, nextRoundId); // LƯU ID VÒNG KẾ TIẾP
  }, (duration + 1) * 1000);

  countdownIntervals.set(room_id, timeoutId); // LƯU ID VÒNG HIỆN TẠI [QUAN TRỌNG]
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

  await runRoundLogic(io, room_id, topic_type, roomData.room);
}

/* ==================== COUNTDOWN ==================== */
function startCountdown(io, room_id, duration = 62) {
  if (countdownIntervals.has(room_id)) {
    clearInterval(countdownIntervals.get(room_id));
    countdownIntervals.delete(room_id);
  }

  let timeLeft = duration;
  const countdownInterval = setInterval(async () => {
    timeLeft--;
    io.to(room_id).emit("countdown", { timeLeft });

    if (timeLeft <= 0) {
      clearInterval(countdownInterval);
      countdownIntervals.delete(room_id);

      const currentRoundState = await players.getRoundState(room_id);
      io.to(room_id).emit("roundEndedTimeout", { 
        keyword: currentRoundState.keyword 
      });
    }
  }, 1000);

  countdownIntervals.set(room_id, countdownInterval);
}

/* ==================== END GAME ==================== */
async function endGame(io, room_id) {
  if (countdownIntervals.has(room_id)) {
    clearTimeout(countdownIntervals.get(room_id));
    countdownIntervals.delete(room_id);
  }

  const top3 = await players.getTop3(room_id);
  io.to(room_id).emit("top3", top3);

  for (let i = 0; i < top3.length; i++) {
    if (top3[i] && top3[i].username) {
      console.log(`Cập nhật thành tích cho: ${top3[i].username} - Hạng: ${i + 1}`);
      await playerMongo.updateAchievement(top3[i].username, i + 1);
    }
  }

  await playerMongo.updatePlayerRank(await playerMongo.getAllPlayer());

  io.to(room_id).emit(
    "playersData",
    await players.getRankByRoomId(room_id)
  );
  io.to(room_id).emit("endGame");

  await players.resetPlayerScore(room_id);
  await room.setStatus(room_id, "waiting");
}
// async function endGame(io, room_id) {
//   if (countdownIntervals.has(room_id)) {
//     clearTimeout(countdownIntervals.get(room_id));
//     countdownIntervals.delete(room_id);
//   }

//   // 1. Lấy dữ liệu bảng điểm cuối cùng TRƯỚC khi reset
//   const finalRank = await players.getRankByRoomId(room_id);
//   const top3 = await players.getTop3(room_id);

//   // 2. Gửi dữ liệu điểm số cuối cùng cho FE thấy
//   io.to(room_id).emit("top3", top3);
//   io.to(room_id).emit("playersData", finalRank); // Gửi điểm số thật lúc này

//   // 3. Cập nhật thành tích vào MongoDB
//   for (let i = 0; i < top3.length; i++) {
//     if (top3[i]?.username) {
//       await playerMongo.updateAchievement(top3[i].username, i + 1);
//     }
//   }
//   await playerMongo.updatePlayerRank();

//   // 4. Đặt trạng thái phòng về waiting
//   await room.setStatus(room_id, "waiting");
//   io.to(room_id).emit("roomData", await room.getRoomById(room_id));

//   // 5. CHỜ một khoảng thời gian (ví dụ 5s) để người chơi xem bảng điểm rồi mới reset về 0
//   setTimeout(async () => {
//     await players.resetPlayerScore(room_id);
//     // Sau khi reset mới gửi bảng điểm 0 về để chuẩn bị ván mới
//     const resetRank = await players.getRankByRoomId(room_id);
//     io.to(room_id).emit("playersData", resetRank);
//     console.log(`Scores reset for room ${room_id} after delay.`);
//   }, 5000); 
// }

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

    io.to(room_id).emit("playersData", await players.getRankByRoomId(room_id));
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
    console.log(`Received answer in room ${room_id} from ${username}: ${guess}`);

    const roundState = await players.getRoundState(room_id);
    console.log("Current round state:", roundState);

    // Nếu người chơi là người vẽ, không được đoán
    if (roundState.drawer_username === username) return;

    // Nếu người chơi đã đoán đúng trước đó, bỏ qua
    if (roundState.answered.includes(username)) return;

    // Tăng tổng số lần đoán (bất kể đúng sai)
    await playerMongo.incrementTotalGuesses(username);

    // Server kiểm tra đoán đúng
    if (guess.toLowerCase() === roundState.keyword?.toLowerCase()) {
      console.log(`Player ${username} guessed correctly in room ${room_id}`);
      let addPoint = await players.getAddPoint(room_id);

      // Cập nhật điểm cho người đoán
      await players.updatePlayerScore(room_id, username, addPoint);

      // Cập nhật điểm cho người vẽ
      await players.updatePlayerScore(room_id, roundState.drawer_username, 2);

      // Giảm điểm cộng cho lượt đoán tiếp theo
      if (addPoint > 2) {
        await players.updateAddPoint(room_id, addPoint - 1);
      }

      // Thêm người chơi vào danh sách đã đoán đúng
      await players.addAnsweredPlayer(room_id, username);

      // Cập nhật số từ đã đoán đúng cho người chơi
      await playerMongo.incrementWordsGuessed(username);

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
          clearTimeout(countdownIntervals.get(room_id));
          countdownIntervals.delete(room_id);
        }

        // Chờ 3 giây để người chơi xem từ khóa, sau đó bắt đầu vòng mới
        setTimeout(async () => {
          const roomData = await room.getRoomById(room_id);
          console.log("Room data before starting new round:", roomData);
          if (!roomData.success || !roomData.room) return;
          
          const current_topic_type = roomData.room.topic_type;

          // Kiểm tra điều kiện kết thúc game
          const maxPoint = await players.findMaxScore(room_id);
          console.log(`Max point in room ${room_id} is ${maxPoint}`);
          if (maxPoint >= roomData.room.maxScore) {
            await endGame(io, room_id);
          } else {
            await startRound(io, room_id, current_topic_type);
          }
        }, 3000);
      }
    } else {
      const isClose = isCloseAnswer(guess, roundState.keyword);
      io.to(room_id).emit("wrongGuess", { username, guess, isClose });
    }
    // startRound(io, room_id, topic_id);
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
    const username = socketUser.getUsernameBySocket(socket.id);
    
    // 1. Lấy từ khóa từ trạng thái vòng chơi hiện tại
    const roundState = await players.getRoundState(room_id);
    if (!roundState?.keyword) return;

    // Validate: Chỉ người vẽ mới được yêu cầu gợi ý
    if (roundState.drawer_username !== username) return;

    const keyword = roundState.keyword;
    const chars = keyword.split("");

    let hint = "";

    // Gợi ý cấp 1: Hiển thị dạng gạch dưới "_", giữ nguyên dấu cách
    if (hintLevel === 1) {
      hint = chars.map(char => (char === " " ? " " : "_")).join(" ");
    } 
    
    // Gợi ý cấp 2: Hiển thị chữ cái đầu tiên (của mỗi từ hoặc toàn bộ từ khóa)
    else if (hintLevel === 2) {
      hint = chars.map((char, index) => {
        if (char === " ") return " ";
        // Hiện chữ cái đầu tiên của từ khóa
        return index === 0 ? char : "_";
      }).join(" ");
    } 
    
    // Gợi ý cấp 3: Hiển thị thêm 1 chữ cái bất kỳ (ở đây lấy vị trí giữa)
    else if (hintLevel === 3) {
      let midIndex = Math.floor(chars.length / 2);
      
      // Nếu vị trí giữa là khoảng trắng hoặc là vị trí đầu tiên, tìm vị trí hợp lệ khác
      if (chars[midIndex] === " " || midIndex === 0) {
        let found = false;
        // Tìm sang phải
        for (let i = midIndex + 1; i < chars.length; i++) {
          if (chars[i] !== " ") {
            midIndex = i;
            found = true;
            break;
          }
        }
        // Nếu không thấy bên phải, tìm sang trái (tránh index 0)
        if (!found) {
          for (let i = midIndex - 1; i > 0; i--) {
            if (chars[i] !== " ") {
              midIndex = i;
              found = true;
              break;
            }
          }
        }
      }

      hint = chars.map((char, index) => {
        if (char === " ") return " ";
        // Hiện chữ đầu và một chữ ở giữa
        return (index === 0 || index === midIndex) ? char : "_";
      }).join(" ");
    }

    if (hint) {
      io.to(room_id).emit("hint", hint); // Gửi gợi ý cho cả phòng
    }
    console.log(`Hint level ${hintLevel} for room ${room_id}: ${hint}`);
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
      clearTimeout(countdownIntervals.get(roomId));
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
