const Router = require("koa-router");
const { login, forgetPassword, resetPassword, signup } = require("../controller/authController");

const router = new Router();

router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/signup", signup);

module.exports = router;
