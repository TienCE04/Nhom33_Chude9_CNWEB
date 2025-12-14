const Router = require("koa-router");
const topicController = require("../controller/topicController");
const router = Router();
const { authorize } = require("../middleware");

router.post("/create/topic", authorize, topicController.createTopic);
router.get("/topic/default", authorize, topicController.getDefaultTopic);
router.get("/topic/:username", authorize, topicController.getUserTopics);
router.put("/topic/:idTopic", authorize, topicController.updateTopic);
router.delete("/topic/:idTopic", authorize, topicController.deleteTopic);

module.exports = router;
