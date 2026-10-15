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
  Select,
  Option,
  Checkbox,
} from "@material-tailwind/react";
import { PuzzlePieceIcon } from "@heroicons/react/24/outline";
import { AuthContext, AlertContext } from "@/context";
import { fishingRodTypes, baitAllowedTypes } from "./fishing-rod-fields";

const fields = [
  ["price", "Price", 0, 1000000000],
  ["levelRequirement", "Required level", 1, 1000000000],
  ["stats.fishingPower", "Fishing power", 0, 1000000000],
  ["stats.luck", "Luck", 0, 1000000000],
  ["stats.lineStrength", "Line strength", 0, 1000000000],
  ["stats.reelSpeed", "Reel speed", 0, 1000000000],
];

const defaults = {
  price: 0,
  levelRequirement: 1,
  stats: {
    fishingPower: 1,
    luck: 0,
    lineStrength: 10,
    reelSpeed: 1,
  },
  rodType: "basic",
  allowedBaitTypes: [],
};

function getNestedValue(object, path) {
  return path.split(".").reduce((value, key) => value?.[key], object);
}

function setNestedValue(object, path, value) {
  const keys = path.split(".");
  const result = { ...object };
  let current = result;
  let source = object;

  keys.forEach((key, index) => {
    if (index === keys.length - 1) {
      current[key] = value;
    } else {
      source = source?.[key];
      current[key] = { ...(source ?? {}) };
      current = current[key];
    }
  });

  return result;
}

function getInitialValues(data) {
  const rod = data ?? {};

  return {
    ...defaults,
    ...rod,
    stats: {
      ...defaults.stats,
      ...rod.stats,
    },
    allowedBaitTypes: [...(rod.allowedBaitTypes ?? [])],
  };
}

export function DialogViewFishingRod({ data, onSaved, editMode }) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(() => getInitialValues(data));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const { token } = useContext(AuthContext);
  const { addAlert } = useContext(AlertContext);

  const handleOpen = () => {
    if (saving) return;

    if (!open) {
      setValues(getInitialValues(data));
      setError("");
    }

    setOpen(!open);
  };

  const updateField = (key, value) => {
    setValues((previous) => setNestedValue(previous, key, value));
  };

  const toggleBaitType = (baitType, checked) => {
    setValues((previous) => ({
      ...previous,
      allowedBaitTypes: checked
        ? [...previous.allowedBaitTypes, baitType]
        : previous.allowedBaitTypes.filter((type) => type !== baitType),
    }));
  };

  async function save(event) {
    event.preventDefault();

    const numericFields = [
      ["price", 0, 1000000000],
      ["levelRequirement", 1, 1000000000],
      ["stats.fishingPower", 0, 1000000000],
      ["stats.luck", 0, 1000000000],
      ["stats.lineStrength", 0, 1000000000],
      ["stats.reelSpeed", 0, 1000000000],
    ];

    for (const [key, min, max] of numericFields) {
      const value = getNestedValue(values, key);
      const number = Number(value);

      if (
        value === "" ||
        value === null ||
        !Number.isSafeInteger(number) ||
        number < min ||
        number > max
      ) {
        setError("Enter whole numbers within the allowed ranges.");
        return;
      }
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        price: Number(values.price),
        levelRequirement: Number(values.levelRequirement),
        rodType: values.rodType,
        stats: {
          fishingPower: Number(values.stats.fishingPower),
          luck: Number(values.stats.luck),
          lineStrength: Number(values.stats.lineStrength),
          reelSpeed: Number(values.stats.reelSpeed),
        },
        allowedBaitTypes: values.allowedBaitTypes,
      };

      const response = await fetch(`/api/fishing-rods/${data._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const updated = await response.json();

      if (!response.ok) {
        throw new Error(updated.error || "Could not save fishing rod");
      }

      onSaved(updated);
      addAlert("Fishing rod saved.", "success");
      setOpen(false);
    } catch (err) {
      setError(err.message || "Could not save fishing rod");
    } finally {
      setSaving(false);
    }
  }

  const displayFields = [
    ["Price", data.price ?? 0],
    ["Rod type", data.rodType ?? "basic"],
    ["Required level", data.levelRequirement ?? 1],
    ["Fishing power", data.stats?.fishingPower ?? 1],
    ["Luck", data.stats?.luck ?? 0],
    ["Line strength", data.stats?.lineStrength ?? 10],
    ["Reel speed", data.stats?.reelSpeed ?? 1],
    ["Allowed bait types", data.allowedBaitTypes?.join(", ") || "None"],
  ];

  return (
    <>
      <Tooltip content={editMode ? "Edit Fishing Rod" : "View Fishing Rod"}>
        <IconButton variant="text" onClick={handleOpen} disabled={saving}>
          <PuzzlePieceIcon className="h-4 w-4 text-blue-300" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} handler={handleOpen}>
        <form onSubmit={save}>
          <DialogHeader>{data.name} — Fishing Rod</DialogHeader>

          <DialogBody className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto">
            {!editMode ? (
              <div className="flex flex-col gap-3">
                {displayFields.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2"
                  >
                    <span className="font-medium text-gray-700">{label}</span>

                    <span className="break-all text-right font-semibold text-gray-900">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5">
                  {fields.map(([key, label, min, max]) => (
                    <Input
                      key={key}
                      label={label}
                      type="number"
                      min={min}
                      max={max}
                      step="1"
                      required
                      value={getNestedValue(values, key) ?? ""}
                      disabled={saving}
                      onChange={(event) => updateField(key, event.target.value)}
                    />
                  ))}

                  <Select
                    label="Rod type"
                    value={values.rodType}
                    onChange={(value) => updateField("rodType", value)}
                    disabled={saving}
                  >
                    {fishingRodTypes.map((type) => (
                      <Option key={type} value={type}>
                        {type}
                      </Option>
                    ))}
                  </Select>

                  <div className="flex flex-col gap-2">
                    <p className="font-medium text-gray-700">
                      Allowed bait types
                    </p>

                    {baitAllowedTypes.map((type) => (
                      <Checkbox
                        key={type}
                        label={type}
                        checked={values.allowedBaitTypes.includes(type)}
                        disabled={saving}
                        onChange={(event) =>
                          toggleBaitType(type, event.target.checked)
                        }
                      />
                    ))}
                  </div>
                </div>

                {error && (
                  <p role="alert" className="text-sm text-red-600">
                    {error}
                  </p>
                )}
              </>
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
                {saving ? "Saving…" : "Save Fishing Rod"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}

export default DialogViewFishingRod;
