import { PencilIcon, TrashIcon, CheckIcon, XMarkIcon} from "@heroicons/react/24/solid";
import {
  Typography,
  IconButton,
  Tooltip,
  Select,
  Option,
  Switch
} from "@material-tailwind/react";

import { useContext, useState } from "react";
import { AuthContext, AlertContext } from "@/context";
import DialogViewId from "./dialog-view-id";
import DialogViewStats from "./dialog-view-stats";
import DialogViewAccount from "./dialog-view-account";

export function UserListItem({userData, isLast, setError, setRows, roleList, loadData}) {
  const { _id, username, role, passwordHash, googleId, stats, createdAt, lastLogin} = userData;

    const [confirmDelete, setConfirmDelete] = useState(false);
    const [editMode, setEditMode] = useState(false);

  const { token } = useContext(AuthContext);
  const { addAlert, hideAllAlerts } = useContext(AlertContext);

  const classes = isLast ? "p-4" : "p-4 border-b border-blue-gray-50";

  const persistRoleChange = async (userId, fallbackRole, nextRole) => {
    try {
      // setError(null);

      const res = await fetch(`/api/users/${userId}/role`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ role: nextRole }),
      });

      if (!res.ok) {
        addAlert(`Nepavyko pakeisti rolės (HTTP ${res.status})`, "error");
      }
      
      try {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          if (data?.message) {
            addAlert(data.message, "success");
          } else if (data?.error) {
            addAlert(data.error, "error");
          }
        }
      } catch (err) {
          addAlert(`JSON nuskaitymo klaida (HTTP ${res.status})`, "error");
      }
    } catch (err) {
      setRows((prev) =>
        prev.map((row) => {
          if (row.id !== userId) return row;
          if ((row.role ?? null) !== nextRole) return row;
          return { ...row, role: fallbackRole };
        })
      );

      addAlert(err.message || "Nepavyko pakeisti rolės", "error");
    }
  };

    const handleDelete = async () => {
    try {
      const res = await fetch(`/api/users/${_id}`, {
        method: "DELETE",
        headers: { 
          "Authorization": `Bearer ${token}` 
        },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      loadData();
      addAlert("User successfully deleted.", "success");
    } catch (e) {
      addAlert(e.message || "Failed to delete the user.", "error");
    } 
  };

    const confirmEdit = async () => {
      setEditMode(false)
  };

    const cancelEdit = () => {
    setEditMode(false);
  }

  return (
    <tr>
      <td className={classes}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <Typography variant="small" color="blue-gray" className="font-normal">
              {username}
            </Typography>
          </div>
        </div>
      </td>
      {editMode ? (
        <td className={classes}>
          <div className="w-40">
            <Select
              label="Role"
              value={role}
              onChange={(val) => {
                const nextRole = val;

                if (!nextRole) {
                  addAlert(`Rolės nėra: ${val}`, "error");
                  return;
                }

                const prevRole = role ?? null;

                setRows((prev) =>
                  prev.map((r) =>
                    r._id === _id
                      ? { ...r, role: nextRole }
                      : r
                  )
                );

                persistRoleChange(_id, prevRole, nextRole);
              }}
            >
              {roleList.map((r) => (
                <Option key={r} value={r}>
                  {r}
                </Option>
              ))}
            </Select>
          </div>
        </td>
      ) : (
      <td className={classes}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <Typography variant="small" color="blue-gray" className="font-normal">
              {role}
            </Typography>
          </div>
        </div>
      </td>
      )}
      <td className={classes}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <DialogViewStats data={userData} onSaved={(updated) =>
              setRows((rows) => rows.map((row) => row._id === updated._id ? updated : row))
            }/>
          </div>
        </div>
      </td>
            <td className={classes}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <DialogViewAccount data={userData}/>
          </div>
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
          <DialogViewId data={userData}/>
        </td>
        )}
    </tr>
  );
}

export default UserListItem;
