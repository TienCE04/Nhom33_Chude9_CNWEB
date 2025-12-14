const { mongoose, redis } = require('./index')
const { v4: uuidv4 } = require('uuid') 

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
}
