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
  GiftIcon,
  PlusIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { AuthContext, AlertContext } from "@/context";

const rewardTypes = [
  {
    value: "coins",
    label: "Coins",
    field: "amount",
  },
  {
    value: "experience",
    label: "Experience",
    field: "amount",
  },
  {
    value: "item",
    label: "Item",
    field: "value",
  },
  {
    value: "title",
    label: "Title",
    field: "value",
  },
];

export function DialogViewRewards({
  data,
  editMode,
  loadData,
}) {
  const [open, setOpen] = useState(false);
  const [rewards, setRewards] = useState([]);
  const [saving, setSaving] = useState(false);

  const { token } = useContext(AuthContext);
  const { addAlert } = useContext(AlertContext);

  useEffect(() => {
    setRewards(
      Array.isArray(data?.reward)
        ? data.reward
        : []
    );
  }, [data]);

  const handleOpen = () => {
    setOpen(!open);
  };

  const addReward = () => {
    setRewards((prev) => [
      ...prev,
      {
        type: "coins",
        amount: 100,
        value: "",
      },
    ]);
  };

  const updateReward = (index, field, value) => {
    setRewards((prev) =>
      prev.map((reward, i) =>
        i === index
          ? {
              ...reward,
              [field]: value,
            }
          : reward
      )
    );
  };

  const changeRewardType = (index, type) => {
    const rewardType = rewardTypes.find(
      (reward) => reward.value === type
    );

    setRewards((prev) =>
      prev.map((reward, i) =>
        i === index
          ? {
              type,
              amount:
                rewardType?.field === "amount"
                  ? reward.amount ?? 0
                  : undefined,
              value:
                rewardType?.field === "value"
                  ? reward.value ?? ""
                  : undefined,
            }
          : reward
      )
    );
  };

  const deleteReward = (index) => {
    setRewards((prev) =>
      prev.filter((_, i) => i !== index)
    );
  };

  const saveRewards = async () => {
    try {
      setSaving(true);

      const cleanedRewards = rewards.map(
        (reward) => ({
          type: reward.type,
          amount:
            reward.amount === "" ||
            reward.amount === undefined
              ? undefined
              : Number(reward.amount),
          value:
            reward.value === ""
              ? undefined
              : reward.value,
        })
      );

      const res = await fetch(
        `/api/achievements/${data._id}/rewards`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(cleanedRewards),
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
        "Rewards successfully updated.",
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
          "Failed to update rewards.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const deleteAllRewards = async () => {
    try {
      setSaving(true);

      const res = await fetch(
        `/api/achievements/${data._id}/rewards`,
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

      setRewards([]);

      addAlert(
        "All rewards deleted.",
        "success"
      );

      if (loadData) {
        loadData();
      }
    } catch (error) {
      console.error(error);

      addAlert(
        error.message ||
          "Failed to delete rewards.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  const cancelChanges = () => {
    setRewards(
      Array.isArray(data?.reward)
        ? data.reward
        : []
    );

    setOpen(false);
  };

  return (
    <>
      <Tooltip content="View rewards">
        <IconButton
          variant="text"
          onClick={handleOpen}
        >
          <GiftIcon className="h-4 w-4 text-yellow-400" />
        </IconButton>
      </Tooltip>

      <Dialog
        open={open}
        handler={handleOpen}
        size="md"
      >
        <DialogHeader className="justify-center">
          {data.achievementId} Rewards
        </DialogHeader>

        <DialogBody className="max-h-[500px] overflow-y-auto">
          {rewards.length > 0 ? (
            <div className="flex flex-col gap-3">
              {rewards.map((reward, index) => {
                const rewardType = rewardTypes.find(
                  (type) =>
                    type.value === reward.type
                );

                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 rounded-lg bg-blue-gray-50 p-3"
                  >
                    {/* LEFT SIDE */}
                    <div className="w-1/2">
                      {editMode ? (
                        <Select
                          label="Reward"
                          value={reward.type}
                          onChange={(value) =>
                            changeRewardType(
                              index,
                              value
                            )
                          }
                        >
                          {rewardTypes.map(
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
                          {rewardType?.label ||
                            reward.type}
                        </Typography>
                      )}
                    </div>

                    {/* RIGHT SIDE */}
                    <div className="flex flex-1 items-center gap-2">
                      {editMode ? (
                        <>
                          {rewardType?.field ===
                          "amount" ? (
                            <Input
                              type="number"
                              label="Amount"
                              value={
                                reward.amount ?? ""
                              }
                              onChange={(e) =>
                                updateReward(
                                  index,
                                  "amount",
                                  e.target.value
                                )
                              }
                            />
                          ) : (
                            <Input
                              type="text"
                              label="Value"
                              value={
                                reward.value ?? ""
                              }
                              onChange={(e) =>
                                updateReward(
                                  index,
                                  "value",
                                  e.target.value
                                )
                              }
                            />
                          )}

                          <IconButton
                            variant="text"
                            color="red"
                            onClick={() =>
                              deleteReward(index)
                            }
                          >
                            <TrashIcon className="h-4 w-4" />
                          </IconButton>
                        </>
                      ) : (
                        <Typography className="ml-auto">
                          {rewardType?.field ===
                          "amount"
                            ? reward.amount
                            : reward.value}
                        </Typography>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <Typography className="text-center text-gray-500">
              No rewards...
            </Typography>
          )}

          {editMode && (
            <div className="mt-4 flex justify-center">
              <Button
                size="sm"
                variant="outlined"
                className="flex items-center gap-2"
                onClick={addReward}
              >
                <PlusIcon className="h-4 w-4" />
                Add Reward
              </Button>
            </div>
          )}
        </DialogBody>

        {editMode && (
          <DialogFooter className="justify-between">
            <Button
              color="red"
              variant="text"
              onClick={deleteAllRewards}
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
                onClick={saveRewards}
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

export default DialogViewRewards;
