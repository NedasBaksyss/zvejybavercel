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
import { AuthContext, AlertContext } from "@/context";
import LakeListItem from "./fishing-spots-list-item";
import DialogNewFishingSpot from "./dialog-new-fishing-spot";

const TABS = [
  { label: "All", value: "all" },
  { label: "Begginer", value: "begginer" },
  { label: "Hell", value: "hell" }
];

const TABLE_HEAD = ["MapId", "Sprite", "Name", "Description",  "World", "Possible fishes", "Edit"];

export function FishingSpotList() {
  const [rows, setRows] = useState([]);            // fetched members
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tab, setTab] = useState("all"); 
  const [q, setQ] = useState("");                  // search query
  const [roleList, setRoleList] = useState(["admin", "user"]);     // rolių sąrašas

  const { token } = useContext(AuthContext);
  const { addAlert, hideAllAlerts } = useContext(AlertContext);


  // Loading the fishing spots list
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/fishingspots", {
        method: "GET",
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
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
      addAlert(e.message || "Failed to load fishing spots", "error");
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    if (!token) return; // wait until token is available
    loadData();
  },[token]);


    // filter + search (case-insensitive)
  const filtered = useMemo(() => {
    // filter by tab
    const byTab = tab === "all" ? rows : rows.filter((r) => r.world === tab);

    // filter by search
    const term = q.trim().toLowerCase();
    if (!term) return byTab;

    return byTab.filter((r) =>
      [r.gamesId]
        .filter(Boolean)
        .some((v) => v.toLowerCase().includes(term))
    );
  }, [rows, tab, q]);

  return (
    <div>
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-3 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              Fishing Spots
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              View and manage fishing spots
            </Typography>
          </div>
          <DialogNewFishingSpot loadData={loadData} />
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
            Loading fishing spots…
          </div>
        )}
        {error && (
          <div className="p-6 text-center text-sm text-red-500">
            {error}
          </div>
        )}

        {!loading && !error && (
          <table className="mt-0 w-full min-w-max table-auto text-left">
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
                (data, index) => {
                  const isLast = index === filtered.length - 1;
                  
                  return (
                    <LakeListItem 
                      key={data._id} 
                      data={data} 
                      isLast={isLast} 
                      rows={rows} 
                      setRows={setRows} 
                      error={error}
                      setError={setError}
                      loadData={loadData}
                    />
                  );
                }
              )}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-blue-gray-500" colSpan={TABLE_HEAD.length}>
                    The fishing spots list is empty.
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

export default FishingSpotList;
