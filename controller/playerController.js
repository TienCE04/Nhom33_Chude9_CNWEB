const Joi = require("joi");
const Player = require("../models/player");

//lấy xếp hạng 1,2,3 rank của player
exports.getPlayer = async (ctx) => {
  try {
    const schema = Joi.object({
      username: Joi.string().required(),
    });
    const { error, value } = schema.validate(ctx.query);
    if (error) ctx.throw(400, error.message);

    const player = await Player.getPlayerByUsername(value.username);

    if (!player) ctx.throw(404, "Player not found");

    ctx.body = {
      success: true,
      message: "get player successfully",
      data: player,
    };
  } catch (error) {
    ctx.status = error.status || 500;
    ctx.body = { success: false, message: error.message };
  }
};

exports.getAllRankPlayer = async (ctx) => {
  try {
    const rankings = await Player.getAllRankPlayer();
    if (!rankings || rankings.length === 0)
      ctx.throw(404, "rankings not found");

    ctx.body = {
      success: true,
      message: "get rankings successfully",
      data: getRankings,
    };
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { success: false, message: err.message };
  }
};
