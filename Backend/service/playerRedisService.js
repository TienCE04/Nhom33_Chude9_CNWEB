const { redis } = require("../models/index");

async function sendCommand(args) {
  return await redis.sendCommand(args);
}

//lấy danh sách player
async function getPlayersByRoomId(room_id) {
  console.log("getPlayersByRoomId: ", room_id);
  try {
    const key = `room:player:${room_id}`;

    const listPlayers = await redis.lrange(key, 0, -1);

    return Array.isArray(listPlayers) ? listPlayers : [];
  } catch (err) {
    console.error("Error in getPlayersByRoomId:", err);
    throw err;
  }
}

//lấy rank player sau mỗi vòng
async function getRankByRoomId(room_id) {
  try {
    const key = `room:broadScore:${room_id}`;

    const raw = await redis.zrange(key, 0, -1, "WITHSCORES");

    const formatted = [];

    for (let i = 0; i < raw.length; i += 2) {
      const username = raw[i];
      const point = parseInt(raw[i + 1] ?? "0", 10);
      formatted.push({ username, point });
    }
    return formatted;
  } catch (err) {
    console.error("Error in getRankByRoomId:", err);
    throw err;
  }
}

//Quản lý người chơi trong phòng
//thêm người chơi vào phòng
async function updatePlayerJoin(room_id, user) {
  const playerListKey = `room:player:${room_id}`;
  const scoreKey = `room:broadScore:${room_id}`;
  await redis.rpush(playerListKey, user.username);
  await redis.zadd(scoreKey, "NX", 0, user.username);
  const curPlayers = await redis.llen(playerListKey);

  return parseInt(curPlayers, 10);
}

//xóa người chơi khỏi phòng
async function updatePlayerLeave(room_id, username) {
  const playerListKey = `room:player:${room_id}`;
  const scoreKey = `room:broadScore:${room_id}`;

  await redis.lrem(playerListKey, 0, username);

  await redis.zrem(scoreKey, username);
  const curPlayers = await redis.llen(playerListKey);

  return parseInt(curPlayers, 10);
}

//đặt lại điểm cho người chơi
async function resetPlayerScore(room_id) {
  const scoreKey = `room:broadScore:${room_id}`;
  // Xóa toàn bộ ZSET bảng điểm tạm thời
  await redis.del(scoreKey);

  // Sau khi DEL, cần ZADD lại tất cả người chơi trong danh sách LIST với điểm 0
  const listPlayers = await getPlayersByRoomId(room_id);

  if (listPlayers.length > 0) {
    const args = [];
    listPlayers.forEach(username => {
      args.push(0, username); // 0 là điểm ban đầu
    });

    await redis.zadd(scoreKey, ...args);
  }
}

//cập nhật điểm cho người chơi
async function updatePlayerScore(room_id, username, points) {
  const scoreKey = `room:broadScore:${room_id}`;
  // ZINCRBY: Tăng điểm của người chơi
  await sendCommand(["ZINCRBY", scoreKey, points.toString(), username]);
}

//tìm điểm cao nhất trong phòng
async function findMaxScore(room_id) {
  const scoreKey = `room:broadScore:${room_id}`;
  // ZRANGE key -1 -1 WITHSCORES: Lấy phần tử cuối cùng (điểm cao nhất)
  const result = await sendCommand([
    "ZRANGE",
    scoreKey,
    "-1",
    "-1",
    "WITHSCORES",
  ]);
  // result = [username, point]
  return result.length === 2 ? parseInt(result[1], 10) : 0;
}

//lấy top 3 người chơi
async function getTop3(room_id) {
  const scoreKey = `room:broadScore:${room_id}`;
  // ZREVRANGE: Lấy từ điểm cao nhất xuống
  const raw = await sendCommand([
    "ZREVRANGE",
    scoreKey,
    "0",
    "2",
    "WITHSCORES",
  ]);

  const formatted = [];
  for (let i = 0; i < raw.length; i += 2) {
    const username = raw[i];
    const point = parseInt(raw[i + 1] ?? "0", 10);
    formatted.push({ username, point });
  }
  return formatted;
}

// quản lý điểm cộng cho người đoán đúng

async function getAddPoint(room_id) {
  const key = `room:addPoint:${room_id}`;
  const point = await sendCommand(["GET", key]);
  return parseInt(point || "10", 10); // Mặc định là 10 (theo logic game phổ biến)
}

