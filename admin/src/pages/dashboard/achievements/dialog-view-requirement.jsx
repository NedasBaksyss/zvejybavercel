import { useState, useContext } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Tooltip,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { FingerPrintIcon } from "@heroicons/react/24/outline";
import { AlertContext } from "@/context";

export function DialogViewRequirements({ data }) {
  const [open, setOpen] = useState(false);

  const { addAlert, hideAllAlerts } = useContext(AlertContext);

  const handleOpen = () => setOpen(!open);

  const requirement = data?.requirement;

  const hasRequirements =
    requirement &&
    typeof requirement === "object" &&
    Object.keys(requirement).length > 0;

  return (
    <>
      <Tooltip content="View requirement">
        <IconButton variant="text" onClick={handleOpen}>
          <FingerPrintIcon className="h-4 w-4 text-blue-300" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} handler={handleOpen}>
        <DialogHeader className="justify-center">
          {data.gamesId}'s Requirements
        </DialogHeader>

        <DialogBody>
          {hasRequirements ? (
            <div className="flex flex-col gap-3">
              {Object.entries(requirement).map(([key, value]) => (
                <div
                  key={key}
                  className="flex justify-between rounded-lg bg-blue-gray-50 px-4 py-3"
                >
                  <Typography className="font-semibold capitalize">
                    {key.replace(/_/g, " ")}
                  </Typography>

                  <Typography>
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value)}
                  </Typography>
                </div>
              ))}
            </div>
          ) : (
            <Typography className="text-center">
              No requirements...
            </Typography>
          )}
        </DialogBody>
      </Dialog>
    </>
  );
}

export default DialogViewRequirements;
