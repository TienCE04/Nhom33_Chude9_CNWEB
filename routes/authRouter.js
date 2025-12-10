const Router = require("koa-router");
const { login, forgetPassword, resetPassword, signup, changePassword,googleLogin } = require("../controller/authController");
const { authorize } = require("../middleware");

const router = new Router();

router.post("/login", login);
router.post("/forget-password", forgetPassword);
router.post("/reset-password", resetPassword);
router.post("/signup", signup);
router.post("/change-password", authorize, changePassword);
router.post("/auth/google-login", googleLogin);

module.exports = router;
