const Joi = require("joi");
const jwt = require("jsonwebtoken");
const request = require("request");
const {
  getAccountByUsername,
  createAccount,
  changePassword,
} = require("../models/account");
const { createPlayer } = require("../models/player");
const { createProfile } = require("../models/profile");
const { compareHash } = require("../utils/auth");
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

exports.signup = async (ctx) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().email(),
    nickname: Joi.string(),
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
  const player_check = await getAccountByUsername(body.username);
  if (player_check.success === true) {
    ctx.status = 409;
    ctx.body = { success: false, message: "Username already exists" };
    return;
  }

  const newAccount = { username: body.username, password: body.password };
  const account = await createAccount(newAccount);
  if (account.success === false) {
    ctx.status = 500;
    ctx.body = { success: false, message: "Failed to create account" };
    return;
  }

  const player = await createPlayer(body.username);
  if (player.success === false) {
    ctx.status = 500;
    ctx.body = { success: false, message: "Failed to create player" };
    return;
  }

  const profile = await createProfile({
    username: body.username,
    email: body.email || "",
    nickname: body.nickname || "",
  });
  if (profile.success === false) {
    ctx.status = 500;
    ctx.body = { success: false, message: "Failed to create profile" };
    return;
  }

  ctx.body = {
    success: true,
    message: "Signup successful",
    account,
    player,
    profile,
  };
};

exports.changePassword = async (ctx) => {
  const schema = Joi.object({
    oldPassword: Joi.string().required(),
    newPassword: Joi.string()
      .min(6)
      .required(),
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

  if (body.oldPassword === body.newPassword) {
    ctx.status = 400;
    ctx.body = {
      success: false,
      message: "New password must be different from current password",
    };
    return;
  }

  // Lấy username từ token (đã được verify bởi middleware authorize)
  const username = ctx.User.username;
  const result = await changePassword(
    username,
    body.oldPassword,
    body.newPassword
  );

  if (result.success) {
    ctx.status = 200;
    ctx.body = result;
  } else {
    ctx.status = 400;
    ctx.body = result;
  }
};
exports.googleLogin = async (ctx) => {
  const { token } = ctx.request.body;

  if (!token) {
    ctx.status = 400;
    ctx.body = { success: false, message: "Missing token" };
    return;
  }

  try {
    // Verify token từ Google bằng cách gọi UserInfo endpoint
    const userInfo = await new Promise((resolve, reject) => {
      request(
        {
          url: "https://www.googleapis.com/oauth2/v3/userinfo",
          headers: { Authorization: `Bearer ${token}` },
          json: true,
        },
        (err, response, body) => {
          if (err) reject(err);
          else if (response.statusCode !== 200)
            reject(new Error("Failed to fetch user info"));
          else resolve(body);
        }
      );
    });

    const email = userInfo.email;
    const name = userInfo.name;
    const googleId = userInfo.sub;

    // Kiểm tra account tồn tại chưa
    let account = await getAccountByUsername(email);

    if (account.success === false) {
      const newAcc = {
        username: email,
        password: `google_${googleId}`,
      };

      account = await createAccount(newAcc);

      await createPlayer(email);
      await createProfile({ username: email, nickname: name, email });
    }

    const jwtToken = jwt.sign(
      { id: account._id, username: account.username },
      process.env.JWT_SECRET,
      { expiresIn: "6h" }
    );

    ctx.body = {
      success: true,
      message: "Google login successful",
      token: jwtToken,
      user: {
        id: account._id,
        username: account.username,
        email,
        nickname: name,
      },
    };
  } catch (err) {
    console.log(err);
    ctx.status = 401;
    ctx.body = { success: false, message: "Invalid Google token" };
  }
};
