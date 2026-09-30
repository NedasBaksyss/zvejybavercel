import { useContext, useState } from "react";
import {
  Button, Dialog, DialogHeader, DialogBody, DialogFooter, Input, Tooltip, IconButton,
} from "@material-tailwind/react";
import { PuzzlePieceIcon } from "@heroicons/react/24/outline";
import { AlertContext } from "@/context";

const fields = [
  ["level", "Level", 1, 1000000000],
  ["experience", "XP toward next level (0–99)", 0, 99],
  ["totalFishCaught", "Total fish caught", 0, 1000000000],
  ["coins", "Coins", 0, 1000000000],
];

export function DialogViewStats({ data, onSaved }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const { addAlert } = useContext(AlertContext);

  const handleOpen = () => {
    if (saving) return;
    if (!open) {
      setValues(Object.fromEntries(fields.map(([key, , min]) => [
        key, String(Math.max(min, data.stats?.[key] ?? min)),
      ])));
      setError("");
    }
    setOpen(!open);
  };

  async function save(event) {
    event.preventDefault();
    const stats = Object.fromEntries(fields.map(([key]) => [key, Number(values[key])]));
    if (fields.some(([key, , min, max]) => values[key] === "" ||
      !Number.isSafeInteger(stats[key]) || stats[key] < min || stats[key] > max)) {
      setError("Enter whole numbers within the allowed ranges.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const response = await fetch(`/api/users/${data._id}/stats`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(stats),
      });
      const updated = await response.json();
      if (!response.ok) throw new Error(updated.error || "Could not save stats");
      onSaved(updated);
      addAlert("Player stats saved.", "success");
      setOpen(false);
    } catch (err) {
      setError(err.message || "Could not save stats");
    } finally {
      setSaving(false);
    }
  }

  return <>
    <Tooltip content="View / edit stats">
      <IconButton variant="text" onClick={handleOpen}>
        <PuzzlePieceIcon className="h-4 w-4 text-blue-300" />
      </IconButton>
    </Tooltip>
    <Dialog open={open} handler={handleOpen}>
      <form onSubmit={save}>
        <DialogHeader>{data.username}'s stats</DialogHeader>
        <DialogBody className="flex flex-col gap-5">
          <p>Each catch earns 25 XP. Every 100 XP advances one level.</p>
          {fields.map(([key, label, min, max]) => <Input
            key={key} label={label} type="number" min={min} max={max} step="1" required
            value={values[key] ?? ""} disabled={saving}
            onChange={(event) => setValues({ ...values, [key]: event.target.value })}
          />)}
          {error && <p role="alert" className="text-red-600">{error}</p>}
        </DialogBody>
        <DialogFooter className="gap-2">
          <Button variant="text" type="button" onClick={handleOpen} disabled={saving}>Cancel</Button>
          <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save stats"}</Button>
        </DialogFooter>
      </form>
    </Dialog>
  </>;
}

export default DialogViewStats;
