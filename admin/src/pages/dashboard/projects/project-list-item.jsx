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
// import { AuthContext, AlertContext } from "@/context";
import { CheckIcon, XMarkIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

export function ProjectListItem({data, isLast, rows, setRows, error, setError, loadData}) {
  const { id, foto} = data;

  const [title, setTitle] = useState(data.title);
  const [description, setDescription] = useState(data.description);
  const [sort_order, setSortOrder] = useState(data.sort_order);
  const [publish_date, setPublishDate] = useState(data.publish_date);

  const [fotoName, setFotoName] = useState("");
  const [fotoFile, setFotoFile] = useState();
  const [projectFoto, setProjectFoto] = useState(foto ? `/api/images/projects/` + foto : null);

  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // const { token } = useContext(AuthContext);
  const { addAlert, hideAllAlerts } = useContext(AlertContext);

  const local_publish_date = publish_date ? new Date(publish_date).toLocaleDateString() : '';

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
      const res = await fetch(`/api/projects/${id}`, {
        method: "DELETE",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      loadData();
      addAlert("Projektas sėkmingai ištrintas", "success");
    } catch (e) {
      addAlert(e.message || "Nepavyko ištrinti projekto", "error");
    } 
  };

  const confirmEdit = async () => {
    let dataSendSuccess = false;
    let fotoSendSuccess = true;

    // surenkame duomenis
    const updatedData = {
      title,
      description,
      sort_order,
      publish_date: new Date(publish_date).toLocaleDateString(),
    };

    // jei laukeliai tušti, pranešame klaidą
    if (!updatedData.title || !updatedData.description || updatedData.sort_order === "" || !updatedData.publish_date) {
      addAlert("Užpildykite visus laukelius prieš pateikdami", "error");
      return;
    }

    // dumenų siuntimas
    try {
      const res = await fetch(`/api/projects/${id}`, {
        method: "PUT",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      addAlert("Projektas sėkmingai atnaujintas", "success");
      dataSendSuccess = true;
    } catch (e) {
      addAlert(e.message || "Nepavyko atnaujinti projekto", "error");
    }

    // nuotraukos siuntimas, jei pasirinkta
    if (fotoFile && dataSendSuccess) {
      fotoSendSuccess = false;
      const formData = new FormData();
      formData.append("foto", fotoFile);  
      try {
        const res = await fetch(`/api/projects/${id}/foto`, {
          method: "PUT",
          headers: { 
            "Authorization": `Bearer ${token}` 
          },
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
    setTitle(data.title);
    setDescription(data.description);
    setSortOrder(data.sort_order);
    setPublishDate(data.publish_date);
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
          <Typography variant="small" color="blue-gray" className="font-normal">
            {id}
          </Typography>
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
              label="Pavadinimas"
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
            />
          ) : (
            <Typography variant="small" color="blue-gray" className="font-normal">
              {title}
            </Typography>
          )}
        </div>
      </td>
      <td className={classes}>
        <div className=""> 
          {editMode ? (
            <Textarea 
              type="text" 
              label="Aprašymas"
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
            <Input 
              type="date" 
              label="Publikavimo data"
              value={publish_date ? publish_date.split('T')[0] : ''} 
              onChange={(e) => setPublishDate(e.target.value)} 
            />
          ) : (
            <Typography variant="small" color="blue-gray" className="font-normal">
              {local_publish_date}
            </Typography>
          )}
        </div>
      </td>
      <td className={classes}>
        <div className=""> 
          {editMode ? (
            <Input 
              type="number" 
              label="Rūšiavimo tvarka"
              value={sort_order} 
              onChange={(e) => setSortOrder(e.target.value)} 
            />
          ) : (
            <Typography variant="small" color="blue-gray" className="font-normal">
              {sort_order}
            </Typography>
          )}
        </div>
      </td>

      {confirmDelete ? (
      <td className={classes}>
        <Tooltip content="Patvirtinti trynimą">
          <IconButton variant="text" className="bg-red-300 hover:bg-red-500 text-white mr-2" onClick={handleDelete}>
            <CheckIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
        <Tooltip content="Atšaukti trynimą">
          <IconButton variant="text" onClick={() => setConfirmDelete(false)}>
            <XMarkIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      </td>
      ) : 
      editMode ? (
      <td className={classes}>
        <Tooltip content="Patvirtinti redagavimą">
          <IconButton variant="text" className="text-green-500 hover:text-green-700 mr-2" onClick={confirmEdit}>
            <CheckIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
        <Tooltip content="Atšaukti redagavimą">
          <IconButton variant="text" onClick={cancelEdit}>
            <XMarkIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      </td>
      )
      : (
      <td className={classes}>
        <Tooltip content="Redaguoti">
          <IconButton variant="text" className="mr-2" onClick={() => setEditMode(true)}>
            <PencilIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
        <Tooltip content="Trinti">
          <IconButton variant="text" onClick={() => setConfirmDelete(true)}>
            <TrashIcon className="h-4 w-4 text-red-500" />
          </IconButton>
        </Tooltip>
      </td>
      )}
    </tr>
  );
}

export default ProjectListItem;
