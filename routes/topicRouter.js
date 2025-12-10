const Router = require("koa-router");
const topicController = require("../controller/topicController");
const router = Router();

router.post("/create/topic", topicController.createTopic);
router.get("/topic/default", topicController.getDefaultTopic);
router.get("/topic/:username", topicController.getUserTopics);
router.put("/topic/:idTopic", topicController.updateTopic);
router.delete("/topic/:idTopic", topicController.deleteTopic);

module.exports = router;
