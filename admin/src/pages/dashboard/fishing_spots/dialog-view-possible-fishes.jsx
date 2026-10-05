import { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogBody,
  Tooltip,
  IconButton
} from "@material-tailwind/react";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

export function DialogViewPossibleFishes({ data }) {
  const [open, setOpen] = useState(false);
  const [fishes, setFishes] = useState([]);

  const handleOpen = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const fetchFishes = async () => {
      if (!data?.possibleFishes?.length) {
        setFishes([]);
        return;
      }

      try {
        const fetchedFishes = await Promise.all(
          data.possibleFishes.map(async (possibleFish) => {
            const response = await fetch(`/api/fishes/${possibleFish._id}`);

            if (!response.ok) {
              throw new Error(
                `Failed to fetch fish ${possibleFish._id}`
              );
            }

            return response.json();
          })
        );

        setFishes(fetchedFishes);
      } catch (error) {
        console.error("Error fetching fishes:", error);
      }
    };

    fetchFishes();
  }, [data]);

  return (
    <>
      <Tooltip content="View possible fishes">
        <IconButton
          variant="text"
          className="text-blue-500 hover:text-blue-700"
          onClick={handleOpen}
        >
          <AdjustmentsHorizontalIcon className="h-10 w-10" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>
          {data.name}'s possible fishes
        </DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-2">
            {data.possibleFishes?.length > 0 ? (
              data.possibleFishes.map((possibleFish) => {
                // Find the fish that has the same _id
                const fish = fishes.find(
                  (fish) => fish._id === possibleFish._id
                );

                return (
                  <div
                    key={possibleFish._id}
                    className="border border-gray-300 rounded p-4"
                  >
                    <h2 className="font-semibold text-black text-lg">
                      {fish?.name ?? "Loading..."}
                    </h2>

                    <div>
                      <p>minWeight: {possibleFish.minWeight}</p>
                      <p>maxWeight: {possibleFish.maxWeight}</p>
                      <p>baseValue: {possibleFish.baseValue}</p>
                      <p>
                        experienceReward:{" "}
                        {possibleFish.experienceReward}
                      </p>
                      <p>coinValue: {possibleFish.coinValue}</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <p>No possible fishes here...</p>
            )}
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
}

export default DialogViewPossibleFishes;
