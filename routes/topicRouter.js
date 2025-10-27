const Router = require("koa-router");
const topicController = require("../controller/topicController");
const router = Router();

router.post("/create/topic", topicController.createTopic);
router.get("/topic/default", topicController.getDefaultTopic);
router.get("/topic/:username", topicController.getUserTopics);

module.exports = router;
