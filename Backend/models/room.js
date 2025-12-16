const { mongoose, redis } = require('./index')
const { v4: uuidv4 } = require('uuid') 
const ROOMS_SET_KEY = "rooms";
const roomKey = (id) => `room:${id}`;

const roomSchema = new mongoose.Schema({
  idRoom: { type: mongoose.Schema.Types.ObjectId, auto: true },
  username: { type: String, ref: "Account" },
  idTopic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  maxPlayer: { type: Number, default: 2 },
  maxScore: { type: Number, default: 10 },
  status: { type: String, default: "waiting" },
  cur_player: { type: Number, default: 0 },
  add_Point: { type: Number, default: 0 },
  topic_type: { type: String },
  room_type: { type: String },
  timeStamp: { type: Date, default: Date.now }
});

const RoomModel = mongoose.model('Room', roomSchema)

module.exports = class Room {
  static async createRoom(atts) {
 
    const id = atts.id || uuidv4()

    const key = `topic:${id}`

    await redis.set(key, JSON.stringify({
      ...atts,
      id,
      created_at: new Date().toISOString()
    }))

    await redis.sadd('topics', key)  // lưu key vào redis trong một set tên là topics 

    const roomData = await redis.get(key)
    return JSON.parse(roomData)
  }

  static async listRooms(username){
    const keys = await redis.smembers(ROOMS_SET_KEY);
    if (!keys || keys.length === 0) {
     return  [] ;
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

          const room = JSON.parse(data);

          // Luôn hiển thị phòng public
          // và hiển thị phòng private nếu là của chính username hiện tại
          if (
            room.room_type === "public" ||
            (username && room.room_type === "private" && room.username === username)
          ) {
            rooms.push(room);
          }
        } catch (error) {
          console.error("Failed to parse room data:", error);
        }
      })
    );

    if (staleKeys.length > 0) {
      await redis.srem(ROOMS_SET_KEY, ...staleKeys);
    }
    return  rooms ;
    };

  static async updateRoomPlayer(roomId, index){
    if (!roomId) {
      return { success: false };
    }
    const key = roomKey(roomId);
    const data = await redis.get(key);
    if (!data) {
      return { success: false };
    }
    try {
      const room = JSON.parse(data);
      room.currentPlayers = (room.currentPlayers || 0) + index;

      await redis.set(key, JSON.stringify(room));
      return {
        room,
        success: true,
      };
    } catch (error) {
      console.error("Failed to parse room data:", error);
      return { success: false };
    }
  };


  static async setStatus (room_id, status) {
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
        return true;
    } catch (error) {
        console.error(`Error updating status for room ${room_id}:`, error);
        return false;
    }
  };
   static async getRoomById(roomId)  {
     if (!roomId) {
       return {success: false};
     }
     const key = roomKey(roomId);
     const data = await redis.get(key);
     if (!data) {
       return { success: false};
     }
     try {
       const room = JSON.parse(data);
       return{ room: room, success: true}
     } catch (error) {
       console.error("Failed to parse room data:", error);
       return { success: false};
     }
   };
}



