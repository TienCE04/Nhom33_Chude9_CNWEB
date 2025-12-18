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
    const roomData = await room.getRoomById(room_id);
    const curPlayers = getCurrentPlayers(io, room_id);

    if (!roomData || curPlayers < 2) {
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
