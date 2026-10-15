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
  ["maxStack", "Maximum stack", 1, 1000000000],
  ["weight", "Weight", 0, 1000000000],
  ["levelRequirement", "Required level", 1, 1000000000],
  ["effects.fishingPower", "Fishing power effect", -1000000000, 1000000000],
  ["effects.luck", "Luck effect", -1000000000, 1000000000],
];

const defaults = {
  price: 0,
  stackable: true,
  maxStack: 99,
  weight: 0,
  levelRequirement: 1,
  effects: {
    fishingPower: 0,
    luck: 0,
  },
  usable: false,
  sellable: true,
};

function getNestedValue(object, path) {
  return path
    .split(".")
    .reduce((value, key) => value?.[key], object);
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
  const item = data ?? {};

  return {
    ...defaults,
    ...item,
    effects: {
      ...defaults.effects,
      ...item.effects,
    },
  };
}

export function DialogViewItem({
  data,
  onSaved,
  editMode,
}) {
  const [open, setOpen] = useState(false);
  const [values, setValues] = useState(() =>
    getInitialValues(data)
  );
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
    setValues((previous) =>
      setNestedValue(previous, key, value)
    );
  };

  async function save(event) {
    event.preventDefault();

    const numericFields = [
      ["price", 0, 1000000000],
      ["maxStack", 1, 1000000000],
      ["weight", 0, 1000000000],
      ["levelRequirement", 1, 1000000000],
      ["effects.fishingPower", -1000000000, 1000000000],
      ["effects.luck", -1000000000, 1000000000],
    ];

    for (const [key, min, max] of numericFields) {
      const value = getNestedValue(values, key);
      const number = Number(value);

      if (
        value === "" ||
        value === null ||
        !Number.isFinite(number) ||
        number < min ||
        number > max ||
        (key !== "weight" && !Number.isSafeInteger(number))
      ) {
        setError(
          "Enter valid numbers within the allowed ranges."
        );
        return;
      }
    }

    if (
      !values.stackable &&
      Number(values.maxStack) !== 1
    ) {
      setValues((previous) => ({
        ...previous,
        maxStack: 1,
      }));
    }

    setSaving(true);
    setError("");

    try {
      const payload = {
        price: Number(values.price),
        stackable: values.stackable,
        maxStack: values.stackable
          ? Number(values.maxStack)
          : 1,
        weight: Number(values.weight),
        levelRequirement: Number(values.levelRequirement),
        effects: {
          fishingPower: Number(
            values.effects.fishingPower
          ),
          luck: Number(values.effects.luck),
        },
        usable: values.usable,
        sellable: values.sellable,
      };

      const response = await fetch(
        `/api/items/${data._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const updated = await response.json();

      if (!response.ok) {
        throw new Error(
          updated.error || "Could not save item"
        );
      }

      onSaved(updated);
      addAlert("Item saved.", "success");
      setOpen(false);
    } catch (err) {
      setError(
        err.message || "Could not save item"
      );
    } finally {
      setSaving(false);
    }
  }

  const displayFields = [
    ["Price", data.price ?? 0],
    ["Stackable", data.stackable ?? true ? "Yes" : "No"],
    ["Maximum stack", data.maxStack ?? 99],
    ["Weight", data.weight ?? 0],
    ["Required level", data.levelRequirement ?? 1],
    [
      "Fishing power effect",
      data.effects?.fishingPower ?? 0,
    ],
    ["Luck effect", data.effects?.luck ?? 0],
    ["Usable", data.usable ? "Yes" : "No"],
    ["Sellable", data.sellable ?? true ? "Yes" : "No"],
  ];

  return (
    <>
      <Tooltip
        content={
          editMode ? "Edit Item" : "View Item"
        }
      >
        <IconButton
          variant="text"
          onClick={handleOpen}
          disabled={saving}
        >
          <PuzzlePieceIcon className="h-4 w-4 text-blue-300" />
        </IconButton>
      </Tooltip>

      <Dialog open={open} handler={handleOpen}>
        <form onSubmit={save}>
          <DialogHeader>
            {data.name} — Item
          </DialogHeader>

          <DialogBody
            className="flex max-h-[70vh] flex-col gap-5 overflow-y-auto"
          >
            {!editMode ? (
              <div className="flex flex-col gap-3">
                {displayFields.map(([label, value]) => (
                  <div
                    key={label}
                    className="flex items-center justify-between gap-4 border-b border-gray-200 pb-2"
                  >
                    <span className="font-medium text-gray-700">
                      {label}
                    </span>

                    <span className="break-all text-right font-semibold text-gray-900">
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-5">
                  {fields.map(
                    ([key, label, min, max]) => (
                      <Input
                        key={key}
                        label={label}
                        type="number"
                        min={min}
                        max={max}
                        step={key === "weight" ? "any" : "1"}
                        required
                        value={
                          getNestedValue(values, key) ?? ""
                        }
                        disabled={saving}
                        onChange={(event) =>
                          updateField(
                            key,
                            event.target.value
                          )
                        }
                      />
                    )
                  )}

                  <div className="flex flex-col gap-2">
                    <Checkbox
                      label="Stackable"
                      checked={values.stackable}
                      disabled={saving}
                      onChange={(event) => {
                        const checked = event.target.checked;

                        setValues((previous) => ({
                          ...previous,
                          stackable: checked,
                          maxStack: checked
                            ? previous.maxStack
                            : 1,
                        }));
                      }}
                    />

                    <Checkbox
                      label="Usable"
                      checked={values.usable}
                      disabled={saving}
                      onChange={(event) =>
                        updateField(
                          "usable",
                          event.target.checked
                        )
                      }
                    />

                    <Checkbox
                      label="Sellable"
                      checked={values.sellable}
                      disabled={saving}
                      onChange={(event) =>
                        updateField(
                          "sellable",
                          event.target.checked
                        )
                      }
                    />
                  </div>
                </div>

                {error && (
                  <p
                    role="alert"
                    className="text-sm text-red-600"
                  >
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
              <Button
                type="submit"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save Item"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </Dialog>
    </>
  );
}

export default DialogViewItem;