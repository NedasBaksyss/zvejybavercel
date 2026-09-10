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
import { AlertContext } from "@/context";
import ProjectListItem from "./project-list-item";
import DialogNewProject from "./dialog-new-project";

const TABLE_HEAD = ["#", "Foto", "Pavadinimas", "Aprašymas", "Sukūrimo data", "Rikiavimas", "Redaguoti"];

export function ProjectList() {
  const [rows, setRows] = useState([]);            // fetched members
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [q, setQ] = useState("");                  // search query
  const [roleList, setRoleList] = useState(["admin", "user"]);     // rolių sąrašas

  // const { token } = useContext(AuthContext);
  const { addAlert, hideAllAlerts } = useContext(AlertContext);

  // projektų sąrašo užkrovimas
  const loadData = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/projects", {
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
      addAlert(e.message || "Nepavyko užkrauti projektų", "error");
    } finally {
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   if (!token) return; // wait until token is available
  //   loadData();
  // }, [token]);

  return (
    <div>
    <Card className="h-full w-full">
      <CardHeader floated={false} shadow={false} className="rounded-none">
        <div className="mb-3 flex items-center justify-between gap-8">
          <div>
            <Typography variant="h5" color="blue-gray">
              Projektai
            </Typography>
            <Typography color="gray" className="mt-1 font-normal">
              Peržiurėti ir valdyti projektus
            </Typography>
          </div>
          <DialogNewProject loadData={loadData} />
        </div>
      </CardHeader>

      <CardBody className="overflow-scroll px-0">
        {loading && (
          <div className="p-6 text-center text-sm text-blue-gray-500">
            Kraunami projektai…
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
              {roleList.length > 0 && rows.map(
                (data, index) => {
                  const isLast = index === rows.length - 1;
                  
                  return (
                    <ProjectListItem 
                      key={data.id} 
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
              {rows.length === 0 && (
                <tr>
                  <td className="p-4 text-sm text-blue-gray-500" colSpan={TABLE_HEAD.length}>
                    Projektų sąrašas tuščias.
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

export default ProjectList;
