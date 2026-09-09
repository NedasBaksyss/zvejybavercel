import React, { useRef, useEffect, useState, Fragment } from "react";
import {
  Typography,
  Alert,
  Card,
  CardHeader,
  CardBody,
  List,
  ListItem,
  ListItemPrefix,
  ListItemSuffix,
  Button,
} from "@material-tailwind/react";
import {
  ArrowsUpDownIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

import { DndContext } from "@dnd-kit/core";
import { Draggable } from "./draggale";
import { Droppable } from "./droppable";
import { use } from "react";

export function Sorting() {
  const isDragging = useRef(false);
  const dragItemId = useRef(null);

  const [data, setData] = useState([
    { id: 1, sortOrder: 1, content: "vienas" },
    { id: 2, sortOrder: 8, content: "du" },
    { id: 3, sortOrder: 3, content: "trys" },
    { id: 4, sortOrder: 6, content: "keturi" },
    { id: 5, sortOrder: 5, content: "penki" },
    { id: 6, sortOrder: 4, content: "šeši" },
    { id: 7, sortOrder: 7, content: "septyni" },
    { id: 8, sortOrder: 2, content: "aštuoni" },
  ]);

  const [sortedData, setSortedData] = useState(
    data.sort((a, b) => a.sortOrder - b.sortOrder),
  );

  const changeSortOrder = (id, sortOrder) => {
    const newData = sortedData
      .map((item) => {
        if (item.id === id) {
          return { ...item, sortOrder: sortOrder + 1 };
        } else if (item.sortOrder > sortOrder) {
          return { ...item, sortOrder: item.sortOrder + 1 };
        }
        return item;
      })
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((item, index) => {
        return { ...item, sortOrder: index + 1 };
      });

    setSortedData(newData);
  };

  const listItems = sortedData.map((item) => {
    return (
      <Fragment key={item.id}>
        <Draggable key={item.id} id={item.id} item={item} />
        <Droppable
          key={"drop-" + item.id}
          id={item.id}
          sortOrder={item.sortOrder}
        />
      </Fragment>
    );
  });

  function handleDragEnd(event) {
    // console.log(event);
    // console.log(event.active.id, event.over.data.current.sortOrder);
    changeSortOrder(event.active.id, event.over.data.current.sortOrder);
  }

  return (
    <div className="mx-auto my-20 flex max-w-screen-lg flex-col gap-8">
      <Card>
        <CardHeader
          color="transparent"
          floated={false}
          shadow={false}
          className="m-0 p-4"
        >
          <Typography variant="h5" color="blue-gray">
            Sorting
          </Typography>
        </CardHeader>
        <CardBody className="flex flex-col gap-4 p-4">
          <List className="relative">
            <DndContext onDragEnd={handleDragEnd}>
              <Droppable key={0} id={0} sortOrder={0} />
              {listItems}
            </DndContext>
          </List>
        </CardBody>
      </Card>
    </div>
  );
}
export default Sorting;
