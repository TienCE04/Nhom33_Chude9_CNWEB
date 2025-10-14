const mongoose = require('mongoose');
const { env } = process
const Redis = require('ioredis')

mongoose.connect(process.env.MONGODB_CONNECTION_STRING)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

const redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    db: env.REDIS_DB || 1,
    password: env.REDIS_PASSWORD,
})
redis.on("connect", () => {
  console.log("✅ Redis connected successfully!");
});

// 🔹 Bắt sự kiện "ready" — khi Redis đã sẵn sàng để sử dụng
redis.on("ready", () => {
  console.log("🚀 Redis is ready to use.");
});

// 🔹 Bắt sự kiện "error" — khi có lỗi trong kết nối
redis.on("error", (err) => {
  console.error("❌ Redis connection error:", err);
});

module.exports = { mongoose, redis }