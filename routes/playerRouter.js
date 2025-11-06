const Router = require("koa-router");
const playerController = require("../controller/playerController");
const router = Router();

router.get("/player/:username", playerController.getPlayer);
router.get("/player/rankings", playerController.getAllRankPlayer);

module.exports = router;
