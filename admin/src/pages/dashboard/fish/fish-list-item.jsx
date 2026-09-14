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
import { CheckIcon, XMarkIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";
import { fishRarities } from "./fish-fields";

export function FishListItem({data, isLast, rows, setRows, error, setError, loadData}) {
  const { _id, foto} = data;

  const [id, setId] = useState(data._id)
  const [gamesId, setGamesId] = useState(data.gamesId)
  const [name, setName] = useState(data.name);
  const [description, setDescription] = useState(data.description);
  const [rarity, setRarity] = useState(data.rarity);

  const [fotoName, setFotoName] = useState("");
  const [fotoFile, setFotoFile] = useState();
  const [projectFoto, setProjectFoto] = useState(foto ? `/api/images/projects/` + foto : null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // const { token } = useContext(AuthContext);
  const { addAlert, hideAllAlerts } = useContext(AlertContext);

  // const local_publish_date = publish_date ? new Date(publish_date).toLocaleDateString() : '';

  const foto_element = projectFoto ? (<img src={projectFoto} alt="Projekto nuotrauka" className="h-12 w-12 object-cover" /> 
  ) : (
    <div className="h-12 w-12 flex items-center justify-center bg-gray-200">
      <span className="text-gray-500 text-sm">Nėra</span>
    </div>
  );

  function handleFileChange(e) {
    setFotoName(e.target.value);
    setFotoFile(e.target.files[0]);

    // atvaizduojame naują nuotrauką iš karto
    const reader = new FileReader();
    reader.onload = (event) => {
      setProjectFoto(event.target.result);
    };
    reader.readAsDataURL(e.target.files[0]);    
  }

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/fishes/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          // "Authorization": `Bearer ${token}` 
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      loadData();
      addAlert("Fish successfully deleted.", "success");
    } catch (e) {
      addAlert(e.message || "Failed to delete the fish.", "error");
    } 
  };

  const confirmEdit = async () => {
    let dataSendSuccess = false;
    let fotoSendSuccess = true;

    // surenkame duomenis
    const updatedData = {
      gamesId,
      name,
      description,
      rarity
    };

    // jei laukeliai tušti, pranešame klaidą
    if (!updatedData.gamesId || !updatedData.name || !updatedData.description || !updatedData.rarity) {
      addAlert("Fill in all fields before submitting.", "error");
      return;
    }

    console.log(updatedData)

    // dumenų siuntimas
    try {
      const res = await fetch(`/api/fishes/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json"
          // "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      addAlert("The fish has been successfully updated.", "success");
      dataSendSuccess = true;
    } catch (e) {
      addAlert(e.message || "Failed to update fish", "error");
    }

    // nuotraukos siuntimas, jei pasirinkta
    if (fotoFile && dataSendSuccess) {
      fotoSendSuccess = false;
      const formData = new FormData();
      formData.append("foto", fotoFile);  
      try {
        const res = await fetch(`/api/projects/${id}/foto`, {
          method: "PUT",
          // headers: { 
          //   "Authorization": `Bearer ${token}` 
          // },
          body: formData,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        fotoSendSuccess = true;
        addAlert("Projekto nuotrauka sėkmingai atnaujinta", "success");
      } catch (e) {
        addAlert(e.message || "Nepavyko atnaujinti projekto nuotraukos", "error");
      }
    }

    if (fotoSendSuccess && dataSendSuccess) {
      loadData();
      setEditMode(false);
    }
  };

  const cancelEdit = () => {
    setGamesId(data.games_id);
    setName(data.name);
    setDescription(data.description);
    setRarity(data.rarity);
    setEditMode(false);
    setFotoName('');
    setFotoFile(null);
    setProjectFoto(foto ? `/api/images/projects/` + foto : null);
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
        <div className="relative"> 
          <Typography variant="small" color="blue-gray" className="font-normal">
            {foto_element}
          </Typography>

          {editMode ? (
          <input
            type="file"
            value={fotoName}
            onChange={handleFileChange}
            className="form-control position-absolute top-50 start-50 translate-middle"
            style={{ width: "58px" }}
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
                {fishRarities.map((r) => (
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
      </td>
      )}
    </tr>
  );
}

export default FishListItem;
