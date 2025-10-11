const Router = require('koa-router')
const debug = require('debug')('dashboard-api:routes:auth')
const jwt = require('jwt-simple')
const Joi = require('joi')
const moment = require('moment')


const router = new Router()

router.post('/auth', async (ctx) => {
    const schema = Joi.object({
        username: Joi.string().required(),
        password: Joi.string().required()
    })  
    const { body } = ctx.request

    const err = Joi.validate(body, schema).error
    const verbosity = !err || err.message

    if (err) {
        ctx.status = 400
        ctx.body = {
            success: false,
            message: '(╯°□°）╯︵ ┻━┻ missing or invalid params',
            verbosity
        }
    } else{
        ctx.body = {
            message: "okkkk",
            success: true
        }

    }
 
})

module.exports = router
