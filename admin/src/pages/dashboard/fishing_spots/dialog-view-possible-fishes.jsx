import {useState} from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Tooltip,
  IconButton,
  Input,
  Textarea,
  Select,
  Option
} from "@material-tailwind/react";
import { PlusCircleIcon, AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { AlertContext } from "@/context";

export function DialogViewPossibleFishes({data}) {
  const [open, setOpen] = useState(false);

  // formos laukelių duomenys
  const [mapId, setMapId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sprite, setSprite] = useState(null);
  const [world, setWorld] = useState("");

  const {addAlert, hideAllAlerts} = useContext(AlertContext);

  const [fishSprite, setFishSprite] = useState(sprite ? `/api/images/fishing-spot/` + sprite : null);

    const sprite_element = fishSprite ? (<img src={fishSprite} alt="Sprite" className="h-[160px] w-[160px] [image-rendering:pixelated] m-5 border-2 border-gray-600 rounded " /> 
  ) : (
    <div className="h-[160px] w-[160px] flex items-center justify-center bg-gray-200 border-2 border-gray-600 rounded m-5">
      <span className="text-gray-500 text-lg">X</span>
    </div>
  );

  const handleOpen = () => {
    setOpen(!open);
  }

  return (
    <>
        <Tooltip content="View possible fishes">
          <IconButton variant="text" className="text-blue-500 hover:text-blue-700" onClick={handleOpen}>
            <AdjustmentsHorizontalIcon className="h-10 w-10" />
          </IconButton>
        </Tooltip>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>{data.name}'s possible fishes</DialogHeader>
        <DialogBody className="flex flex-col gap-4">
        <div className="flex flex-row gap-4 max-h-[50vh] overflow-y-auto pr-2">
          {data.possibleFishes?.length > 0 ?
          (data.possibleFishes.map((fish) => (
            <div key={fish._id}>
              <h2 className="font-semibold text-black">{fish.gamesId}</h2>
              <div>
                <div>
                  <p>minWeight: {fish.minWeight}</p>
                </div>
                <div>
                  <p>maxWeight: {fish.maxWeight}</p>
                </div>
                <div>
                  <p>baseValue: {fish.baseValue}</p>
                </div>
                <div>
                  <p>experienceReward: {fish.experienceReward}</p>
                </div>
                <div>
                  <p>coinValue: {fish.coinValue}</p>
                </div>
              </div>
            </div>
          ))) : (<p> No possible fishes here...</p>)}
        </div>
        </DialogBody>
      </Dialog>
    </>
  );
}

export default DialogViewPossibleFishes;
