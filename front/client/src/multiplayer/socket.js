import { io } from "socket.io-client";

const socketUrl = import.meta.env.VITE_SOCKET_URL ||
  (import.meta.env.DEV ? "http://localhost:3001" : window.location.origin);

export const socket = io(socketUrl, {
  autoConnect: false,
  transports: ["websocket"],
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
