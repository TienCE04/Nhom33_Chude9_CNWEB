const Joi = require("joi");
const jwt = require("jsonwebtoken");
const axios = require("axios");

const {
  getAccountByUsername,
  createAccount,
  changePassword,
  forgetPassword,
  resetPassword,
} = require("../models/account");

const { createPlayer } = require("../models/player");
const { createProfile } = require("../models/profile");

const {
  compareHash,
  generateRefreshToken,
} = require("../utils/auth");

const RefreshToken = require("../models/refreshToken");

exports.login = async (ctx) => {
  const schema = Joi.object({
    username: Joi.string().required(),
    password: Joi.string().required(),
  });

  const { error } = schema.validate(ctx.request.body);
  if (error) {
    ctx.status = 400;
    ctx.body = { success: false, message: error.message };
    return;
  }

  const { username, password } = ctx.request.body;
  const account = await getAccountByUsername(username);

  if (!account || account.success === false) {
    ctx.status = 401;
    ctx.body = { success: false, message: "Account not found" };
    return;
  }

  if (!compareHash(password, account.password)) {
    ctx.status = 401;
    ctx.body = { success: false, message: "Invalid password" };
    return;
  }

  const accessToken = jwt.sign(
    { id: account._id, username: account.username },
    process.env.JWT_SECRET,
    { expiresIn: "6h" }
  );

  const refreshToken = generateRefreshToken();
  await RefreshToken.create({
    token: refreshToken,
    userId: account._id,
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  ctx.body = {
    success: true,
    accessToken,
    refreshToken,
    user: { id: account._id, username: account.username },
  };
};

exports.refreshToken = async (ctx) => {
  const { refreshToken } = ctx.request.body;
  if (!refreshToken) {
    ctx.status = 400;
    ctx.body = { success: false, message: "Missing refresh token" };
    return;
  }

  const stored = await RefreshToken.findOne({ token: refreshToken });
  if (!stored || stored.expiresAt < new Date()) {
    ctx.status = 401;
    ctx.body = { success: false, message: "Invalid refresh token" };
    return;
  }

  await RefreshToken.deleteOne({ token: refreshToken });

  const newRefreshToken = generateRefreshToken();
  await RefreshToken.create({
    token: newRefreshToken,
    userId: stored.userId,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  });

  const newAccessToken = jwt.sign(
    { id: stored.userId },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  ctx.body = {
    success: true,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};

//logout
exports.logout = async (ctx) => {
  const { refreshToken } = ctx.request.body;
  if (refreshToken) {
    await RefreshToken.deleteOne({ token: refreshToken });
  }

  ctx.body = { success: true, message: "Logged out" };
};

exports.forgetPassword = async (ctx) => {
  const { username } = ctx.request.body;
  const result = await forgetPassword(username);
  ctx.body = result;
};

exports.resetPassword = async (ctx) => {
  const { token, newPassword } = ctx.request.body;
  const result = await resetPassword(token, newPassword);
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
  const { token } = ctx.request.body; // đây là access_token từ frontend

  if (!token) {
    ctx.status = 400;
    ctx.body = { success: false, message: "Missing token" };
    return;
  }

  try {
    // Lấy thông tin người dùng từ Google API
    const response = await axios.get(`https://www.googleapis.com/oauth2/v2/userinfo`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const payload = response.data; // payload sẽ chứa email, name, id
    if (!payload || !payload.id || !payload.email) {
      ctx.status = 401;
      ctx.body = { success: false, message: "Invalid Google payload" };
      return;
    }

    const email = payload.email;
    const name = payload.name;
    const googleId = payload.id; // ID Google

    const ggUsername = `GG_${email}`;

    // Kiểm tra account đã có chưa
    let account = await getAccountByUsername(ggUsername);

    if (!account || account.success === false) {
      // Tạo account mới
      const newAcc = {
        username: ggUsername,
        password: `google_${googleId}`,
      };
      account = await createAccount(newAcc);

      if (!account || account.success === false) {
        ctx.status = 500;
        ctx.body = { success: false, message: "Failed to create account" };
        return;
      }

      await createPlayer(ggUsername);
      await createProfile({
        username: ggUsername,
        email,
        nickname: name,
      });
    }

    // Tạo accessToken JWT và refreshToken
    const accessToken = jwt.sign(
      { id: account._id, username: account.username },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    const refreshToken = generateRefreshToken();
    await RefreshToken.create({
      token: refreshToken,
      userId: account._id,
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    ctx.body = {
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: account._id,
        username: account.username,
        email,
        nickname: name,
      },
    };
  } catch (err) {
    console.error("Google login error:", err);
    ctx.status = 401;
    ctx.body = { success: false, message: "Invalid Google token" };
  }
};