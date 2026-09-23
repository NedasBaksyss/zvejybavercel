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

export function DialogEditPossible({loadData}) {
  const [open, setOpen] = useState(false);

  // formos laukelių duomenys
  const [mapId, setMapId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sprite, setSprite] = useState(null);
  const [world, setWorld] = useState("");

  const [selectedFish, setSelectedFish] = useState([]);

  const {addAlert, hideAllAlerts} = useContext(AlertContext);

  const [fishSprite, setFishSprite] = useState(sprite ? `/api/images/fishing-spot/` + sprite : null);

    const sprite_element = fishSprite ? (<img src={fishSprite} alt="Sprite" className="h-[160px] w-[160px] [image-rendering:pixelated] m-5 border-2 border-gray-600 rounded " /> 
  ) : (
    <div className="h-[160px] w-[160px] flex items-center justify-center bg-gray-200 border-2 border-gray-600 rounded m-5">
      <span className="text-gray-500 text-lg">X</span>
    </div>
  );

  function handleClear() {
    setMapId("")
    setName("");
    setDescription("");
    setWorld("");

    setSprite(null);
    setFishSprite(null);

  }

const handleSelect = (fish) => {
  setSelectedFish((prev) => {
    const exists = prev.some((item) => item._id === fish._id);

    if (exists) {
      return prev.filter((item) => item._id !== fish._id);
    }

    return [
      ...prev,
      {
        ...fish,
        minWeight: 0,
        maxWeight: 0,
        baseValue: 0,
        coinValue: 0,
        experienceReward: 0
      },
    ];
  });
};

  const handleOpen = () => {
    setOpen(!open);
    if (open) {
      handleClear()
    }
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
                      const minWeight = Number(e.target.value);

                      setSelectedFish((prev) =>
                        prev.map((item) =>
                          item._id === fish._id
                            ? { ...item, minWeight }
                            : item
                        )
                      );
                    }}
                  />
                </div>

                <div className="w-[200px]">
                <Input
                type="number"
                value={fish.maxWeight}
                label="maxWeight"
                onChange={(e) => {
                    const maxWeight = Number(e.target.value);

                    setSelectedFish((prev) =>
                      prev.map((item) =>
                        item._id === fish._id
                          ? { ...item, maxWeight }
                          : item
                      )
                    );
                  }}
                />
                </div>

                  <div className="w-[200px]">
                <Input
                type="number"
                value={fish.baseValue}
                label="baseValue"
                onChange={(e) => {
                    const baseValue = Number(e.target.value);

                    setSelectedFish((prev) =>
                      prev.map((item) =>
                        item._id === fish._id
                          ? { ...item, baseValue }
                          : item
                      )
                    );
                  }}
                />
                </div>

                <div className="w-[200px]">
                <Input
                type="number"
                value={fish.experienceReward}
                label="experienceReward"
                onChange={(e) => {
                    const experienceReward = Number(e.target.value);

                    setSelectedFish((prev) =>
                      prev.map((item) =>
                        item._id === fish._id
                          ? { ...item, experienceReward }
                          : item
                      )
                    );
                  }}
                />
                </div>

                <div className="w-[200px]">
                <Input
                type="number"
                value={fish.coinValue}
                label="coinValue"
                onChange={(e) => {
                    const coinValue = Number(e.target.value);

                    setSelectedFish((prev) =>
                      prev.map((item) =>
                        item._id === fish._id
                          ? { ...item, coinValue }
                          : item
                      )
                    );
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
            onClick={handleOpen}
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
