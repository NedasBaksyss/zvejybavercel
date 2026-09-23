import { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {AuthContext, AlertContext} from "@/context";

export function SignOut() {
  const {user, setUser, token, setToken} = useContext(AuthContext);
  const {addAlert} = useContext(AlertContext);

  useEffect(() => {
    // išvalome localStorage
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    // išvalome kontekstą
    setUser(null);
    setToken(null); 
    addAlert("Sėkmingai atsijungta", "success");
  }, []);


  const navigate = useNavigate();
  // peradresavimas į sign in
  useEffect(() => {
    if (!user && !token) {
      // router navigate to sign in
      // console.log("Redirecting to sign in...");
      setTimeout(doNavigateSignIn, 1000);
    }
  }, [user, token]);

  const doNavigateSignIn = () => {
    navigate("/auth/prisijungti");
  }

  return ( <></> );
}

export default SignOut;
