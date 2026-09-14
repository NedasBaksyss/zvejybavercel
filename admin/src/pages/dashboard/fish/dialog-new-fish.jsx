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

  const handleOpen = () => setOpen(!open);

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
    setGamesId("")
    setName("");
    setDescription("");
    setSprite(null);
    setRarity("");

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
          <Input label="ID" size="lg" value={gamesId} onChange={(e) => setGamesId(e.target.value)} />
          <Input label="Name" size="lg" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea label="Description" size="lg" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input type="file" label="Sprite" size="lg" onChange={(e) => setSprite(e.target.files[0])} />
          <Select label="Rarity" size="lg" value={rarity} onChange={(value) => setRarity(value)}>
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
