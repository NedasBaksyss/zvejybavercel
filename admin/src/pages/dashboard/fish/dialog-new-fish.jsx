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
import { fishRarities } from "./fish-fields";

export function DialogNewFish({loadData}) {
  const [open, setOpen] = useState(false);

  // formos laukelių duomenys
  const [gamesId, setGamesId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sprite, setSprite] = useState(null);
  const [rarity, setRarity] = useState("");

  const {addAlert, hideAllAlerts} = useContext(AlertContext);

  const [fishSprite, setFishSprite] = useState(sprite ? `/api/images/fish/` + sprite : null);

    const sprite_element = fishSprite ? (<img src={fishSprite} alt="Sprite" className="h-[160px] w-[160px] [image-rendering:pixelated] m-5 border-2 border-gray-600 rounded " /> 
  ) : (
    <div className="h-[160px] w-[160px] flex items-center justify-center bg-gray-200 border-2 border-gray-600 rounded m-5">
      <span className="text-gray-500 text-lg">X</span>
    </div>
  );

  function handleFileChange(e) {
    setSprite(e.target.files[0]);

    // atvaizduojame naują nuotrauką iš karto
    const reader = new FileReader();
    reader.onload = (event) => {
      setFishSprite(event.target.result);
    };
    reader.readAsDataURL(e.target.files[0]); 
  }

  function handleClear() {
    setGamesId("")
    setName("");
    setDescription("");
    setRarity("");

    setSprite(null);
    setFishSprite(null);

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
      gamesId,
      name,
      description,
      rarity
    };
    // siunčiame į API
    const response = await fetch("/api/fishes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(fishData),
    });
    if (!response.ok) {
      // klaidos tvarkymas 
      addAlert("Error creating the fish", "error");
      return;
    }

    const createdFish = await response.json();
    if (!createdFish || !createdFish._id) {
      addAlert("Error retrieving the created fish", "error");
      return;
    }

    addAlert("Fish Created", "success");

    // jei yra nuotrauka, įkelti ją atskirai
    if (sprite) {
      const formData = new FormData();
      formData.append("sprite", sprite);
      const responseSprite = await fetch(`/api/fishes/${createdFish._id}/sprite`, {
        method: "PUT",
        body: formData,
      });

      if (!responseSprite.ok) {
        addAlert("Error uploading the fish photo", "error");
        return;
      }

      addAlert("Photo of the fish uploaded.", "success");
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
        <PlusCircleIcon className="mr-2 h-5 w-5" />
        Create
      </Button>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>Add new fish</DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <div className="flex flex-row p-5 justify-center items-center">
            <div className="font-normal shrink-0 overflow-hidden">
              {sprite_element}
            </div>
            <Input type="file" label="Sprite" size="lg" onChange={handleFileChange} />
          </div>
          <Input label="ID" size="md" value={gamesId} onChange={(e) => setGamesId(e.target.value)} />
          <Input label="Name" size="md" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea label="Description" size="md" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select label="Rarity" size="md" value={rarity} onChange={(value) => setRarity(value)}>
            {fishRarities.map((r) => (
              <Option key={r} value={r} >{r}</Option>
            ))}
          </Select>
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

export default DialogNewFish;
