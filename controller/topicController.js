const Joi = require("joi");
const Topic = require("../models/topic");

exports.createTopic = async (ctx) => {
  try {
    const schema = Joi.object({
      nameTopic: Joi.string().required(),
      keyWord: Joi.array()
        .items(Joi.string())
        .default([]),
      createdBy: Joi.string().default("system"),
    });

    const { error, value } = schema.validate(ctx.request.body);
    if (error) ctx.throw(400, error.message);

    const topic = await Topic.createTopic(value);
    ctx.status = 201;
    ctx.body = { success: true, message: "Topic created", data: topic };
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { success: false, message: err.message };
  }
};

exports.getDefaultTopic = async (ctx) => {
  try {
    const topics = await Topic.getDefaultTopics();
    if (!topics.length) ctx.throw(404, "No default topics found");

    ctx.body = { success: true, data: topics };
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { success: false, message: err.message };
  }
};

exports.getUserTopics = async (ctx) => {
  try {
    const { username } = ctx.params;
    const topics = await Topic.getUserTopics(username);
    if (!topics.length) ctx.throw(404, `No topics found for user ${username}`);
    ctx.body = { success: true, data: topics };
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { success: false, message: err.message };
  }
};

exports.updateTopic = async (ctx) => {
  try {
    const { idTopic } = ctx.params;
    const schema = Joi.object({
      nameTopic: Joi.string(),
      keyWord: Joi.array().items(Joi.string()),
    });

    const { error, value } = schema.validate(ctx.request.body);
    if (error) ctx.throw(400, error.message);

    const updatedTopic = await Topic.updateTopic(idTopic, value);
    if (!updatedTopic) ctx.throw(404, "Topic not found");

    ctx.body = { success: true, message: "Topic updated successfully", data: updatedTopic };
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { success: false, message: err.message };
  }
};

exports.deleteTopic = async (ctx) => {
  try {
    const { idTopic } = ctx.params;
    console.log(idTopic)
    
    const deletedTopic = await Topic.deleteTopic(idTopic);
    if (!deletedTopic) ctx.throw(404, "Topic not found");

    ctx.body = { success: true, message: "Topic deleted successfully", data: deletedTopic };
  } catch (err) {
    ctx.status = err.status || 500;
    ctx.body = { success: false, message: err.message };
  }
};