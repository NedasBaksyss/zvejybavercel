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
import DialogViewId from "./dialog-view-id";

export function AchievementListItem({data, isLast, rows, setRows, error, setError, loadData}) {
  const { _id, sprite} = data;

  const [id, setId] = useState(data._id)
  const [gamesId, setGamesId] = useState(data.gamesId)
  const [name, setName] = useState(data.name);
  const [description, setDescription] = useState(data.description);
  const [requirement, setRequirement] = useState(data.requirement);
  const [reward, setReward] = useState(data.reward);

  const [spriteName, setSpriteName] = useState("");
  const [spriteFile, setSpriteFile] = useState();
  const [achievementSprite, setAchievementSprite] = useState(sprite ? `/api/images/achievements/` + sprite : null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { token } = useContext(AuthContext);
  const { addAlert, hideAllAlerts } = useContext(AlertContext);

  const sprite_element = achievementSprite ? (<img src={achievementSprite} alt="Sprite" className="h-12 w-12 object-cover" /> 
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
      setAchievementSprite(event.target.result);
    };
    reader.readAsDataURL(e.target.files[0]);    
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/achievements/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      loadData();
      addAlert("Achievement successfully deleted.", "success");
    } catch (e) {
      addAlert(e.message || "Failed to delete the achievement.", "error");
    } 
  };

  const confirmEdit = async () => {
    let dataSendSuccess = false;
    let spriteSendSuccess = true;

    // surenkame duomenis
    const updatedData = {
      gamesId,
      name,
      description,
      requirement,
      reward
    };

    // jei laukeliai tušti, pranešame klaidą
    if (!updatedData.gamesId || !updatedData.name || !updatedData.description) {
      addAlert("Fill in all fields before submitting.", "error");
      return;
    }

    // dumenų siuntimas
    try {
      const res = await fetch(`/api/achievements/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      addAlert("The achievement has been successfully updated.", "success");
      dataSendSuccess = true;
    } catch (e) {
      addAlert(e.message || "Failed to update achievement", "error");
    }

    // nuotraukos siuntimas, jei pasirinkta
    if (spriteFile && dataSendSuccess) {
      spriteSendSuccess = false;
      const formData = new FormData();
      formData.append("sprite", spriteFile);  
      try {
        const res = await fetch(`/api/achievements/${id}/sprite`, {
          method: "PUT",
          headers: { 
            "Authorization": `Bearer ${token}` 
          },
          body: formData,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        spriteSendSuccess = true;
        addAlert("The achievement photo has been successfully updated.", "success");
      } catch (e) {
        addAlert(e.message || "Failed to update the achievement photo.", "error");
      }
    }

    if (spriteSendSuccess && dataSendSuccess) {
      loadData();
      setEditMode(false);
    }
  };

  const cancelEdit = () => {
    setGamesId(data.gamesId);
    setName(data.name);
    setDescription(data.description);
    setRequirement(data.requirement);
    setReward(data.reward);
    setEditMode(false);

    setSpriteName('');
    setSpriteFile(null);
    setAchievementSprite(sprite ? `/api/images/achievements/` + sprite : null);
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
              value={gamesId} 
              onChange={(e) => setGamesId(e.target.value)} 
            />
          ) : (
            <Typography variant="small" color="blue-gray" className="font-normal">
              {gamesId}
            </Typography>
          )}
        </div>
      </td>
      <td className={classes}>
        <div className=""> 
            {sprite_element}

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

export default AchievementListItem;
