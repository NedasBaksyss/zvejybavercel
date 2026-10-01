import { useEffect, useState, useContext } from "react";

import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
  Input,
  Tooltip,
  IconButton,
  Select,
  Option,
} from "@material-tailwind/react";

import {
  FingerPrintIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { AuthContext, AlertContext } from "@/context";

const requirementTypes = [
  {
    value: "catch_fish",
    label: "Catch Fish",
  },
  {
    value: "catch_common",
    label: "Catch Common Fish",
  },
  {
    value: "catch_uncommon",
    label: "Catch Uncommon Fish",
  },
  {
    value: "catch_rare",
    label: "Catch Rare Fish",
  },
  {
    value: "catch_legendary",
    label: "Catch Legendary Fish",
  },
  {
    value: "reach_level",
    label: "Reach Level",
  },
  {
    value: "earn_coins",
    label: "Earn Coins",
  },
];

export function DialogViewRequirements({
  data,
  editMode,
  loadData,
}) {
  const [open, setOpen] = useState(false);
  const [requirements, setRequirements] = useState([]);
  const [saving, setSaving] = useState(false);

  const { token } = useContext(AuthContext);
  const { addAlert } = useContext(AlertContext);

  useEffect(() => {
    setRequirements(
      Array.isArray(data?.requirement)
        ? data.requirement
        : []
    );
  }, [data]);

  const handleOpen = () => {
    setOpen(!open);
  };

  const addRequirement = () => {
    setRequirements((prev) => [
      ...prev,
      {
        type: "catch_fish",
        amount: 1,
        value: "",
      },
    ]);
  };

  const updateRequirement = (index, field, value) => {
    setRequirements((prev) =>
      prev.map((requirement, i) =>
        i === index
          ? {
              ...requirement,
              [field]: value,
            }
          : requirement
      )
    );
  };

  const deleteRequirement = (index) => {
    setRequirements((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const saveRequirements = async () => {
    try {
      setSaving(true);

      const cleanedRequirements = requirements.map(
        (requirement) => ({
          type: requirement.type,
          amount:
            requirement.amount === ""
              ? undefined
              : Number(requirement.amount),
          value: requirement.value || undefined,
        })
      );

      const res = await fetch(
        `/api/achievements/${data._id}/requirements`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cleanedRequirements),
        }
      );

      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(
          errorData.error ||
            errorData.message ||
            `HTTP ${res.status}`
        );
      }

      addAlert(
        "Requirements successfully updated.",
        "success"
      );

      if (loadData) {
        loadData();
      }

      setOpen(false);
    } catch (error) {
      console.error(error);

      addAlert(
        error.message ||
          "Failed to update requirements.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteAllRequirements = async () => {
    try {
      setSaving(true);

      const res = await fetch(
        `/api/achievements/${data._id}/requirements`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        const errorData = await res.json();

        throw new Error(
          errorData.error ||
            errorData.message ||
            `HTTP ${res.status}`
        );
      }

      setRequirements([]);

      addAlert(
        "All requirements deleted.",
        "success"
      );

      if (loadData) {
        loadData();
      }
    } catch (error) {
      console.error(error);

      addAlert(
        error.message ||
          "Failed to delete requirements.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelChanges = () => {
    setRequirements(
      Array.isArray(data?.requirement)
        ? data.requirement
        : []
    );

    setOpen(false);
  };

  return (
    <>
      <Tooltip content="View requirements">
        <IconButton
          variant="text"
          onClick={handleOpen}
        >
          <FingerPrintIcon className="h-4 w-4 text-blue-300" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        handler={handleOpen}
        size="md"
      >
        <DialogHeader className="justify-center">
          {data.name}'s Requirements
        </DialogHeader>

        <DialogBody className="max-h-[500px] overflow-y-auto">
          {requirements.length > 0 ? (
            <div className="flex flex-col gap-3">
              {requirements.map(
                (requirement, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg bg-blue-gray-50 p-3"
                  >
                    {/* LEFT SIDE */}
                    <div className="w-1/2">
                      {editMode ? (
                        <Select
                          label="Requirement"
                          value={requirement.type}
                          onChange={(value) =>
                            updateRequirement(
                              index,
                              "type",
                              value
                            )
                          }
                        >
                          {requirementTypes.map(
                            (type) => (
                              <Option
                                key={type.value}
                                value={type.value}
                              >
                                {type.label}
                              </Option>
                            )
                          )}
                        </Select>
                      ) : (
                        <Typography className="font-semibold">
                          {requirementTypes.find(
                            (type) =>
                              type.value ===
                              requirement.type
                          )?.label ||
                            requirement.type}
                        </Typography>
                      )}
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex flex-1 items-center gap-2">
                      {editMode ? (
                        <>
                          <Input
                            type="number"
                            label="Amount"
                            value={
                              requirement.amount ?? ""
                            }
                            onChange={(e) =>
                              updateRequirement(
                                index,
                                "amount",
                                e.target.value
                              )
                            }
                          />

                          <IconButton
                            variant="text"
                            color="red"
                            onClick={() =>
                              deleteRequirement(index)
                            }
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </>
                      ) : (
                        <Typography className="ml-auto">
                          {requirement.amount}
                        </Typography>
                      )}
                    </div>
                  </div>
                )
              )}
            </div>
          ) : (
            <Typography className="text-center text-gray-500">
              No requirements...
            </Typography>
          )}

          {editMode && (
            <div className="mt-4 flex justify-center">
              <Button
                size="sm"
                variant="outlined"
                className="flex items-center gap-2"
                onClick={addRequirement}
              >
                <PlusIcon className="h-4 w-4" />
                Add Requirement
              </Button>
            </div>
          )}
        </DialogBody>

        {editMode && (
          <DialogFooter className="justify-between">
            <Button
              color="red"
              variant="text"
              onClick={deleteAllRequirements}
              disabled={saving}
            >
              Delete All
            </Button>

            <div className="flex gap-2">
              <Button
                variant="text"
                onClick={cancelChanges}
                disabled={saving}
              >
                Cancel
              </Button>

              <Button
                color="green"
                onClick={saveRequirements}
                disabled={saving}
              >
                {saving ? "Saving..." : "Save"}
              </Button>
            </div>
          </DialogFooter>
        )}
      </Dialog>
    </>
  );
}

export default DialogViewRequirements;
