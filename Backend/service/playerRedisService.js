const { redis } = require("../models/index");

async function sendCommand(args) {
  return await redis.sendCommand(args);
}

//lấy danh sách player
async function getPlayersByRoomId(room_id) {
  console.log("getPlayersByRoomId: ", room_id);
  try {
    const key = `room:player:${room_id}`;

    const listPlayers = await redis.smembers(key);
    console.log("listPlayers: ", listPlayers);

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
    console.log("Raw rank data: ", raw);

    const formatted = [];

    for (let i = 0; i < raw.length; i += 2) {
      const username = raw[i];
      const point = parseInt(raw[i + 1] ?? "0", 10);
      formatted.push({ username, point });
    }
    console.log("getRankByRoomId: ", formatted); 
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
  await redis.sadd(playerListKey, user.username);
  await redis.zadd(scoreKey, "NX", 0, user.username);
  const curPlayers = await redis.scard(playerListKey);

  return parseInt(curPlayers, 10);
}

//xóa người chơi khỏi phòng
async function updatePlayerLeave(room_id, username) {
  const playerListKey = `room:player:${room_id}`;
  const scoreKey = `room:broadScore:${room_id}`;

  await redis.srem(playerListKey, username);

  await redis.zrem(scoreKey, username);
  const curPlayers = await redis.scard(playerListKey);

  const players = await redis.smembers(playerListKey);
  console.log("Remaining players after leave:", players);
  console.log("Current player count:", curPlayers);

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
  // Sử dụng zincrby thay vì sendCommand
  await redis.zincrby(scoreKey, points, username);
}

//tìm điểm cao nhất trong phòng
async function findMaxScore(room_id) {
  const scoreKey = `room:broadScore:${room_id}`;
  // Lấy phần tử cuối cùng của ZSET (điểm cao nhất)
  const result = await redis.zrange(scoreKey, -1, -1, "WITHSCORES");
  return result.length === 2 ? parseInt(result[1], 10) : 0;
}

//lấy top 3 người chơi
async function getTop3(room_id) {
  const scoreKey = `room:broadScore:${room_id}`;
  // ZREVRANGE lấy từ cao xuống thấp
  const raw = await redis.zrevrange(scoreKey, 0, 2, "WITHSCORES");
  const formatted = [];
  for (let i = 0; i < raw.length; i += 2) {
    formatted.push({
      username: raw[i],
      point: parseInt(raw[i + 1] ?? "0", 10),
    });
  }
  return formatted;
}

// quản lý điểm cộng cho người đoán đúng

async function getAddPoint(room_id) {
  const key = `room:addPoint:${room_id}`;
  // const point = await sendCommand(["GET", key]);
  const point = await redis.get(key);
  return parseInt(point || "10", 10); // Mặc định là 10
}

async function updateAddPoint(room_id, point) {
  const key = `room:addPoint:${room_id}`;
  const pointValue = (point !== undefined && point !== null) ? point.toString() : "10";

  await redis.set(key, pointValue);
}

async function resetAddPoint(room_id) {
  const key = `room:addPoint:${room_id}`;
  await redis.set(key, "10"); // Đặt giá trị key = "10"
}

const ROUND_STATE_KEY = "roundState";

async function initRoundState(room_id) {
  const key = `room:${room_id}:${ROUND_STATE_KEY}`;
  // Xóa key cũ và tạo lại
  await redis.del(key);

  // Thêm trường 'answered' với giá trị mảng rỗng
  await redis.hmset(key, "answered", JSON.stringify([]));
}

async function setRoundState(room_id, state) {
  const key = `room:${room_id}:${ROUND_STATE_KEY}`;
  console.log("Setting round state:", state, "for room:", room_id);

  // Khởi tạo object dữ liệu để lưu vào Redis
  const dataToSet = {};
  
  if (state.drawer_username) dataToSet.drawer_username = state.drawer_username;
  if (state.keyword) dataToSet.keyword = state.keyword;
  
  // Lưu mốc thời gian kết thúc (quan trọng cho người vào sau)
  if (state.endTime) dataToSet.endTime = state.endTime.toString();
  
  // Lưu tổng thời gian của vòng (để FE vẽ thanh progress bar)
  if (state.duration) dataToSet.duration = state.duration.toString();

  if (Object.keys(dataToSet).length > 0) {
    await redis.hmset(key, dataToSet);
  }
}

async function getRoundState(room_id) {
  const key = `room:${room_id}:${ROUND_STATE_KEY}`;
  console.log("Getting round state for room:", room_id);

  const state = await redis.hgetall(key);
  
  // Nếu không có dữ liệu, trả về object mặc định an toàn
  if (!state || Object.keys(state).length === 0) {
    return { answered: [], endTime: 0, duration: 0 };
  }

  // Xử lý trường 'answered' (chuyển từ JSON String sang Array)
  if (state.answered) {
    try {
      state.answered = JSON.parse(state.answered);
    } catch (e) {
      console.error("Lỗi parse JSON answered:", e);
      state.answered = [];
    }
  } else {
    state.answered = [];
  }

  // Đảm bảo endTime và duration trả về là kiểu Number (để FE không bị lỗi tính toán)
  if (state.endTime) state.endTime = Number(state.endTime);
  if (state.duration) state.duration = Number(state.duration);

  return state;
}

async function addAnsweredPlayer(room_id, username) {
  const key = `room:${room_id}:${ROUND_STATE_KEY}`;
  const state = await getRoundState(room_id);
  console.log("Current round state before adding answered player:", state);

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
  const players = await redis.lrange(key, 0, -1);
  console.log("Remaining tmp players after removal:", players);
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
