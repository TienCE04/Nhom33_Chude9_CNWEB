const { mongoose, redis } = require("./index");

const playerSchema = new mongoose.Schema({
  idPlayer: { type: mongoose.Schema.Types.ObjectId, auto: true },
  username: { type: String, ref: "Account", required: true },
  first: { type: Number, default: 0 },
  second: { type: Number, default: 0 },
  third: { type: Number, default: 0 },
  rank: { type: Number, default: 0 },
  totalPoint: { type: Number, default: 0 },
  totalGames: { type: Number, default: 0 },
  wordsDrawn: { type: Number, default: 0 },
  wordsGuessed: { type: Number, default: 0 },
  totalGuesses: { type: Number, default: 0 },
});

const PlayerModel = mongoose.model("Player", playerSchema);

module.exports = class Player {
  static async getAllPlayer() {
    return await PlayerModel.find({}).lean();
  }
  static async getPlayerByUsername(username) {
    const player = await PlayerModel.findOne({ username }).lean();

    if (!player) {
      return {
        message: "Player not found",
        success: false,
      };
    }
    return player;
  }

  static async createPlayer(username) {
    const newPlayer = new PlayerModel({ username });
    await newPlayer.save();
    return {
      message: "Create player successfully",
      success: true,
      player: newPlayer,
    };
  }

  static async getLeaderboard(limit = 100) {
    return await PlayerModel.aggregate([
      { $sort: { totalPoint: -1 } },
      {
        $setWindowFields: {
          sortBy: { totalPoint: -1 },
          output: {
            rank: { $rank: {} },
          },
        },
      },
      { $limit: limit },
      {
        $lookup: {
          from: "profiles",
          localField: "username",
          foreignField: "username",
          as: "profile"
        }
      },
      {
        $unwind: {
          path: "$profile",
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          username: 1,
          totalPoint: 1,
          rank: 1,
          avatar: "$profile.avatar"
        }
      }
    ]);
  }

  static async getRankPlayer(username) {
    const result = await PlayerModel.aggregate([
      { $sort: { totalPoint: -1 } },
      {
        $setWindowFields: {
          sortBy: { totalPoint: -1 },
          output: {
            rank: { $rank: {} },
          },
        },
      },
      { $match: { username } },
      { $project: { rank: 1, _id: 0 } },
    ]);

    console.log(result[0]?.rank);
    return result[0]?.rank || null;
  }
  static async updateAchievement(username, rank) {
    const updateData = {};
    // Tích lũy số lần đạt top
    if (rank === 1) updateData.first = 1;
    if (rank === 2) updateData.second = 1;
    if (rank === 3) updateData.third = 1;

    // Cộng thêm điểm vào tổng điểm tích lũy (Ví dụ: nhất +30, nhì +20, ba +10)
    const bonusPoint = rank === 1 ? 30 : rank === 2 ? 20 : rank === 3 ? 10 : 0;

    // QUAN TRỌNG: Phải dùng PlayerModel.updateOne
    return await PlayerModel.updateOne(
      { username: username },
      { 
        $inc: { 
          ...updateData, 
          totalPoint: bonusPoint,
          totalGames: 1 // Tăng tổng số trận đã chơi
        } 
      }
    );
  }

  static async incrementWordsDrawn(username) {
    return await PlayerModel.updateOne(
      { username: username },
      { $inc: { wordsDrawn: 1 } }
    );
  }

  static async incrementWordsGuessed(username) {
    return await PlayerModel.updateOne(
      { username: username },
      { $inc: { wordsGuessed: 1 } }
    );
  }

  static async incrementTotalGuesses(username) {
    return await PlayerModel.updateOne(
      { username: username },
      { $inc: { totalGuesses: 1 } }
    );
  }

  static async updatePlayerRank() {
    const players = await PlayerModel.find().sort({ totalPoint: -1 });
    for (let i = 0; i < players.length; i++) {
      await PlayerModel.updateOne(
        { _id: players[i]._id },
        { $set: { rank: i + 1 } }
      );
    }
  }
};
