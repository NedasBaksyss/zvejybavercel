import { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext, AlertContext } from "@/context";

export function useSignOut() {
  const { setUser, setToken } = useContext(AuthContext);
  const { addAlert } = useContext(AlertContext);
  const navigate = useNavigate();

  const signOut = () => {
    // Išvalome localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // Išvalome kontekstą
    setUser(null);
    setToken(null);

    // Parodome pranešimą
    addAlert("Sėkmingai atsijungta", "success");

    // Peradresuojame į prisijungimo puslapį
    navigate("/auth/prisijungti");
  };

  return signOut;
}

export default useSignOut;
