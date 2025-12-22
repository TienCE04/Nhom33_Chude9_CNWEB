const { mongoose, redis } = require('./index')
const { v4: uuidv4 } = require('uuid') 
const ROOMS_SET_KEY = "rooms";
const roomKey = (id) => `room:${id}`;

const roomSchema = new mongoose.Schema({
  idRoom: { type: mongoose.Schema.Types.ObjectId, auto: true },
  username: { type: String, ref: "Account" },
  idTopic: { type: mongoose.Schema.Types.ObjectId, ref: "Topic" },
  roomName: { type: String },
  maxPlayer: { type: Number, default: 2 },
  maxScore: { type: Number, default: 10 },
  status: { type: String, default: "waiting" },
  cur_player: { type: Number, default: 0 },
  add_Point: { type: Number, default: 0 },
  topic_type: { type: String },
  room_type: { type: String, default: "public" },
  timeStamp: { type: Date, default: Date.now },
  time: { type: Number, default: 60 }
});

const RoomModel = mongoose.model('Room', roomSchema)

module.exports = class Room {

  static async findOne(query) {
    return await RoomModel.findOne(query);
  }

  static async create(data) {
    const room = new RoomModel(data);
    await room.save();
    return room;
  }

  static async createRoom(atts) {
 
    const id = atts.id || uuidv4()

    const key = `room:${id}`

    const roomData = {
      ...atts,
      id,
      currentPlayers: atts.currentPlayers || 0, // Đảm bảo thống nhất tên biến
      status: atts.status || "WAITING",
      created_at: new Date().toISOString()
    };

    await redis.set(key, JSON.stringify(roomData))
    await redis.sadd('rooms', key) // Lưu vào set rooms thay vì topics
    
    return { success: true, room: roomData };
  }

  static async listRooms(username) {
    const keys = await redis.smembers(ROOMS_SET_KEY);
    if (!keys || keys.length === 0) {
      return [];
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

          //  Lấy loại phòng bất kể lưu là 'room_type' hay 'roomType'
          //  Chuyển về chữ thường để so sánh tránh lỗi Public != public
          const rawType = room.room_type || room.roomType || "public";
          const type = rawType.toLowerCase();
          
          if (
            type === "public" ||
            (username && type === "private" && room.username === username)
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
    return rooms;
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
    static async setTime (room_id, time) {
    const key = roomKey(room_id);
    try {
        const data = await redis.get(key);
        if (!data) {
            console.warn(`Room with key ${key} not found for status update.`);
            return false;
        }
        const roomData = JSON.parse(data);
        roomData.time = time;
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
     console.log("Fetched room data:", data);
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

   static updateCurrentPlayers = async (roomId, curPlayers) => {
     const key = roomKey(roomId);
     const data = await redis.get(key);
     if (!data) return;
   
     const room = JSON.parse(data);
   
     room.currentPlayers = curPlayers;
     room.updatedAt = new Date().toISOString();
   
     await redis.set(key, JSON.stringify(room));
   };
}



