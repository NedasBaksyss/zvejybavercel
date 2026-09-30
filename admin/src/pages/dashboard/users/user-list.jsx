import { useEffect, useMemo, useState, useContext } from "react";
import { MagnifyingGlassIcon, InformationCircleIcon } from "@heroicons/react/24/outline";
import { UserPlusIcon } from "@heroicons/react/24/solid";
import {
  Card,
  CardHeader,
  Input, 
  Typography,
  Button,
  CardBody,
  CardFooter,
  Tabs,
  TabsHeader,
  Tab,
} from "@material-tailwind/react";
import UserListItem from "@/pages/dashboard/users/user-list-item";
import { AuthContext, AlertContext } from "@/context";


const TABS = [
  { label: "All", value: "all" },
  { label: "Admin", value: "admin" },
  { label: "User", value: "user" },
  { label: "Guest", value: "guest" }
];

const TABLE_HEAD = ["User", "Role", "Game's Info", "Account's Info", "Edit"];

export function UserList() {
  const [rows, setRows] = useState([]);            // fetched members
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all");           // "all" | "admin" | "user"
  const [q, setQ] = useState("");                  // search query
  const [roleList, setRoleList] = useState(["admin", "user", "guest"]);     // rolių sąrašas

  // const { token } = useContext(AuthContext);
  const { addAlert, hideAllAlerts } = useContext(AlertContext);

  const loadData = async () => {
      try {
        setLoading(true);
        const res = await fetch("/api/users", {
          method: "GET",
          headers: { 
            "Content-Type": "application/json", 
            // "Authorization": `Bearer ${token}` 
          },
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        let data = [];
        try {
          const text = await res.text();
          data = text ? JSON.parse(text) : [];
        } catch (e) {
          data = [];
        }

        setRows(data);
      } catch (e) {
        addAlert(e.message || "Failed to load users.", "error");
      } finally {
        setLoading(false);
      }
    }

  useEffect(() => {
    // if (!token) return; // wait until token is available

    // vartotojų sąrašas
  loadData()
  },[])
// [token]

  // filter + search (case-insensitive)
  const filtered = useMemo(() => {
    // filter by tab
    const byTab = tab === "all" ? rows : rows.filter((r) => r.role === tab);

    // filter by search
    const term = q.trim().toLowerCase();
    if (!term) return byTab;

    return byTab.filter((r) =>
      [r.username, r.email]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(term))
    );
  }, [rows, tab, q]);

  return (
    <div>
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-8 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              User list
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              View and manage registered users
            </Typography>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <Tabs value={tab} className="w-full md:w-max">
            <TabsHeader>
              {TABS.map(({ label, value }) => (
                <Tab key={value} value={value} onClick={() => setTab(value)}>
                  &nbsp;&nbsp;{label}&nbsp;&nbsp;
                </Tab>
              ))}
            </TabsHeader>
          </Tabs>

          <div className="w-full md:w-72">
            <Input
              label="Search"
              icon={<MagnifyingGlassIcon className="h-5 w-5" />}
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </div>
      </CardHeader>

      <CardBody className="overflow-scroll px-0">
        {loading && (
          <div className="p-6 text-center text-sm text-blue-gray-500">
            Loading users…
          </div>
        )}
        {error && (
          <div className="p-6 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && (
          <table className="mt-4 w-full min-w-max table-auto text-left">
            <thead>
              <tr>
                {TABLE_HEAD.map((head) => (
                  <th
                    key={head}
                    className="border-y border-blue-gray-100 bg-blue-gray-50/50 p-4"
                  >
                    <Typography
                      variant="small"
                      color="blue-gray"
                      className="font-normal leading-none opacity-70"
                    >
                      {head}
                    </Typography>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {roleList.length > 0 && filtered.map(
                (userData, index) => {
                  const isLast = index === filtered.length - 1;
                  
                  return (
                    <UserListItem 
                      key={userData._id} 
                      userData={userData} 
                      isLast={isLast} 
                      rows={rows} 
                      setRows={setRows} 
                      error={error} 
                      setError={setError} 
                      roleList={roleList}
                      loadData={loadData}
                    />
                  );
                }
              )}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-blue-gray-500" colSpan={5}>
                    No users match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </CardBody>
    </Card>
    

    </div>
  );
}

export default UserList;
