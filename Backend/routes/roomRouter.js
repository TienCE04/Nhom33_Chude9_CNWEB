const Router = require("koa-router");
const roomController = require("../controller/roomController");
const { authorize } = require("../middleware");

const router = Router();

router.post("/rooms", authorize, roomController.createRoom);
router.get("/rooms",  roomController.listRooms);
router.get("/rooms/:roomId",  roomController.getRoomById);
router.delete("/rooms/:roomId", authorize, roomController.deleteRoom);
router.get('/rooms/:username', authorize, roomController.getRoomForUser);

module.exports = router;





