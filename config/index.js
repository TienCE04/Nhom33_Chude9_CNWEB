const _ = require('lodash')

const defaults = {
    production: false,
    env: 'dev',
    port: 3000,
    secret: 'secret-boilerplate-token',
    redisHost: 'localhost',
    redisPort: '6379',
    redisDb: 0,
    redisPassword: null,
}


let custom = {
    production:
        process.env.NODE_ENV === 'production' ||
        process.env.ENV === 'production',
    env: process.env.NODE_ENV,
    port: process.env.PORT,
   
    
    
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT,
    redisPassword: process.env.REDIS_PASSWORD,
    redisDb: process.env.REDIS_DB,
    useOwner: process.env.USE_OWNER || false,
    baseUrl: {
    },
    auth: {
        google: {
            clientId: process.env.GOOGLE_AUTH_CLIENT_ID,
            secret: process.env.GOOGLE_AUTH_SECRET
        }
    }
}
custom = _.pickBy(custom, _.identity)


const config = { ...defaults, ...custom }

module.exports = config
