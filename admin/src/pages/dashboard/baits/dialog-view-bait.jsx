import { useContext, useState } from "react";
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Input,
  Tooltip,
  IconButton,
  Checkbox,
} from "@material-tailwind/react";
import { PuzzlePieceIcon } from "@heroicons/react/24/outline";
import { AuthContext, AlertContext } from "@/context";

const fields = [
  ["price", "Price", 0, 1000000000],
  ["maxStack", "Max stack", 1, 1000000000],
  ["attraction", "Attraction", 0, 1000000000],
  ["effectiveness", "Effectiveness", 0, 1000000000],
  ["uses", "Uses", 1, 1000000000],
];

export function DialogViewBaits({ data, onSaved, editMode }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState({});
  const [stackable, setStackable] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { token } = useContext(AuthContext);
  const { addAlert } = useContext(AlertContext);

  const handleOpen = () => {
    if (saving) return;

    if (!open) {
      setValues(
        Object.fromEntries(
          fields.map(([key, , min]) => [
            key,
            String(Math.max(min, data[key] ?? min)),
          ])
        )
      );

      setStackable(data.stackable ?? true);
      setError("");
    }

    setOpen(!open);
  };

  async function save(event) {
  event.preventDefault();

  const bait = {
    price: Number(values.price),
    stackable,
    maxStack: Number(values.maxStack),
    attraction: Number(values.attraction),
    effectiveness: Number(values.effectiveness),
    uses: Number(values.uses),
  };

  if (
    fields.some(([key, , min, max]) => {
      const raw = values[key];
      const value = bait[key];

      return (
        raw === "" ||
        !Number.isFinite(value) ||
        value < min ||
        value > max ||
        (["price", "maxStack", "uses"].includes(key) &&
          !Number.isSafeInteger(value))
      );
    })
  ) {
    setError("Enter valid numbers within the allowed ranges.");
    return;
  }

  setSaving(true);
  setError("");

  try {
    const response = await fetch(`/api/baits/${data._id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(bait),
    });

    const result = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(
        result.error || result.message || `Request failed: ${response.status}`
      );
    }

    // Support APIs returning either the bait or { bait: ... }.
    const updated = result.bait ?? result;

    onSaved(updated);
    addAlert("Bait saved successfully.", "success");
    setOpen(false);
  } catch (err) {
    setError(err.message || "Could not save bait");
  } finally {
    setSaving(false);
  }
}

  return (
    <>
      <Tooltip content={editMode ? "Edit Bait" : "View Bait"}>
        <IconButton variant="text" onClick={handleOpen}>
          <PuzzlePieceIcon className="h-4 w-4 text-blue-300" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} handler={handleOpen}>
        <form onSubmit={save}>
          <DialogHeader>
            {data.name || "Bait"} properties
          </DialogHeader>

          <DialogBody className="flex flex-col gap-5">
            {editMode ? (
              <>
                {fields.map(([key, label, min, max]) => (
                  <Input
                    key={key}
                    label={label}
                    type="number"
                    min={min}
                    max={max}
                    step="any"
                    required
                    value={values[key] ?? ""}
                    disabled={saving}
                    onChange={(event) =>
                      setValues({
                        ...values,
                        [key]: event.target.value,
                      })
                    }
                  />
                ))}

                <Checkbox
                  label="Stackable"
                  checked={stackable}
                  disabled={saving}
                  onChange={(event) =>
                    setStackable(event.target.checked)
                  }
                />

                {error && (
                  <p role="alert" className="text-red-600">
                    {error}
                  </p>
                )}
              </>
            ) : (
              <div className="flex flex-col gap-3">
                {fields.map(([key, label]) => (
                  <div
                    key={key}
                    className="flex justify-between items-center border-b border-gray-200 pb-2"
                  >
                    <span className="font-medium text-gray-700">
                      {label}
                    </span>

                    <span className="font-semibold text-gray-900">
                      {data[key] ?? 0}
                    </span>
                  </div>
                ))}

                <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                  <span className="font-medium text-gray-700">
                    Stackable
                  </span>

                  <span className="font-semibold text-gray-900">
                    {data.stackable ? "Yes" : "No"}
                  </span>
                </div>
              </div>
            )}
          </DialogBody>

          <DialogFooter className="gap-2">
            <Button
              variant="text"
              type="button"
              onClick={handleOpen}
              disabled={saving}
            >
              Close
            </Button>

            {editMode && (
              <Button type="submit" disabled={saving}>
                {saving ? "Saving…" : "Save bait"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}

export default DialogViewBaits;