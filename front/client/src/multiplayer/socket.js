import { io } from "socket.io-client";

export const socket = io("http://localhost:3001", {
  autoConnect: false,
});

export function connectSocket(username) {
  if (!username) return;

  // console.log("CONNECTING MULTIPLAYER AS:", username);

  const currentName = socket.auth?.name;

  if (socket.connected && currentName !== username) {
    socket.disconnect();
  }

  socket.auth = {
    name: username,
  };

  if (!socket.connected) {
    socket.connect();
  }
}

export function disconnectSocket() {
  if (socket.connected) {
    socket.disconnect();
  }
}
