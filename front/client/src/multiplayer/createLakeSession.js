export function createLakeSession({ socket, runtime, publish, applySpot, leaveLocation }) {
  let requestId = 0;

  function release() {
    if (socket.connected) socket.emit("player:fishing", { fishing: null });
  }

  function join(lakeId, platformId, onJoined = applySpot) {
    if (runtime.state.enteringLocation) return false;
    if (!socket.connected) {
      runtime.state.locationError = "offline";
      publish(true);
      return false;
    }
    const currentRequest = ++requestId;
    runtime.state.enteringLocation = true;
    runtime.state.locationError = null;
    publish(true);
    socket.timeout(5000).emit("lake:join", { lakeId, platformId }, (timeout, response) => {
      if (currentRequest !== requestId || runtime.stopped) return;
      runtime.state.enteringLocation = false;
      if (timeout || !response?.ok) {
        // A timed-out join may already have reserved a spot on the server.
        release();
        if (runtime.state.destination?.type === "lake") leaveLocation();
        runtime.state.locationError = timeout ? "timeout" : response?.error || "invalid";
        publish(true);
        return;
      }
      onJoined(response.fishing);
    });
    return true;
  }

  function onConnect() {
    const place = runtime.state.destination;
    if (place?.type === "lake") join(place.id, runtime.state.platformId);
  }

  function onDisconnect() {
    requestId++;
    runtime.state.enteringLocation = false;
    if (runtime.state.destination?.type === "lake") {
      applySpot(null);
      runtime.state.locationError = "offline";
    }
    publish(true);
  }

  function leave() {
    requestId++;
    release();
    runtime.state.enteringLocation = false;
    runtime.state.locationError = null;
  }

  socket.on("connect", onConnect);
  socket.on("disconnect", onDisconnect);
  return {
    join,
    leave,
    cancelEntry() { if (runtime.state.enteringLocation) leave(); },
    dispose() {
      leave();
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    },
  };
}
