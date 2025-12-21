const Joi = require("joi");
const { v4: uuidv4 } = require("uuid");
const { redis } = require("../models/index");
const Room = require("../models/room");
const Topic = require("../models/topic");
const { getIO } = require("../socket/socketHandler");

const ROOMS_SET_KEY = "rooms";
const roomKey = (id) => `room:${id}`;

exports.createRoom = async (ctx) => {
  // Check if user is guest
  if (ctx.User.role === 'guest' || (ctx.User.id && ctx.User.id.toString().startsWith('guest_'))) {
      ctx.status = 403;
      ctx.body = { success: false, message: "Vui lòng đăng nhập để tạo phòng" };
      return;
  }

  const schema = Joi.object({
    id: Joi.string().optional(),
    name: Joi.string().required(),
    maxPlayer: Joi.number().integer().min(1).default(2),
    maxScore: Joi.number().integer().min(1).default(10),
    metadata: Joi.object().unknown(true).default({}),
    roomType: Joi.string().required(),
  });

  const { body } = ctx.request;
  const err = schema.validate(body).error;
  if (err) {
    ctx.status = 400;
    ctx.body = { success: false, message: "Invalid params", verbosity: err.message };
    return;
  }
  if( !body.metadata.topicId ){
    ctx.status = 400;
    ctx.body = { success: false, message: "Miss topic" };
    return;
  }
  const topic = await Topic.findById(body.metadata.topicId)
  console.log(topic)
  if( !topic || !topic.keyWord) {
      ctx.status = 400;
      ctx.body = { success: false, message: "Invalid topic" };
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
    idTopic: body.metadata.topicId || null,
    room_type: body.roomType,
    // lưu thông tin người tạo phòng để có thể hiển thị phòng private của chính họ
    username: ctx.User && ctx.User.username ? ctx.User.username : undefined,
    createdAt: nowIso,
    updatedAt: nowIso
  };

  await redis.set(key, JSON.stringify(data));
  await redis.sadd(ROOMS_SET_KEY, key);
  await redis.expire(key, 60 * 60);
  ctx.status = 201;
  ctx.body = { success: true, room: data };
};

exports.updateRoom = async (ctx) => {
  const { roomId } = ctx.params;
  const { body } = ctx.request;

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

  const room = JSON.parse(data);

  // Check if user is the owner
  if (room.username !== ctx.User.username) {
    ctx.status = 403;
    ctx.body = { success: false, message: "Unauthorized" };
    return;
  }

  // Update fields
  if (body.name) room.name = body.name;
  if (body.maxPlayer) room.maxPlayer = body.maxPlayer;
  if (body.maxScore) room.maxScore = body.maxScore;
  if (body.roomType) room.room_type = body.roomType;
  if (body.metadata) {
    room.metadata = { ...room.metadata, ...body.metadata };
    if (body.metadata.topicId) room.idTopic = body.metadata.topicId;
  }
  
  room.updatedAt = new Date().toISOString();

  await redis.set(key, JSON.stringify(room));
  await redis.expire(key, 60 * 60); // Reset expiration

  const io = getIO();
  io.emit("rooms_updated");

  ctx.body = { success: true, room };
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

  await redis.del(key);
  await redis.srem(ROOMS_SET_KEY, key);

  const io = getIO();
  io.to(roomId).emit("room_deleted", {
    roomId,
    reason: "Room was deleted"
  });
  io.in(roomId).socketsLeave(roomId);
  
  io.emit("rooms_updated");

  ctx.body = { success: true, message: "Room deleted", roomId };
};

exports.listRooms = async (ctx) => {
  try {
    const username = ctx.User && ctx.User.username ? ctx.User.username : undefined;
    const rooms = await Room.listRooms(username);
    ctx.body = { success: true, rooms: rooms };
  } catch (error) {
    ctx.body = {success: false, rooms: []}
  }
};

exports.getRoomById = async (ctx) => {
  const { roomId } = ctx.params;

  if (!roomId) {
    ctx.status = 400;
    ctx.body = { success: false, message: "Missing roomId" };
    return;
  }
  id = roomId.toLowerCase();
  const key = roomKey(id);
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
