import { useEffect, useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input
} from "@material-tailwind/react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import DialogAddFish from "./dialog-add-fish";

export function DialogEditPossible({
  loadData,
  selectedFish,
  handleSelect,
  updateSelectedFish
}) {
  const [open, setOpen] = useState(false);
  const [fishes, setFishes] = useState([]);

  const handleOpen = () => {
    setOpen(!open);
  };

  useEffect(() => {
    const fetchFishes = async () => {
      if (!selectedFish?.length) {
        setFishes([]);
        return;
      }

      try {
        const fetchedFishes = await Promise.all(
          selectedFish.map(async (possibleFish) => {
            const response = await fetch(
              `/api/fishes/${possibleFish._id}`
            );

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
  }, [selectedFish]);

  const handleConfirm = () => {
    console.log(selectedFish);
    handleOpen();
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="gradient"
        className="mx-3 mr-0 flex items-center"
      >
        <PlusCircleIcon className="h-5 w-5" />
      </Button>

      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>Edit possible fishes</DialogHeader>

        <DialogBody className="flex flex-col gap-4">
          <DialogAddFish
            handleSelect={handleSelect}
            selectedFish={selectedFish}
          />

          <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-2">
            {selectedFish?.length > 0
              ? selectedFish.map((fish) => {
                  const fishData = fishes.find(
                    (f) => f._id === fish._id
                  );

                  return (
                    <div key={fish._id}>
                      <p className="font-semibold mb-2">
                        {fishData?.name ?? "Loading..."}
                      </p>

                      <div className="flex flex-row gap-2">
                        <div className="w-[200px]">
                          <Input
                            type="number"
                            value={fish.minWeight}
                            label="minWeight"
                            onChange={(e) => {
                              updateSelectedFish(fish._id, {
                                minWeight: Number(e.target.value)
                              });
                            }}
                          />
                        </div>

                        <div className="w-[200px]">
                          <Input
                            type="number"
                            value={fish.maxWeight}
                            label="maxWeight"
                            onChange={(e) => {
                              updateSelectedFish(fish._id, {
                                maxWeight: Number(e.target.value)
                              });
                            }}
                          />
                        </div>

                        <div className="w-[200px]">
                          <Input
                            type="number"
                            value={fish.baseValue}
                            label="baseValue"
                            onChange={(e) => {
                              updateSelectedFish(fish._id, {
                                baseValue: Number(e.target.value)
                              });
                            }}
                          />
                        </div>

                        <div className="w-[200px]">
                          <Input
                            type="number"
                            value={fish.experienceReward}
                            label="experienceReward"
                            onChange={(e) => {
                              updateSelectedFish(fish._id, {
                                experienceReward: Number(e.target.value)
                              });
                            }}
                          />
                        </div>

                        <div className="w-[200px]">
                          <Input
                            type="number"
                            value={fish.coinValue}
                            label="coinValue"
                            onChange={(e) => {
                              updateSelectedFish(fish._id, {
                                coinValue: Number(e.target.value)
                              });
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })
              : null}
          </div>
        </DialogBody>

        <DialogFooter>
          <Button
            variant="gradient"
            color="green"
            onClick={handleConfirm}
          >
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default DialogEditPossible;
