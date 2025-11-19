const { redis } = require("../models/index");

async function sendCommand(args) {
  return await redis.sendCommand(args);
}

//lấy danh sách player
async function getPlayersByRoomId(room_id) {
  console.log("getPlayersByRoomId: ", room_id);
  try {
    const key = `room:player:${room_id}`;

    const listPlayers = await sendCommand(["LRANGE", key, "0", "-1"]);

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

    const raw = await sendCommand(["ZRANGE", key, "0", "-1", "WITHSCORES"]);

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
