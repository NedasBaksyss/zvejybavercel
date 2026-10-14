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
import { PlusCircleIcon, SparklesIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { AuthContext, AlertContext } from "@/context";
import AddFishListItem from "./fish-list-item";

export function DialogAddFish({handleSelect, selectedFish, editMode}) {
  const [open, setOpen] = useState(false);

  const { token } = useContext(AuthContext);

  const [rows, setRows] = useState([]); 
  const [loading, setLoading] = useState(true);

  const {addAlert, hideAllAlerts} = useContext(AlertContext);

  const handleOpen = () => {
    setOpen(!open);
  }

    // Loading the fish list
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fishes", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
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
        {editMode ? (
          <>
        <PlusCircleIcon className="mr-2 h-5 w-5" />
        Edit & Add Fish
          </>
        ) : (
          <>
          <SparklesIcon className="mr-2 h-5 w-5" />
          View Preferred fishes
          </>
        )}
      </Button>
      <Dialog open={open}>
        <DialogHeader>{editMode ? "Select preferred fish" : "Preferred Fishes"} </DialogHeader>
        <DialogBody className="flex flex-row gap-4 flex-wrap justify-center h-[400px] overflow-y-scroll">
          {rows.map((data) => {

            return(
          <AddFishListItem 
          key={data._id}
          data={data}
          handleSelect={handleSelect}
          selectedFish={selectedFish}
          editMode={editMode}
          />)
        })}
          
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="green"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>X</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default DialogAddFish;
