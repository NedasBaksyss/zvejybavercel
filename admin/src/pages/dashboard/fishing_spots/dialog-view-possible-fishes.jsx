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
          {data.possibleFish ?
          (data.possibleFish.map((fish) => (
            <p>{fish}</p>
          ))) : (<p> No possible fishes here...</p>)}
          {/* <div className="flex flex-row p-5 justify-center items-center">
            <div className="font-normal shrink-0 overflow-hidden">
              {sprite_element}
            </div>
            <Input type="file" label="Sprite" size="lg" onChange={handleFileChange} />
          </div>
          <Input label="ID" size="md" value={mapId} onChange={(e) => setMapId(e.target.value)} />
          <Input label="Name" size="md" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea label="Description" size="md" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select label="World" size="md" value={world} onChange={(value) => setWorld(value)}>
            {fishingWorld.map((r) => (
              <Option key={r} value={r} >{r}</Option>
            ))}
          </Select> */}
        </DialogBody>
      </Dialog>
    </>
  );
}

export default DialogViewPossibleFishes;
