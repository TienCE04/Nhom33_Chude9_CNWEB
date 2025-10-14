const { mongoose, redis } = require('./index')
const _ = require('lodash')
const { hashPassword } = require('../utils/auth')


const accountSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { timestamps: true })


const AccountModel = mongoose.model('Account', accountSchema)

module.exports = class Account {

    static async getAccountByUsername(username) {
        const account = await AccountModel.findOne({ username }).lean()

        if (!account) {
            return {
                message: "Account not found",
                success: false
            }
        }

        return account
    }

   
    static async getAllAccounts() {
        return AccountModel.find().lean()
    }
    static async createAccount(atts) {
        if (atts.password) {
            atts.password = hashPassword(atts.password)
        }  
        const account = new AccountModel(atts)
        await account.save()
        return account
    }


    static async updateAccount(id, atts) {
        delete atts.username
        if (atts.password) {
            atts.password = hashPassword(atts.password)
        }

        await AccountModel.updateOne({ _id: id }, { $set: atts })
        return 0
    }
}
