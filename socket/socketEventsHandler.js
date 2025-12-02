import * as room from "../controller/roomController.js";
import * as players from "../service/playerRedisService.js";
import * as playerMongo from "../models/player.js";


const roomIntervals = new Map();

function attachSocketEvents(io, socket) {

  //join phòng
  //lúc này chưa chơi nhưng vẫn có thể hiện thị cho các người khác đang online biết về số thông tin phòng đó
  socket.on("joinRoom", async ({ room_id, username }) => {
    const roomData = await room.getRoomById(room_id);
    socket.join(room_id);

    await players.updatePlayerJoin(room_id, username);

    const playersData = await players.getRankByRoomId(room_id);
    io.to(room_id).emit("playersData", playersData);
    io.to(room_id).emit("roomData", roomData);

    //cập nhật lại mỗi khi có người join vào phòng
    const rooms = await room.getAllRoom();
    io.emit("rooms", rooms);

    if (roomData.status === "playing") {
      const roundState = await players.getRoundState(room_id); 
      socket.emit("syncGameState", roundState);
    }
  });

  socket.on("leaveRoom", async ({ room_id, username }) => {
    socket.leave(room_id);

    let cur_players = await players.updatePlayerLeave(room_id, username);

    if (cur_players < 2) {
      await room.setStatus(room_id, "waiting");
      if (roomIntervals.has(room_id)) {
        clearInterval(roomIntervals.get(room_id));
        roomIntervals.delete(room_id);
      }
    }

    const roomData = await room.getRoomById(room_id);
    io.to(room_id).emit("roomData", roomData);

    const playersData = await players.getRankByRoomId(room_id);
    io.to(room_id).emit("playersData", playersData);

    const rooms = await room.getAllRoom();
    io.emit("rooms", rooms);
  });

  socket.on("startGame", async ({ room_id, topic_type }) => {
    const roomData = await room.getRoomById(room_id);
    if (roomData.cur_players < 2) {
      socket.emit("notEnoughPlayers");
      return;
    }

    await room.setStatus(room_id, "playing");
    await players.resetPlayerScore(room_id);
    await players.resetAddPoint(room_id);

    startRound(io, room_id, topic_type);
  });

  // correct_answer
  socket.on("correctAnswer", async ({ room_id, username, drawer_username }) => {
    let addPoint = await players.getAddPoint(room_id);

    await players.updatePlayerScore(room_id, username, addPoint);
    await players.updatePlayerScore(room_id, drawer_username, 2);

    if (addPoint > 2) {
      addPoint--;
      await players.updateAddPoint(room_id, addPoint);
    }

    const playersData = await players.getRankByRoomId(room_id);
    io.to(room_id).emit("playersData", playersData);
  });

  // canvas update
  socket.on("canvas-data", ({ room_id, snapshot }) => {
    socket.to(room_id).emit("update-canvas", { snapshot });
  });

  // chat
  socket.on("newChat", ({ room_id, username, chat }) => {
    io.to(room_id).emit("newChat", { username, chat });
  });
}


async function startRound(io, room_id, topic_type) {
  const roomData = await room.getRoomById(room_id);

  await players.initRoundState(room_id); 

  async function roundPlay() {
    const roomData = await room.getRoomById(room_id);
    io.to(room_id).emit("roomData", roomData);

    await players.resetAddPoint(room_id);

    let topic_id = roomData.topic_id;
    const { drawer_username, keyword } = await gamePlay.handler(
      room_id,
      topic_id,
      await players.getTmpPlayers(room_id),
      await players.getTmpKeywords(room_id),
      topic_type
    );

    // save round state
    await players.setRoundState(room_id, { drawer_username, keyword, timeLeft: 62 });

    io.to(room_id).emit("keyword", { drawer_username, keyword: null }); 
    io.to(room_id).emit("newRound");

    // start countdown
    startCountdown(io, room_id, keyword);
  }

  roundPlay();
}

// ------------------- COUNTDOWN -------------------
function startCountdown(io, room_id, keyword) {
  let timeLeft = 62;

  if (roomIntervals.has(room_id)) {
    clearInterval(roomIntervals.get(room_id));
  }

  const intervalID = setInterval(async () => {
    timeLeft--;
    io.to(room_id).emit("countdown", { timeLeft });

    // hint
    if (timeLeft === 50) io.to(room_id).emit("hint", keyword.slice(0, 1));
    if (timeLeft === 30) io.to(room_id).emit("hint", keyword.slice(0, 2));

    if (timeLeft <= 0 || await players.everyoneAnswered(room_id)) {
      clearInterval(intervalID);
      roomIntervals.delete(room_id);

      // check max score
      let maxPlayerPoint = await players.findMaxScore(room_id);
      const roomData = await room.getRoomById(room_id);

      if (roomData.max_scores <= maxPlayerPoint || roomData.cur_players < 2) {
        endGame(io, room_id);
      } else {
        startRound(io, room_id, roomData.topic_type);
      }
    }
  }, 1000);

  roomIntervals.set(room_id, intervalID);
}

// ------------------- END GAME -------------------
async function endGame(io, room_id) {
  const top3 = await players.getTop3(room_id);
  io.to(room_id).emit("top3", top3);

  for (let i = 0; i < top3.length; i++) {
    await playerMongo.updateAchievement(top3[i], i + 1);
  }

  const playersList = await playerMongo.getAllPlayer();
  await playerMongo.updatePlayerRank(playersList);

  await players.resetPlayerScore(room_id);
  await room.setStatus(room_id, "waiting");

  const playersData = await players.getRankByRoomId(room_id);
  io.to(room_id).emit("playersData", playersData);
}

export { attachSocketEvents };
