const mongoose = require('mongoose');
const { env } = process

async function connectMongo() {
    await mongoose.connect(env.MONGODB_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    console.log('✅ MongoDB connected')
}
const redis = new Redis({
    host: env.REDIS_HOST,
    port: env.REDIS_PORT,
    db: env.REDIS_DB || 1,
    password: env.REDIS_PASSWORD,
})

connectMongo()

module.exports = { mongoose, redis }