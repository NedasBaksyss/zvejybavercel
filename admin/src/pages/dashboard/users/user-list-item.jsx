import { PencilIcon } from "@heroicons/react/24/solid";
import {
  Typography,
  IconButton,
  Tooltip,
  Select,
  Option,
  Switch,
} from "@material-tailwind/react";

import { useContext } from "react";
import { AuthContext, AlertContext } from "@/context";

export function UserListItem({userData, isLast, setError, setRows, roleList}) {
  const { id, role, email, status} = userData;

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

  const persistStatusChange = async (userId, fallbackStatus, nextStatus) => {
    try {
      setError(null);

      const res = await fetch(`/api/users/${userId}/status`, {
        method: "PATCH",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!res.ok) {
        addAlert("Būsenos pakeisti nepavyko", "error");
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
          if ((row.status ?? null) !== nextStatus) return row;
          return { ...row, status: fallbackStatus };
        })
      );

      addAlert(err.message || "Nepavyko pakeisti būsenos", "error");
    }
  };

  return (
    <tr>
      <td className={classes}>
        <div className="flex items-center gap-3">
          <div className="flex flex-col">
            <Typography variant="small" color="blue-gray" className="font-normal">
              {email}
            </Typography>
          </div>
        </div>
      </td>

      <td className={classes}>
        <div className="w-40"> 
          <Select 
            label="Vartotojo rolė"
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
                  r.id === id ? { ...r, role: val } : r
                )
              );

              persistRoleChange(id, prevRole, nextRole);
            }}
          >
            {roleList.map((r) => (
              <Option key={r} value={r} >{r}</Option>
            ))}
          </Select>                         
        </div>
      </td>

      <td className={classes}>
        <Switch
          checked={status === 1}
          onChange={() => {
            const prevStatus = status === 1 ? 1 : 0;
            const nextStatus = prevStatus === 1 ? 0 : 1;

            setRows((prev) =>
              prev.map((row) =>
                row.id === id ? { ...row, status: nextStatus } : row
              )
            );

            persistStatusChange(id, prevStatus, nextStatus);
          }}
        />
      </td>

      <td className={classes}>
        <Tooltip content="Edit User">
          <IconButton variant="text">
            <PencilIcon className="h-4 w-4" />
          </IconButton>
        </Tooltip>
      </td>
    </tr>
  );
}

export default UserListItem;
