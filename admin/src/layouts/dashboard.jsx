import { Routes, Route } from "react-router-dom";
import { Cog6ToothIcon } from "@heroicons/react/24/solid";
import { IconButton } from "@material-tailwind/react";
import {
  Sidenav,
  DashboardNavbar,
  Configurator,
  Footer,
} from "@/widgets/layout";
import routes from "@/routes";
import { useMaterialTailwindController, setOpenConfigurator } from "@/context";
import { useEffect, useRef, useContext } from "react";
import { AuthContext } from "@/context";
import { useNavigate } from "react-router-dom";

export function Dashboard() {
  const [controller, dispatch] = useMaterialTailwindController();
  const { sidenavType } = controller;


  // tikriname ar yra prisijungęs vartotojas
  // jei nėra, peradresuojame į /auth/sign-in
  const {user, token} = useContext(AuthContext);

  const timeoutRef = useRef(null);
  useEffect(() => {
    if (!timeoutRef.current) {
      timeoutRef.current = setTimeout(checkAuth, 1000);
    } else {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(checkAuth, 1000);
    }
    // console.log("user or token changed:", user, token, timeoutRef.current);
  }, [user, token]);

  const checkAuth = () => {
    if (!user || !token) {
      console.log("No user or token, redirecting to sign-in...");
      setTimeout(doNavigateSignIn, 1000);
    }
  }


  const navigate = useNavigate();
  const doNavigateSignIn = () => {
    navigate("/auth/prisijungti");
  }

  return (
    user && token && (  
      <div className="min-h-screen bg-blue-gray-50/50">
        <Sidenav
          routes={routes}
          brandImg={
            sidenavType === "dark" ? "/img/logo-ct.png" : "/img/logo-ct-dark.png"
          }
        />
        <div className="p-4 xl:ml-80">
          <DashboardNavbar />
          <Configurator />
          <IconButton
            size="lg"
            color="white"
            className="fixed bottom-8 right-8 z-40 rounded-full shadow-blue-gray-900/10"
            ripple={false}
            onClick={() => setOpenConfigurator(dispatch, true)}
          >
            <Cog6ToothIcon className="h-5 w-5" />
          </IconButton>
          <Routes>
            {routes.map(
              ({ layout, pages }) =>
                layout === "admin" &&
                pages.map(({ path, element }) => (
                  <Route exact path={path} element={element} />
                ))
            )}
          </Routes>
          <div className="text-blue-gray-600">
            <Footer />
          </div>
        </div>
      </div>
    )
  );
}

Dashboard.displayName = "/src/layout/dashboard.jsx";

export default Dashboard;
