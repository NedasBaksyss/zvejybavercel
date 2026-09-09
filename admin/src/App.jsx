import { Routes, Route, Navigate } from "react-router-dom";
import { Dashboard, Auth, Demo } from "@/layouts";
import { useEffect, useState } from "react";
import { AuthContext, AlertContext } from "@/context";
import { AlertList } from "@/widgets/alerts";

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  // alerts state and functions
  const [alerts, setAlerts] = useState({});

  let pendingAlerts = [];

  const addAlert = (message, type = "warning", details = null) => {
    for (let alert of pendingAlerts) {
      if (alert.message === message && alert.type === type) {
        return;
      }
    }

    let alertData = { message, type, details };
    pendingAlerts.push(alertData);

    // tikrina ar toks pats alertas jau egzistuoja
    for (let key in alerts) {
      const alert = alerts[key];
      if (alert.message === message && alert.type === type) {
        return;
      }
    }

    setAlerts((current) => ({
      ...current,
      [Math.floor(Math.random() * 100000)]: {
        type,
        message,
        details,
        open: true,
      },
    }));
  };

  const hideAllAlerts = () => {
    setAlerts([]);
  };
  // end alerts state and functions

  useEffect(() => {
    // tikriname ar yra token localStorage
    const sessionToken = localStorage.getItem("token");
    const sessionUser = localStorage.getItem("user");

    if (sessionToken && sessionUser) {
      setToken(sessionToken);
      setUser(JSON.parse(sessionUser));
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, token, setToken }}>
      <AlertContext.Provider
        value={{ alerts, setAlerts, addAlert, hideAllAlerts }}
      >
        <Routes>
          <Route path="/admin/*" element={<Dashboard />} />
          <Route path="/auth/*" element={<Auth />} />
          <Route path="/demo/*" element={<Demo />} />
          <Route path="*" element={<Navigate to="/admin/home" replace />} />
        </Routes>
        <AlertList />
      </AlertContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;
