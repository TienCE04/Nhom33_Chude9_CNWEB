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

module.exports = { mongoose, redis }