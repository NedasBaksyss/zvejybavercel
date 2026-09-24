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
import { PlusCircleIcon, UserCircleIcon} from "@heroicons/react/24/outline";
import { useContext } from "react";
import { AlertContext } from "@/context";

export function DialogViewAccount({data}) {
  const [open, setOpen] = useState(false);

  const {addAlert, hideAllAlerts} = useContext(AlertContext);

  const handleOpen = () => setOpen(!open);

  return (
    <>
      <Tooltip content="View Account">
        <IconButton variant="text" onClick={() => handleOpen()}>
          <UserCircleIcon className="h-4 w-4 text-blue-300" />
        </IconButton>
      </Tooltip>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader className="justify-center">{data.username}'s Account</DialogHeader>
        <DialogBody className="flex flex-col">
          <p>googleId : {data.googleId}</p>
          <p>createdAt : {data.createdAt}</p>
          <p>lastLogin : {data.lastLogin}</p>
        </DialogBody>
      </Dialog>
    </>
  );
}

export default DialogViewAccount;
