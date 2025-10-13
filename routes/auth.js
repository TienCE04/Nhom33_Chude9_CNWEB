const Router = require('koa-router')
const debug = require('debug')('api')
const jwt = require('jwt-simple')
const Joi = require('joi')
const { fetchUserByEmail } = require('../models/user')


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
        user = await fetchUserByEmail(body.username)

        ctx.body = {
            message: "okkkk",
            success: true
        }

    }
 
})

module.exports = router
