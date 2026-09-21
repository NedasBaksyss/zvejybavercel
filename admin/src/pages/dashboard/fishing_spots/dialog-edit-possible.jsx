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

  const [selected, setSelected] = useState([])

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
  if (selected.includes(fish)) {
    setSelected(selected.filter(item => item !== fish));
  } else {
    setSelected([...selected, fish]);
  }
};

  const handleClearSelect = () => {
    console.log(selected)
    setSelected([])
  }

  const handleOpen = () => {
    setOpen(!open);
    if (open) {
      handleClear()
    }
  }

  // projekto kūrimo logika čia
  const handleCreateFish = async () => {
    // surenkame duomenis iš formos
    // paprastų duomenų siuntimui JSON formatu
    const fishData = {
      mapId,
      name,
      description,
      world
    };
    // siunčiame į API
    const response = await fetch("/api/fishingspots", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fishData),
    });
    if (!response.ok) {
      // klaidos tvarkymas 
      addAlert("Error creating the fishing spot", "error");
      return;
    }

    const createdFish = await response.json();
    if (!createdFish || !createdFish._id) {
      addAlert("Error retrieving the created fishing spot", "error");
      return;
    }

    addAlert("Fishing spot created", "success");

    // jei yra nuotrauka, įkelti ją atskirai
    if (sprite) {
      const formData = new FormData();
      formData.append("sprite", sprite);
      const responseSprite = await fetch(`/api/fishing-spot/${createdFish._id}/sprite`, {
        method: "PUT",
        body: formData,
      });

      if (!responseSprite.ok) {
        addAlert("Error uploading the fishing spot's sprite", "error");
        return;
      }

      addAlert("Sprite of the fishing spot uploaded.", "success");
    }

    // atnaujiname projektų sąrašą
    loadData();

    // Išvvalome formos laukelius
    handleClear();

    handleOpen(); // uždaryti dialogą po kūrimo
  };

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="gradient"
        className="mx-3 mr-0 flex items-center pl-2"
      >
        <PlusCircleIcon className="h-5 w-5" />
      </Button>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>Edit possible fishes</DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <DialogAddFish handleSelect={handleSelect} handleClearSelect={handleClearSelect}/>
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Cancel</span>
          </Button>
          <Button variant="gradient" color="green" onClick={handleCreateFish}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default DialogEditPossible;
