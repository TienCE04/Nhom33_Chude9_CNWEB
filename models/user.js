const mongoose = require('mongoose')
const _ = require('lodash')
const { hashPassword } = require('../utils/auth')


const userSchema = new mongoose.Schema({

}, { timestamps: true })


const UserModel = mongoose.model('User', userSchema)

module.exports = class User {

    static async fetchUserByEmail(email) {
        const user = await UserModel.findOne({ email }).lean()

        if (!user) {
            throw new Error('user not found')
        }

        const permissions = await Role.getPermissionsByRole(user.role_id)

        user.permissions = permissions.map(p =>
            _.pick(p, ['resource_code', 'permission_code'])
        )

        user.is_admin = user.role_id === 'admin'

        return user
    }

   
    static async getUsers() {
        return UserModel.find().lean()
    }


    static async updateUser(id, atts) {
        delete atts.email
        if (atts.password) {
            atts.password_hash = hashPassword(atts.password)
            delete atts.password
        }

        await UserModel.updateOne({ _id: id }, { $set: atts })
        return 0
    }
}
