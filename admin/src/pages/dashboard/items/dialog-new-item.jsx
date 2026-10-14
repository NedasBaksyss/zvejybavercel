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
import { AuthContext, AlertContext } from "@/context";
import { itemRarities, itemTypes } from "./item-fields";

export function DialogNewItem({loadData}) {
  const [open, setOpen] = useState(false);

  const { token } = useContext(AuthContext);

  // formos laukelių duomenys
  const [itemId, setItemId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [sprite, setSprite] = useState(null);
  const [rarity, setRarity] = useState("");
  const [category, setCategory] = useState("");

  const {addAlert, hideAllAlerts} = useContext(AlertContext);

  const [itemSprite, setItemSprite] = useState(sprite ? `/api/images/item/` + sprite : null);

    const sprite_element = itemSprite ? (<img src={itemSprite} alt="Sprite" className="h-[160px] w-[160px] [image-rendering:pixelated] m-5 border-2 border-gray-600 rounded " /> 
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
      setItemSprite(event.target.result);
    };
    reader.readAsDataURL(e.target.files[0]); 
  }

  function handleClear() {
    setItemId("")
    setName("");
    setDescription("");
    setRarity("");
    setCategory("");

    setSprite(null);
    setItemSprite(null);

  }

  const handleOpen = () => {
    setOpen(!open);
    if (open) {
      handleClear()
    }
  }

  // projekto kūrimo logika čia
  const handleCreateItem = async () => {
    // surenkame duomenis iš formos
    // paprastų duomenų siuntimui JSON formatu
    const itemData = {
      itemId,
      name,
      description,
      rarity,
      category
    };
    // siunčiame į API
    const response = await fetch("/api/items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}` 
      },
      body: JSON.stringify(itemData),
    });
    if (!response.ok) {
      // klaidos tvarkymas 
      addAlert("Error creating the item", "error");
      return;
    }

    const createdItem = await response.json();
    if (!createdItem || !createdItem._id) {
      addAlert("Error retrieving the created item", "error");
      return;
    }

    addAlert("Item Created", "success");

    // jei yra nuotrauka, įkelti ją atskirai
    if (sprite) {
      const formData = new FormData();
      formData.append("sprite", sprite);
      const responseSprite = await fetch(`/api/items/${createdItem._id}/sprite`, {
        method: "PUT",
        headers: {
        "Authorization": `Bearer ${token}` 
        },
        body: formData,
      });

      if (!responseSprite.ok) {
        addAlert("Error uploading the item photo", "error");
        return;
      }

      addAlert("Photo of the item uploaded.", "success");
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
        <DialogHeader>Add new item</DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <div className="flex flex-row p-5 justify-center items-center">
            <div className="font-normal shrink-0 overflow-hidden">
              {sprite_element}
            </div>
            <Input type="file" label="Sprite" size="lg" onChange={handleFileChange} />
          </div>
          <Input label="ID" size="md" value={itemId} onChange={(e) => setItemId(e.target.value)} />
          <Input label="Name" size="md" value={name} onChange={(e) => setName(e.target.value)} />
          <Textarea label="Description" size="md" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Select label="Rarity" size="md" value={rarity} onChange={(value) => setRarity(value)}>
            {itemRarities.map((r) => (
              <Option key={r} value={r} >{r}</Option>
            ))}
          </Select>
          <Select label="Category" size="md" value={rarity} onChange={(value) => setCategory(value)}>
            {itemTypes.map((r) => (
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
          <Button variant="gradient" color="green" onClick={handleCreateItem}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default DialogNewItem;
