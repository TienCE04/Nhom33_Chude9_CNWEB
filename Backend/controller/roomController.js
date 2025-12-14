const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");
const { redis } = require("../models/index");
const { getIO } = require("../socket/socketHandler.js");

const ROOMS_SET_KEY = "rooms";
const roomKey = (id) => `room:${id}`;

exports.createRoom = async (ctx) => {
  const schema = Joi.object({
    id: Joi.string().optional(),
    name: Joi.string().required(),
    maxPlayer: Joi.number().integer().min(1).default(2),
    maxScore: Joi.number().integer().min(1).default(10),
    metadata: Joi.object().unknown(true).default({}),
    userName: Joi.string().required(),
    idTopic: Joi.string().required(),
    room_type: Joi.string().required(),
  });

  const { body } = ctx.request;
  const err = schema.validate(body).error;
  if (err) {
    ctx.status = 400;
    ctx.body = { success: false, message: "Invalid params", verbosity: err.message };
    return;
  }

  const id = body.id || uuidv4();
  const key = roomKey(id);
  const nowIso = new Date().toISOString();

  const data = {
    id,
    name: body.name,
    maxPlayer: body.maxPlayer,
    maxScore: body.maxScore,
    status: "waiting",
    currentPlayers: 0,
    metadata: body.metadata,
    userName: body.userName,
    idTopic: body.idTopic,
    room_type: body.room_type,
    createdAt: nowIso,
    updatedAt: nowIso
  };

  await redis.set(key, JSON.stringify(data));
  await redis.sadd(ROOMS_SET_KEY, key);
  await redis.expire(key, 60 * 60);

  const io = getIO();
  if (body.room_type === "public") {
    io.emit("room_created", data);
  }
  else {
    io.to(id).emit("room_created", data);
  }

  ctx.status = 201;
  ctx.body = { success: true, room: data };
};

exports.deleteRoom = async (ctx) => {
  const { roomId } = ctx.params;
  if (!roomId) {
    ctx.status = 400;
    ctx.body = { success: false, message: "Missing roomId" };
    return;
  }

  const key = roomKey(roomId);
  const exists = await redis.get(key);
  if (!exists) {
    ctx.status = 404;
    ctx.body = { success: false, message: "Room not found" };
    return;
  }

  const io = getIO();
  io.to(roomId).emit("room_updated", { action: "deleted", roomId });

  try {
    const sockets = await io.in(roomId).fetchSockets();
    sockets.forEach((s) => s.leave(roomId));
  } catch (e) {
    console.error("Error while removing sockets from room:", e);
  }

  await redis.del(key);
  await redis.srem(ROOMS_SET_KEY, key);

  ctx.body = { success: true, message: "Room deleted", roomId };
};

exports.listRooms = async (ctx) => {
  const keys = await redis.smembers(ROOMS_SET_KEY);

  if (!keys || keys.length === 0) {
    ctx.body = { success: true, rooms: [] };
    return;
  }

  const rooms = [];
  const staleKeys = [];

  await Promise.all(
    keys.map(async (key) => {
      try {
        const data = await redis.get(key);
        if (!data) {
          staleKeys.push(key);
          return;
        }
        if (data.includes('"room_type":"public"')) {
        rooms.push(JSON.parse(data));
      }
      } catch (error) {
        console.error("Failed to parse room data:", error);
      }
    })
  );

  if (staleKeys.length > 0) {
    await redis.srem(ROOMS_SET_KEY, ...staleKeys);
  }

  ctx.body = { success: true, rooms };
};

exports.getRoomById = async (ctx) => {
  const { roomId } = ctx.params;

  if (!roomId) {
    ctx.status = 400;
    ctx.body = { success: false, message: "Missing roomId" };
    return;
  }

  const key = roomKey(roomId);
  const data = await redis.get(key);

  if (!data) {
    ctx.status = 404;
    ctx.body = { success: false, message: "Room not found" };
    return;
  }

  try {
    const room = JSON.parse(data);
    ctx.body = { success: true, room };
  } catch (error) {
    console.error("Failed to parse room data:", error);
    ctx.status = 500;
    ctx.body = { success: false, message: "Failed to load room data" };
  }
};

exports.getRoomForUser = async (ctx) => {
  const { userName } = ctx.params;

  if (!userName) {
    ctx.status = 400;
    ctx.body = { success: false, message: "Missing userName" };
    return;
  }
  const keys = await redis.smembers(ROOMS_SET_KEY);
  const rooms = [];
  const staleKeys = [];
  await Promise.all(
    keys.map(async (key) => {
      try {
        const data = await redis.get(key);
        if (!data) {
          staleKeys.push(key);
          return;
        }
        if (data.includes(`"userName":"${userName}"`)) {
        rooms.push(JSON.parse(data));
      }
      } catch (error) {
        console.error("Failed to parse room data:", error);
      }
    })
  );
  if (staleKeys.length > 0) {
    await redis.srem(ROOMS_SET_KEY, ...staleKeys);
  }
   ctx.body = { success: true, rooms };
};

exports.setStatus = async (room_id, status) => {
    const key = roomKey(room_id);

    try {
    
        const data = await redis.get(key);
        if (!data) {
            console.warn(`Room with key ${key} not found for status update.`);
            return false;
        }

    
        const roomData = JSON.parse(data);

   
        roomData.status = status;
        roomData.updatedAt = new Date().toISOString();

        await redis.set(key, JSON.stringify(roomData));

        //báo sự kiện thay đổi từ waiting sang playing để các socket start_game
        const io = getIO();
        io.to(room_id).emit("room_updated", { action: "status_change", room: roomData });
        
        io.emit("rooms_list_updated"); 

        return true;
    } catch (error) {
        console.error(`Error updating status for room ${room_id}:`, error);
        return false;
    }
};