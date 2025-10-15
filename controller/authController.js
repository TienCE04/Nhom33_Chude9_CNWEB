const Joi = require("joi");
const jwt = require("jsonwebtoken");
const { getAccountByUsername } = require("../models/account");

exports.login = async (ctx) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { body } = ctx.request;
  const err = schema.validate(body).error;

  if (err) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: "Missing or invalid params",
      verbosity: err.message,
    };
    return;
  }

  let account = await getAccountByUsername(body.username);
  if (account.success === false) {
    ctx.status = 401;
    ctx.body = { success: false, message: "Account not found" };
    return;
  }

  if (!compareHash(body.password, account.password)) {
    ctx.status = 401;
    ctx.body = { success: false, message: "Invalid password" };
    return;
  }

  const token = jwt.sign(
    { id: account._id, username: account.username },
    process.env.JWT_SECRET,
    { expiresIn: "6h" }
  );

  ctx.body = {
    success: true,
    message: "Login successful",
    token,
    user: { id: account._id, username: account.username },
  };
};
exports.forgetPassword = async (ctx) => {
  const { username } = ctx.request.body;
  const result = await Account.forgetPassword(username);
  ctx.body = result;
};

exports.resetPassword = async (ctx) => {
  const { token, newPassword } = ctx.request.body;
  const result = await Account.resetPassword(token, newPassword);
  ctx.body = result;
};
