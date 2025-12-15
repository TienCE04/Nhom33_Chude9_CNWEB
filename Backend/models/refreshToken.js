const {mongoose} = require('./index');

const refreshTokenSchema = new mongoose.Schema({
    token: {type: String, required: true},
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'Account', required: true},
    expiryDate: {type: Date, required: true}
});

module.exports = mongoose.model('RefreshToken', refreshTokenSchema);    