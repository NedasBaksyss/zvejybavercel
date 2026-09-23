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
  Option
} from "@material-tailwind/react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { AlertContext } from "@/context";
import { fishingWorld } from "./fishing-spot-fields";
import DialogAddFish from "./dialog-add-fish";

export function DialogEditPossible({loadData, selectedFish, handleSelect, clearSelectedFish, updateSelectedFish}) {
  const [open, setOpen] = useState(false);

  const handleOpen = () => {
    setOpen(!open);
  }

  const handleClear = () => {
    clearSelectedFish()
    handleOpen()
  }

  const handleConfirm = () => {
    console.log(selectedFish)
    handleOpen()
  }

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="gradient"
        className="mx-3 mr-0 flex items-center"
      >
        <PlusCircleIcon className="h-5 w-5" />
      </Button>
      <Dialog open={open}>
        <DialogHeader>Edit possible fishes</DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <DialogAddFish handleSelect={handleSelect} selectedFish={selectedFish}/>
          <div className="flex flex-col gap-4 max-h-[50vh] overflow-y-auto pr-2">
            {selectedFish.map((fish) => (
              <div key={fish._id}>
                <p>{fish.gamesId}</p>

              <div className="flex flex-row gap-2">
                <div className="w-[200px]">
                  <Input
                  type="number"
                  value={fish.minWeight}
                  label="minWeight"
                  onChange={(e) => {
                    updateSelectedFish(fish._id, {
                    minWeight: Number(e.target.value),
                    })
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
                    maxWeight: Number(e.target.value),
                    })
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
                    baseValue: Number(e.target.value),
                    })
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
                    experienceReward: Number(e.target.value),
                    })
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
                    coinValue: Number(e.target.value),
                    })
                  }}
                />
                </div>
                </div>
                </div>

          ))}
          </div>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleClear}
            className="mr-1">
            <span>Clear</span>
          </Button>
          <Button variant="gradient" color="green" onClick={handleConfirm}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default DialogEditPossible;
