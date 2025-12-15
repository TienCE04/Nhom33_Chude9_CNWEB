const { mongoose, redis } = require("./index");

const topicSchema = new mongoose.Schema({
  idTopic: { type: mongoose.Schema.Types.ObjectId, auto: true },
  nameTopic: { type: String, required: true },
  topicIcon: { type: String, default: "extension" },
  keyWord: { type: [String], default: [] },
  createdBy: { type: String, required: true, default: "system" },
  timeStamp: { type: Date, default: Date.now },
});

const TopicModel = mongoose.model("Topic", topicSchema);

module.exports = class Topic {
  static async createTopic(atts) {
    const topic = new TopicModel(atts);
    await topic.save();
    return topic;
  }

  static async findOne(query) {
    return await TopicModel.findOne(query);
  }
  static  async findById(id){
    const topic = await TopicModel.findOne({_id: id}).lean();
    return topic
  }

  static async getAllTopics() {
    return await TopicModel.find();
  }

  static async getDefaultTopics() {
    return await TopicModel.find({ createdBy: "system" });
  }

    static async getUserTopics(username) {
    return await TopicModel.find({ createdBy: username }).sort({ timeStamp: -1 });
  }

  static async updateTopic(id, updateData) {
    return await TopicModel.findOneAndUpdate(
      { $or: [{ idTopic: id }, { _id: id }] },
      updateData,
      { new: true }
    );
  }

  static async deleteTopic(id) {
    return await TopicModel.findOneAndDelete({
      $or: [{ idTopic: id }, { _id: id }],
    });
  }
};
