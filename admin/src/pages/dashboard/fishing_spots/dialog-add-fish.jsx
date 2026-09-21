import {useState, useEffect} from "react";
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
import AddFishListItem from "./fish-list-item";

export function DialogAddFish() {
  const [open, setOpen] = useState(false);

  const [rows, setRows] = useState([]); 
  const [selected, setSelected] = useState([])
  const [loading, setLoading] = useState(true);

  const {addAlert, hideAllAlerts} = useContext(AlertContext);

  const handleOpen = () => {
    setOpen(!open);
    if (open) {
      handleClear()
    }
  }

const handleSelect = (fish) => {
  if (selected.includes(fish)) {
    setSelected(selected.filter(item => item !== fish));
  } else {
    setSelected([...selected, fish]);
  }
};

const handleConfirm = () => {
  console.log(selected)
  setSelected([])
  handleOpen()
}

    // Loading the fish list
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fishes", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          // "Authorization": `Bearer ${token}` 
        },
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      let data = [];
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : [];
      } catch (e) {
        data = [];
      }
      
      // console.log(data[0]._id)

      setRows(data);
    } catch (e) {
      addAlert(e.message || "Failed to load fishes", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
  loadData();
  }, []);

  return (
    <>
      <Button
        onClick={handleOpen}
        variant="gradient"
        className="mx-3 mr-0 flex items-center pl-2"
      >
        <PlusCircleIcon className="mr-2 h-5 w-5" />
        Add fish
      </Button>
      <Dialog open={open} handler={handleOpen}>
        <DialogHeader>Add possible fish</DialogHeader>
        <DialogBody className="flex flex-row gap-4">
          {rows.map((data) => {

            return(
          <AddFishListItem 
          key={data._id}
          data={data}
          handleSelect={handleSelect}
          />)
        })}
          
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
          <Button variant="gradient" color="green" onClick={handleConfirm}>
            <span>Confirm</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default DialogAddFish;
