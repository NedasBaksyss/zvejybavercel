import {useState} from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Input,
  Textarea,
  Select,
  Option,
  Tooltip,
  IconButton
} from "@material-tailwind/react";
import { PlusCircleIcon, PuzzlePieceIcon} from "@heroicons/react/24/outline";
import { useContext } from "react";
import { AlertContext } from "@/context";

export function DialogViewStats({data}) {
  const [open, setOpen] = useState(false);

  const {addAlert, hideAllAlerts} = useContext(AlertContext);

  const handleOpen = () => setOpen(!open);

  return (
    <>
      <Tooltip content="View Stats">
        <IconButton variant="text" onClick={() => handleOpen()}>
          <PuzzlePieceIcon className="h-4 w-4 text-blue-300" />
        </IconButton>
      </Tooltip>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader className="justify-center">{data.username}'s stats</DialogHeader>
        <DialogBody className="flex flex-col">
          <p>Total fish Caught : {data.stats.totalFishCaught}</p>
          <p>Level : {data.stats.level}</p>
          <p>Experience : {data.stats.experience}</p>
          <p>Coins : {data.stats.coins}</p>
        </DialogBody>
      </Dialog>
    </>
  );
}

export default DialogViewStats;
