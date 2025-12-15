const bcrypt = require('bcryptjs')
const crypto = require('crypto')

exports.hashPassword = function hashPassword(plaintext) {
    return bcrypt.hashSync(plaintext, 5)
}

exports.compareHash = function compareHash(plaintext, hash) {
    return bcrypt.compareSync(plaintext, hash)
}

exports.generateRefreshToken = function generateToken() {
    return crypto.randomBytes(20).toString('hex')
}