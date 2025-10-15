const { mongoose, redis } = require('./index')

const playerSchema = new mongoose.Schema({
  idPlayer: { type: mongoose.Schema.Types.ObjectId, auto: true },
  username: { type: String, ref: "Account", required: true },
  first: { type: Number, default: 0 },
  second: { type: Number, default: 0 },
  third: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  totalPoint: { type: Number, default: 0 }
});

const PlayerModel = mongoose.model('Player', playerSchema)

module.exports = class Player {
    static async getPlayerByUsername(username) {
        const player = await PlayerModel.findOne({ username }).lean()

        if (!player) {
             return {
                message: "Player not found",
                success: false
            }
        }   
        return player
    }

    static async createPlayer(username) {
        const newPlayer = new PlayerModel({ username })
        await newPlayer.save()
        return {
            message: "Create player successfully",
            success: true,
            player: newPlayer
        }
    }
}