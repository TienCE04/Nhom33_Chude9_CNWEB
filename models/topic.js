const { mongoose, redis } = require('./index')

const topicSchema = new mongoose.Schema({
  idTopic: { type: mongoose.Schema.Types.ObjectId, auto: true },
  nameTopic: { type: String, required: true },
  keyWord: { type: [String], default: [] },
  enum: { type: String, enum: ["system", "username"], required: true },
  timeStamp: { type: Date, default: Date.now }
});

const TopicModel = mongoose.model('Topic', topicSchema)

module.exports = class Topic {
    static async createTopic(atts){
        const topic = new TopicModel(atts)
        await topic.save()
        return topic
    }
}