const Router = require('koa-router')
const Joi = require('joi')
const { getAllAccounts, createAccount } = require('../models/account')
const {createRoom} = require('../models/room')

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
        redis_test = await createRoom(
            {
                a: "trung",
                b: "hello"
            }
        )
        await createAccount({
                username: 'Hà Trung Nguyễn',
                password: '123456'
                });
        user = await getAllAccounts()

     

        ctx.body = {
            message: "okkkk",
            success: true,
            user: user
        }

    }
 
})

module.exports = router
