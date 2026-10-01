import { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Tooltip,
  IconButton,
  Typography,
} from "@material-tailwind/react";
import { GiftIcon } from "@heroicons/react/24/outline";

export function DialogViewRewards({ data }) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(!open);

  const rewards = Array.isArray(data?.reward) ? data.reward : [];

  return (
    <>
      <Tooltip content="View rewards">
        <IconButton variant="text" onClick={handleOpen}>
          <GiftIcon className="h-4 w-4 text-yellow-300" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} handler={handleOpen}>
        <DialogHeader className="justify-center">
          {data.gamesId}'s Rewards
        </DialogHeader>

        <DialogBody>
          {rewards.length > 0 ? (
            <div className="flex flex-col gap-3">
              {rewards.map((reward, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-blue-gray-50 px-4 py-3"
                >
                  {Object.entries(reward).map(([key, value]) => (
                    <div
                      key={key}
                      className="flex justify-between"
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
              ))}
            </div>
          ) : (
            <Typography className="text-center">
              No rewards...
            </Typography>
          )}
        </DialogBody>
      </Dialog>
    </>
  );
}

export default DialogViewRewards;
