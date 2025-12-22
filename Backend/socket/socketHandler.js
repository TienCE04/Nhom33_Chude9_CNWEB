const {Server} = require("socket.io");
let io;
const {attachSocketEvents, handleLeaveRoom} = require("./socketEventsHandler")

function initSocket(server) {
  io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Client connected:", socket.id);
    attachSocketEvents(io, socket);

    socket.on("disconnect", async () => {
    console.log("Client disconnected:", socket.id);

    const { roomId, username } = socket.data; // dữ liệu lưu từ join_room
    if (roomId && username) {
      await handleLeaveRoom(io, socket, roomId, username);
    }
  });
  });
}

function getIO() {
  if (!io) throw new Error("Socket.io chưa được khởi tạo");
  return io;
}

module.exports = { initSocket, getIO };