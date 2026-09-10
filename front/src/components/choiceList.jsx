export function createChoiceList({ $, sound, elementId }) {
  let items = [];
  let selected = 0;

  function paint() {
    const box = $(elementId);
    box.innerHTML = "";
    items.forEach((item, index) => {
      const button = document.createElement("button");
      button.className = "item";
      button.type = "button";
      button.setAttribute("aria-selected", index === selected);
      const marker = document.createElement("span");
      marker.className = "bob";
      const label = document.createElement("span");
      label.textContent = item.text;
      button.append(marker, label);
      button.addEventListener("pointerenter", () => {
        if (selected !== index) {
          selected = index;
          paint();
          sound.move();
        }
      });
      button.addEventListener("click", () => {
        selected = index;
        sound.confirm();
        item.run();
      });
      box.appendChild(button);
    });
  }

  return {
    set(list) {
      items = list;
      selected = 0;
      paint();
    },
    paint,
    key(event) {
      if (!items.length) return;
      if (event.key === "ArrowUp" || event.key === "w") {
        selected = (selected - 1 + items.length) % items.length;
        paint();
        sound.move();
      }
      if (event.key === "ArrowDown" || event.key === "s") {
        selected = (selected + 1) % items.length;
        paint();
        sound.move();
      }
      if (event.key === "Enter" || event.key === " ") {
        sound.confirm();
        items[selected].run();
      }
    },
  };
}
