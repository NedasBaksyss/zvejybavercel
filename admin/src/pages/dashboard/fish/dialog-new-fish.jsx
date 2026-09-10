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
} from "@material-tailwind/react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useContext } from "react";
import { AlertContext } from "@/context";

export function DialogNewProject({loadData}) {
  const [open, setOpen] = useState(false);

  // formos laukelių duomenys
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [foto, setFoto] = useState(null);
  const [publishDate, setPublishDate] = useState("");
  const [order, setOrder] = useState(0);

  const {addAlert, hideAllAlerts} = useContext(AlertContext);

  const handleOpen = () => setOpen(!open);

  // projekto kūrimo logika čia
  const handleCreateProject = async () => {
    // surenkame duomenis iš formos
    // paprastų duomenų siuntimui JSON formatu
    const projectData = {
      title,
      description,
      publish_date: publishDate,
      sort_order: order,
    };
    // siunčiame į API
    const response = await fetch("/api/projects", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });
    if (!response.ok) {
      // klaidos tvarkymas 
      addAlert("Klaida kuriant projektą", "error");
      return;
    }

    const createdProject = await response.json();
    if (!createdProject || !createdProject.id) {
      addAlert("Klaida gaunant sukurtą projektą", "error");
      return;
    }

    addAlert("Projektas sukurtas", "success");

    // jei yra nuotrauka, įkelti ją atskirai
    if (foto) {
      const formData = new FormData();
      formData.append("foto", foto);
      const responseFoto = await fetch(`/api/projects/${createdProject.id}/foto`, {
        method: "PUT",
        body: formData,
      });

      if (!responseFoto.ok) {
        addAlert("Klaida įkeliant projekto nuotrauką", "error");
        return;
      }

      addAlert("Projekto nuotrauka įkelta", "success");
    }

    // atnaujiname projektų sąrašą
    loadData();

    // Išvvalome formos laukelius
    setTitle("");
    setDescription("");
    setFoto(null);
    setPublishDate("");
    setOrder(0);

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
        <DialogHeader>Pridėti naują projektą</DialogHeader>
        <DialogBody className="flex flex-col gap-4">
          <Input label="Pavadinimas" size="lg" value={title} onChange={(e) => setTitle(e.target.value)} />
          <Textarea label="Aprašymas" size="lg" value={description} onChange={(e) => setDescription(e.target.value)} />
          <Input type="file" label="Nuotrauka" size="lg" onChange={(e) => setFoto(e.target.files[0])} />
          <Input type="date" label="Sukūrimo data" size="lg" value={publishDate} onChange={(e) => setPublishDate(e.target.value)} />
          <Input type="number" label="Rikiavimas" size="lg" value={order} onChange={(e) => setOrder(Number(e.target.value))} />
        </DialogBody>
        <DialogFooter>
          <Button
            variant="text"
            color="red"
            onClick={handleOpen}
            className="mr-1"
          >
            <span>Atšaukti</span>
          </Button>
          <Button variant="gradient" color="green" onClick={handleCreateProject}>
            <span>Patvirtinti</span>
          </Button>
        </DialogFooter>
      </Dialog>
    </>
  );
}

export default DialogNewProject;
