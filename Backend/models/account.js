const { mongoose, redis } = require("./index");
const _ = require("lodash");
const { hashPassword } = require("../utils/auth");
const jwt = require("jsonwebtoken");
const accountSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const AccountModel = mongoose.model("Account", accountSchema);

module.exports = class Account {
  static async getAccountByUsername(username) {
    const account = await AccountModel.findOne({ username }).lean();

    if (!account) {
      return {
        message: "Account not found",
        success: false,
      };
    }

    return account;
  }

  static async getAllAccounts() {
    return AccountModel.find().lean();
  }
  static async createAccount(atts) {
    if (atts.password) {
      atts.password = hashPassword(atts.password);
    }
    const account = new AccountModel(atts);
    await account.save();
    return account;
  }

  static async updateAccount(id, atts) {
    delete atts.username;
    if (atts.password) {
      atts.password = hashPassword(atts.password);
    }

    await AccountModel.updateOne({ _id: id }, { $set: atts });
    return 0;
  }

  static async forgetPassword(username) {
    const account = await AccountModel.findOne({ username });
    if (!account) {
      return { success: false, message: "Account not found" };
    }

    const token = jwt.sign(
      { username, type: "reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const resetLink = `http://localhost:3000/reset-password?token=${token}`;

    return { success: true, resetLink };
  }

  static async resetPassword(token, newPassword) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      if (payload.type !== "reset") throw new Error("Invalid token type");

      const hashedPassword = hashPassword(newPassword);
      await AccountModel.updateOne(
        { username: payload.username },
        { $set: { password: hashedPassword } }
      );

      return { success: true, message: "Password updated" };
    } catch (err) {
      return { success: false, message: "Invalid or expired token" };
    }
  }

  static async changePassword(username, oldPassword, newPassword) {
    try {
      const account = await AccountModel.findOne({ username });
      if (!account) {
        return { success: false, message: "Account not found" };
      }

      const { compareHash } = require("../utils/auth");
      if (!compareHash(oldPassword, account.password)) {
        return { success: false, message: "Current password is incorrect" };
      }

      const hashedNewPassword = hashPassword(newPassword);
      await AccountModel.updateOne(
        { username },
        { $set: { password: hashedNewPassword } }
      );

      return { success: true, message: "Password changed successfully" };
    } catch (err) {
      return { success: false, message: "Failed to change password" };
    }
  }
};
