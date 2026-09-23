import { useDraggable } from "@dnd-kit/core";

import {
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Button,
} from "@material-tailwind/react";
import { ArrowsUpDownIcon } from "@heroicons/react/24/solid";

export function Draggable({ item }) {
  const { attributes, listeners, setNodeRef, transform, isDragging, overlay, over, active } = useDraggable({
    id: item.id,
  });

  const style = transform
    ? {
        transform: `translate3d(0, ${transform.y}px, 0)`,
        transition: "transform 200ms ease",
      }
    : undefined;

  return (
    <ListItem
      key={item.id}
      ref={setNodeRef}
      style={style}
      className={`mb-0 p-0 pr-2 bg-white rounded-lg shadow-md hover:bg-gray-100 ${isDragging ? "opacity-70" : "opacity-100"}`}
    >
      <ListItemPrefix className="p-4 hover:bg-gray-200 cursor-grab" {...listeners} {...attributes}>
        <ArrowsUpDownIcon className="h-5 w-5" />
      </ListItemPrefix>
      {item.content} - ({transform && transform.y}) - ({isDragging ? "dragging" : "not dragging"}) - ({over ? `over: ${over.id}` : "not over"}) 
      <ListItemSuffix>
        <Button>X</Button>
      </ListItemSuffix>
    </ListItem>
  );
}
export default Draggable;
