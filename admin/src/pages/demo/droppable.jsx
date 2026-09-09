import { useDroppable } from "@dnd-kit/core";
import { List } from "@material-tailwind/react";

export function Droppable({ children, id, sortOrder }) {
  const { isOver, setNodeRef } = useDroppable({
    id: id,
    data: { sortOrder: sortOrder },
  });

  return (
    <div
      ref={setNodeRef}
      className={`transition-all duration-300 ${
        isOver ? "border-2 border-dashed p-6 bg-green-100" : "p-2"
      }`}
    >
      {children}
    </div>
  );
}

export default Droppable;
