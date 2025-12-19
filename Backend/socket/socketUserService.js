// Lưu trữ socketId -> username
const socketToUserMap = new Map();
// Lưu trữ username -> socketId (Dùng để tìm socket của một người cụ thể)
const userToSocketMap = new Map();

function bindSocketToUser(socketId, username) {
  socketToUserMap.set(socketId, username);
  userToSocketMap.set(username, socketId);
}

function getUsernameBySocket(socketId) {
  return socketToUserMap.get(socketId);
}

function getSocketIdByUsername(username) {
  return userToSocketMap.get(username);
}

function removeSocket(socketId) {
  const username = socketToUserMap.get(socketId);
  if (username) {
    userToSocketMap.delete(username);
  }
  socketToUserMap.delete(socketId);
}

module.exports = {
  bindSocketToUser,
  getUsernameBySocket,
  getSocketIdByUsername,
  removeSocket
};