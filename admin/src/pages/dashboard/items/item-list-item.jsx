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
import { itemRarities, itemTypes } from "./item-fields";
import DialogViewId from "./dialog-view-id";
import DialogViewItem from "./dialog-view-stats";

export function ItemListItem({data, isLast, rows, setRows, error, setError, loadData}) {
  const { _id, sprite} = data;

  const [id, setId] = useState(data._id)
  const [itemId, setItemId] = useState(data.itemId)
  const [name, setName] = useState(data.name);
  const [description, setDescription] = useState(data.description);
  const [rarity, setRarity] = useState(data.rarity);
  const [category, setCategory] = useState(data.category);

  const [spriteName, setSpriteName] = useState("");
  const [spriteFile, setSpriteFile] = useState();
  const [itemSprite, setItemSprite] = useState(sprite ? `/api/images/item/` + sprite : null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const { token } = useContext(AuthContext);
  const { addAlert, hideAllAlerts } = useContext(AlertContext);

  const sprite_element = itemSprite ? (<img src={itemSprite} alt="Sprite" className="h-12 w-12 object-cover" /> 
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
      setItemSprite(event.target.result);
    };
    reader.readAsDataURL(e.target.files[0]);    
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      loadData();
      addAlert("Item successfully deleted.", "success");
    } catch (e) {
      addAlert(e.message || "Failed to delete the item.", "error");
    } 
  };

  const confirmEdit = async () => {
    let dataSendSuccess = false;
    let spriteSendSuccess = true;

    // surenkame duomenis
    const updatedData = {
      itemId,
      name,
      description,
      rarity,
      category
    };

    // jei laukeliai tušti, pranešame klaidą
    if (!updatedData.itemId || !updatedData.name || !updatedData.description || !updatedData.rarity) {
      addAlert("Fill in all fields before submitting.", "error");
      return;
    }

    // dumenų siuntimas
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      addAlert("The item has been successfully updated.", "success");
      dataSendSuccess = true;
    } catch (e) {
      addAlert(e.message || "Failed to update item", "error");
    }

    // nuotraukos siuntimas, jei pasirinkta
    if (spriteFile && dataSendSuccess) {
      spriteSendSuccess = false;
      const formData = new FormData();
      formData.append("sprite", spriteFile);  
      try {
        const res = await fetch(`/api/items/${id}/sprite`, {
          method: "PUT",
          headers: { 
            "Authorization": `Bearer ${token}` 
          },
          body: formData,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        spriteSendSuccess = true;
        addAlert("The item photo has been successfully updated.", "success");
      } catch (e) {
        addAlert(e.message || "Failed to update the item photo.", "error");
      }
    }

    if (spriteSendSuccess && dataSendSuccess) {
      loadData();
      setEditMode(false);
    }
  };

  const cancelEdit = () => {
    setItemId(data.itemId);
    setName(data.name);
    setDescription(data.description);
    setRarity(data.rarity);
    setCategory(data.category);
    setEditMode(false);

    setSpriteName('');
    setSpriteFile(null);
    setItemSprite(sprite ? `/api/images/item/` + sprite : null);
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
              value={itemId} 
              onChange={(e) => setItemId(e.target.value)} 
            />
          ) : (
            <Typography variant="small" color="blue-gray" className="font-normal">
              {itemId}
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
                {itemRarities.map((r) => (
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

      <td className={classes}>
        <div className=""> 
          {editMode ? (
              <Select label="Category" size="lg" value={category} onChange={(value) => setCategory(value)}>
                {itemTypes.map((r) => (
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

      <td className={classes}>
        <div className="">
          <DialogViewItem
            data={data}
            onSaved={(updated) =>
              setRows((rows) =>
                rows.map((row) => (row._id === updated._id ? updated : row)),
              )
            }
            editMode={editMode}
          />
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

export default ItemListItem;
