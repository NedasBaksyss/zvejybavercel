export function createGameHooks({ root, ui, store, getPlayer, getSlot }) {
  const map = {};
  const hooks = {
    on(event, handler) {
      (map[event] = map[event] || []).push(handler);
    },
    emit(event, data) {
      (map[event] || []).forEach((handler) => handler(data));
    },
  };

  window.Game = {
    on: hooks.on,
    show: () => {
      root.style.display = "flex";
      ui.go("title");
    },
    hide: () => {
      root.style.display = "none";
    },
    settings: () => store.all(),
    player: getPlayer,
    slot: getSlot,
  };

  return {
    hooks,
    stop() {
      if (window.Game) delete window.Game;
    },
  };
}
