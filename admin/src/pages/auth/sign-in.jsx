import React, { useState, useContext, useEffect } from "react";
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { DialogForgotPassword } from "@/widgets/dialogs";
import { AuthContext, AlertContext } from "@/context";

export function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { user, setUser, token, setToken } = useContext(AuthContext);

  const { addAlert, hideAllAlerts } = useContext(AlertContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setError(null);
    setLoading(true);

    hideAllAlerts();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      // safe parse: guard against empty response body
      let data = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        data = null;
      }

      if (!res.ok) {
        if (data && data.message) {
          let details = "";
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach((error) => {
              details += error.msg + "<br />";
            });
          }
          addAlert(data.message, "warning", details || null);
        }

        setError((data && data.message) || "Sign in failed");
        setLoading(false);
        return;
      }

      // fiksuojame duomenis kontekste
      setToken(data.token);
      setUser(data.user);

      // talpoiname token į LocalStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      addAlert("Prisijungta sėkmingai", "success");

      // navigate to admin dashboard (adjust route if necessary)
      navigate("/");
    } catch (err) {
      addAlert("Network error", "error");
      setError(err.message || "Network error");
    } finally {
      setLoading(false);
    }
  };

  // peradresavimas į dashboard
  useEffect(() => {
    if (user && token) {
      // router navigate to dashboard
      console.log("Redirecting to dashboard...");
      setTimeout(doNavigateDashboard, 1000);
    }
  }, [user, token]);

  const doNavigateDashboard = () => {
    navigate("/dashboard/home");
  };

  return (
    <section className="m-8 flex gap-4">
      <div className="mt-24 w-full lg:w-3/5">
        <div className="text-center">
          <Typography variant="h2" className="mb-4 font-bold">
            Prisijungimas
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Įrašykite savo el. paštą ir slaptažodį, kad prisijungtumėte
          </Typography>
        </div>
        <form
          onSubmit={handleSubmit}
          className="mx-auto mb-2 mt-8 w-80 max-w-screen-lg lg:w-1/2"
        >
          <div className="mb-1 flex flex-col gap-6">
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Jūsų el. paštas
            </Typography>
            <Input
              size="lg"
              placeholder="name@mail.com"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Slaptažodis
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="********"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>
          <Button className="mt-6" fullWidth type="submit" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </Button>

          {error && (
            <Typography
              variant="small"
              color="red"
              className="mt-3 text-center font-medium"
            >
              {error}
            </Typography>
          )}

          <div className="mt-6 flex items-center justify-between gap-2">
            <Typography variant="small" className="font-medium text-gray-900">
              <DialogForgotPassword />
            </Typography>
          </div>

          <Typography
            variant="paragraph"
            className="mt-4 text-center font-medium text-blue-gray-500"
          >
            Neprisijungęs?
            <Link to="/auth/registruotis" className="ml-1 text-gray-900">
              Sukurti paskyrą
            </Link>
          </Typography>

          <Typography
            variant="paragraph"
            className="mt-4 text-center font-medium text-blue-gray-500"
          >
            Demo prisijungimai:
            <br />
            <a
              href="#"
              onClick={() => {
                setEmail("admin@example.com");
                setPassword("adminpassword");
              }}
              className="ml-1 text-gray-900"
            >
              Administratorius
            </a>
            
            <br />
            <a
              href="#"
              onClick={() => {
                setEmail("user@example.com");
                setPassword("userpassword");
              }}
              className="ml-1 text-gray-900"
            >
              Vartotojas
            </a>
          </Typography>
        </form>
      </div>
      <div className="hidden h-full w-2/5 lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full rounded-3xl object-cover"
        />
      </div>
    </section>
  );
}

export default SignIn;
