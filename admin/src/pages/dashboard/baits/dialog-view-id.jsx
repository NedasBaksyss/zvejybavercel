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
import { PlusCircleIcon, FingerPrintIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { AlertContext } from "@/context";

export function DialogViewId({data}) {
  const [open, setOpen] = useState(false);

  const {addAlert, hideAllAlerts} = useContext(AlertContext);

  const handleOpen = () => setOpen(!open);

  return (
    <>
      <Tooltip content="View ID">
        <IconButton variant="text" onClick={() => handleOpen()}>
          <FingerPrintIcon className="h-4 w-4 text-blue-300" />
        </IconButton>
      </Tooltip>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader className="justify-center">{data.baitId} ID</DialogHeader>
        <DialogBody className="flex justify-center">
          <p>{data._id}</p>
        </DialogBody>
      </Dialog>
    </>
  );
}

export default DialogViewId;
