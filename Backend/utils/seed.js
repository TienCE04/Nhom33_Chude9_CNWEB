const Topic = require("../models/topic");

const DEFAULT_TOPICS = [
  { nameTopic: "Động vật", topicIcon: "cruelty_free" },
  { nameTopic: "Công nghệ", topicIcon: "laptop_mac" },
  { nameTopic: "Thiên nhiên", topicIcon: "nature" },
  { nameTopic: "Thực phẩm", topicIcon: "cookie" },
  { nameTopic: "Thể thao", topicIcon: "sports_soccer" },
  { nameTopic: "Điện ảnh", topicIcon: "videocam" },
  { nameTopic: "Âm nhạc", topicIcon: "queue_music" },
  { nameTopic: "Du lịch", topicIcon: "flight" },
  { nameTopic: "Nghệ thuật", topicIcon: "palette" },
  { nameTopic: "Trò chơi", topicIcon: "sports_esports" },
];

const seedDefaultTopics = async () => {
  try {
    console.log("🌱 Seeding default topics...");
    for (const topicData of DEFAULT_TOPICS) {
      const exists = await Topic.findOne({
        nameTopic: topicData.nameTopic,
        createdBy: "system",
      });

      if (!exists) {
        await Topic.createTopic({
          ...topicData,
          createdBy: "system",
          keyWord: [], 
        });
        console.log(`   Created default topic: ${topicData.nameTopic}`);
      } else {
          if (!exists.topicIcon || exists.topicIcon !== topicData.topicIcon) {
              await Topic.updateTopic(exists.idTopic, { topicIcon: topicData.topicIcon });
              console.log(`   Updated icon for topic: ${topicData.nameTopic}`);
          }
      }
    }
    console.log("✅ Default topics seeding completed.");
  } catch (error) {
    console.error("❌ Error seeding default topics:", error);
  }
};

module.exports = seedDefaultTopics;
