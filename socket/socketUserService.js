const socketUserMap=new Map();

function bindSocketToUser(socketId, userId){
    socketUserMap.set(socketId, userId);
}   

function getUsernameBySocket(socketId) {
  return socketUserMap.get(socketId);
}

function removeSocket(socketId) {
  socketUserMap.delete(socketId);
}

export {
  bindSocketToUser,
  getUsernameBySocket,
  removeSocket
};