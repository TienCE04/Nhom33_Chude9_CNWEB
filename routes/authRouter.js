const Router = require("koa-router");
const { login, forgetPassword, resetPassword } = require("../controller/authController");

const router = new Router();

router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);

module.exports = router;