async function updateAddPoint(room_id, point) {
  const key = `room:addPoint:${room_id}`;
  await sendCommand(["SET", key, point.toString()]);
}

async function resetAddPoint(room_id) {
  const key = `room:addPoint:${room_id}`;
  await redis.set(key, "10"); // Đặt giá trị key = "10"
}

// Quanl lý trạng thái Round

const ROUND_STATE_KEY = "roundState"; // Tên trường chung trong Hash

async function initRoundState(room_id) {
  const key = `room:${room_id}:${ROUND_STATE_KEY}`;
  // Xóa key cũ và tạo lại
  await redis.del(key);

  // Thêm trường 'answered' với giá trị mảng rỗng
  await redis.hmset(key, "answered", JSON.stringify([]));
}

async function setRoundState(room_id, state) {
  const key = `room:${room_id}:${ROUND_STATE_KEY}`;

  const args = [key];
  if (state.drawer_username)
    args.push("drawer_username", state.drawer_username);
  if (state.keyword) args.push("keyword", state.keyword);
  if (state.timeLeft !== undefined)
    args.push("timeLeft", state.timeLeft.toString());

  await redis.hmset(...args);

}

async function getRoundState(room_id) {
  const key = `room:${room_id}:${ROUND_STATE_KEY}`;

  const raw = await redis.hgetall(key);
  const state = {};
  for (let i = 0; i < raw.length; i += 2) {
    state[raw[i]] = raw[i + 1];
  }
  // Chuyển lại danh sách answered từ JSON string
  if (state.answered) {
    try {
      state.answered = JSON.parse(state.answered);
    } catch {
      state.answered = [];
    }
  } else {
    state.answered = [];
  }
  return state;
}

async function addAnsweredPlayer(room_id, username) {
  const key = `room:${room_id}:${ROUND_STATE_KEY}`;
  const state = await getRoundState(room_id);

  // Nếu người chơi chưa có trong danh sách, thêm vào
  if (!state.answered.includes(username)) {
    state.answered.push(username);
    const answeredJson = JSON.stringify(state.answered);
    await redis.hmset(key, { answered: answeredJson });
  }
}

// Kiểm tra xem tất cả người chơi đã đoán đúng chưa

async function everyoneAnswered(room_id) {
  const allPlayers = await getPlayersByRoomId(room_id);
  const roundState = await getRoundState(room_id);

  if (!roundState.drawer_username) return false;

  const guessers = allPlayers.filter((p) => p !== roundState.drawer_username);

  return guessers.length > 0 && roundState.answered.length >= guessers.length;
}

// Quan lý danh sách tạm thời trong Round
async function getTmpPlayers(room_id) {
  const key = `room:tmpPlayers:${room_id}`;
  return await redis.lrange(key, 0, -1);
}

async function setTmpPlayers(room_id, playersList) {
  const key = `room:tmpPlayers:${room_id}`;
  await redis.del(key);

  if (playersList && playersList.length > 0) {
    await redis.rpush(key, ...playersList);
  }
}

async function removeTmpPlayer(room_id, username) {
  const key = `room:tmpPlayers:${room_id}`;
  // LREM 1: Xóa 1 lần xuất hiện của username
  await redis.lrem(key, 1, username);

}

async function getTmpKeywords(room_id) {
  const key = `room:tmpKeywords:${room_id}`;
  return await redis.lrange(key, 0, -1);
}

async function addTmpKeyword(room_id, keyword) {
  const key = `room:tmpKeywords:${room_id}`;
  await redis.rpush(key, keyword);

}

async function resetTmpKeywords(room_id) {
  const key = `room:tmpKeywords:${room_id}`;
  await redis.del(key);
}
async function resetAnswered(room_id) {
    await redis.del(`room:answered:${room_id}`);
}

// Export các hàm để Socket và GamePlay có thể sử dụng
module.exports = {
  updatePlayerJoin,
  updatePlayerLeave,
  resetPlayerScore,
  updatePlayerScore,
  findMaxScore,
  getTop3,
  getAddPoint,
  updateAddPoint,
  resetAddPoint,
  initRoundState,
  setRoundState,
  getRoundState,
  addAnsweredPlayer,
  everyoneAnswered,
  getTmpPlayers,
  setTmpPlayers,
  removeTmpPlayer,
  getTmpKeywords,
  addTmpKeyword,
  resetTmpKeywords,
  getPlayersByRoomId,
  getRankByRoomId,
  resetAnswered
};
