const Router = require("koa-router");
const roomController = require("../controller/roomController");

const router = Router();

router.post("/rooms", roomController.createRoom);
router.get("/rooms", roomController.listRooms);
router.get("/rooms/:roomId", roomController.getRoomById);
router.delete("/rooms/:roomId", roomController.deleteRoom);

module.exports = router;





