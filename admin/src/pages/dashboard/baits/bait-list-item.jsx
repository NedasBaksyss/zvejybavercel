import {
  Typography,
  IconButton,
  Tooltip,
  Select,
  Option,
  Switch,
  Input,
  Textarea,
} from "@material-tailwind/react";

import { useState, useContext } from "react";
import { AuthContext, AlertContext } from "@/context";
import { CheckIcon, XMarkIcon, PencilIcon, TrashIcon, FingerPrintIcon } from "@heroicons/react/24/outline";
import { baitRarities } from "./bait-fields";
import DialogViewId from "./dialog-view-id";

export function BaitListItem({data, isLast, rows, setRows, error, setError, loadData}) {
  const { _id, sprite} = data;

  const [id, setId] = useState(data._id)
  const [baitId, setBaitId] = useState(data.baitId)
  const [name, setName] = useState(data.name);
  const [description, setDescription] = useState(data.description);
  const [rarity, setRarity] = useState(data.rarity);

  const [spriteName, setSpriteName] = useState("");
  const [spriteFile, setSpriteFile] = useState();
  const [baitSprite, setBaitSprite] = useState(sprite ? `/api/images/bait/` + sprite : null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { token } = useContext(AuthContext);
  const { addAlert, hideAllAlerts } = useContext(AlertContext);

  const sprite_element = baitSprite ? (<img src={baitSprite} alt="Sprite" className="h-12 w-12 object-cover" /> 
  ) : (
    <div className="h-12 w-12 flex items-center justify-center bg-gray-200">
      <span className="text-gray-500 text-sm">X</span>
    </div>
  );

  function handleFileChange(e) {
    setSpriteName(e.target.value);
    setSpriteFile(e.target.files[0]);

    // atvaizduojame naują nuotrauką iš karto
    const reader = new FileReader();
    reader.onload = (event) => {
      setBaitSprite(event.target.result);
    };
    reader.readAsDataURL(e.target.files[0]);    
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/baits/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      loadData();
      addAlert("Bait successfully deleted.", "success");
    } catch (e) {
      addAlert(e.message || "Failed to delete the bait.", "error");
    } 
  };

  const confirmEdit = async () => {
    let dataSendSuccess = false;
    let spriteSendSuccess = true;

    // surenkame duomenis
    const updatedData = {
      baitId,
      name,
      description,
      rarity
    };

    // jei laukeliai tušti, pranešame klaidą
    if (!updatedData.baitId || !updatedData.name || !updatedData.description || !updatedData.rarity) {
      addAlert("Fill in all fields before submitting.", "error");
      return;
    }

    // dumenų siuntimas
    try {
      const res = await fetch(`/api/baits/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      addAlert("The bait has been successfully updated.", "success");
      dataSendSuccess = true;
    } catch (e) {
      addAlert(e.message || "Failed to update bait", "error");
    }

    // nuotraukos siuntimas, jei pasirinkta
    if (spriteFile && dataSendSuccess) {
      spriteSendSuccess = false;
      const formData = new FormData();
      formData.append("sprite", spriteFile);  
      try {
        const res = await fetch(`/api/baits/${id}/sprite`, {
          method: "PUT",
          headers: { 
            "Authorization": `Bearer ${token}` 
          },
          body: formData,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        spriteSendSuccess = true;
        addAlert("The bait photo has been successfully updated.", "success");
      } catch (e) {
        addAlert(e.message || "Failed to update the bait photo.", "error");
      }
    }

    if (spriteSendSuccess && dataSendSuccess) {
      loadData();
      setEditMode(false);
    }
  };

  const cancelEdit = () => {
    setBaitId(data.baitId);
    setName(data.name);
    setDescription(data.description);
    setRarity(data.rarity);
    setEditMode(false);

    setSpriteName('');
    setSpriteFile(null);
    setBaitSprite(sprite ? `/api/images/bait/` + sprite : null);
  }

  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

  return (
    <tr className={confirmDelete ? "bg-red-100" : ""}>
      <td className={classes}>
        <div className=""> 
          {editMode ? (
            <Input 
              type="text" 
              label="Id"
              value={baitId} 
              onChange={(e) => setBaitId(e.target.value)} 
            />
          ) : (
            <Typography variant="small" color="blue-gray" className="font-normal">
              {baitId}
            </Typography>
          )}
        </div>
      </td>
      <td className={classes}>
        <div className=""> 
          <Typography variant="small" color="blue-gray" className="font-normal">
            {sprite_element}
          </Typography>

          {editMode ? (
          <input
            type="file"
            value={spriteName}
            onChange={handleFileChange}
          />
          ) : null}


        </div>
      </td>
      <td className={classes}>
        <div className=""> 
          {editMode ? (
            <Input 
              type="text" 
              label="Name"
              value={name} 
              onChange={(e) => setName(e.target.value)} 
            />
          ) : (
            <Typography variant="small" color="blue-gray" className="font-normal">
              {name}
            </Typography>
          )}
        </div>
      </td>
      <td className={classes}>
        <div className=""> 
          {editMode ? (
            <Textarea 
              type="text" 
              label="Description"
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
            />
          ) : (
            <Typography variant="small" color="blue-gray" className="font-normal">
              {description}
            </Typography>
          )}
        </div>
      </td>
      <td className={classes}>
        <div className=""> 
          {editMode ? (
              <Select label="Rarity" size="lg" value={rarity} onChange={(value) => setRarity(value)}>
                {baitRarities.map((r) => (
                  <Option key={r} value={r} >{r}</Option>
                ))}
              </Select>
          ) : (
            <Typography variant="small" color="blue-gray" className="font-normal">
              {rarity}
            </Typography>
          )}
        </div>
      </td>

      {confirmDelete ? (
      <td className={classes}>
        <Tooltip content="Confirm deletion">
          <IconButton variant="text" className="bg-red-300 hover:bg-red-500 text-white mr-2" onClick={handleDelete}>
            <CheckIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
        <Tooltip content="Cancel deletion">
          <IconButton variant="text" onClick={() => setConfirmDelete(false)}>
            <XMarkIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      </td>
      ) : 
      editMode ? (
      <td className={classes}>
        <Tooltip content="Confirm edit">
          <IconButton variant="text" className="text-green-500 hover:text-green-700 mr-2" onClick={confirmEdit}>
            <CheckIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
        <Tooltip content="Cancel editing">
          <IconButton variant="text" onClick={cancelEdit}>
            <XMarkIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      </td>
      )
      : (
      <td className={classes}>
        <Tooltip content="Edit">
          <IconButton variant="text" className="mr-2" onClick={() => setEditMode(true)}>
            <PencilIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
        <Tooltip content="Delete">
          <IconButton variant="text" onClick={() => setConfirmDelete(true)}>
            <TrashIcon className="h-4 w-4 text-red-500" />
          </IconButton>
        </Tooltip>
        <DialogViewId data={data}/>
      </td>
      )}
    </tr>
  );
}

export default BaitListItem;
