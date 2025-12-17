const Router = require("koa-router");
const playerController = require("../controller/playerController");
const router = Router();
const { authorize } = require("../middleware");

router.get("/player/:username", authorize, playerController.getPlayer);
router.get("/player/rankings", authorize, playerController.getRankPlayer);

module.exports = router;
