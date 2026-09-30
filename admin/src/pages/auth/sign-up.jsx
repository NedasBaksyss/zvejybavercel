import { useState, useContext } from "react";
import {
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import { AlertContext } from "@/context";

export function SignUp() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const navigate = useNavigate();

  const { addAlert, hideAllAlerts } = useContext(AlertContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    hideAllAlerts();

    if (!username || !email || !password || !password2) {
      addAlert("Visi laukai privalomi", "warning");
      return;
    }

    if (password !== password2) {
      addAlert("Nesutampa slaptažodžiai", "warning");
      return;
    }

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

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
          if (data.details) {
            data.details.forEach((error) => {
              details += error.msg + "<br />";
            });
          }
          addAlert(data.message, "warning", details || null);
        }

        // setError((data && data.message) || "Sign in failed");
        // setLoading(false);
        return;
      }

      // Redirect or show success
      addAlert("Registracija sėkminga!", "success");
      setTimeout(doNavigateSignIn, 1000);
    } catch (error) {
      addAlert("Serverio klaida", "error");
    }
  };

  const doNavigateSignIn = () => {
    navigate("/auth/prisijungti");
  };

  return (
    <section className="m-8 flex">
      <div className="hidden h-full w-2/5 lg:block">
        <img
          src="/img/pattern.png"
          className="h-full w-full rounded-3xl object-cover"
          alt="signup pattern"
        />
      </div>
      <div className="flex w-full flex-col items-center justify-center lg:w-3/5">
        <div className="text-center">
          <Typography variant="h2" className="mb-4 font-bold">
            Prisijunk prie mūsų šiandien!
          </Typography>
          <Typography
            variant="paragraph"
            color="blue-gray"
            className="text-lg font-normal"
          >
            Įrašykite savo el. pašto adresą ir slaptažodį
          </Typography>
        </div>
        <form
          className="mx-auto mb-2 mt-8 w-80 max-w-screen-lg lg:w-1/2"
          onSubmit={handleSubmit}
        >
          <div className="mb-1 flex flex-col gap-6">
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Username
            </Typography>
            <Input
              size="lg"
              type="text"
              placeholder="Username"
              value={username}
              minLength={3}
              maxLength={30}
              onChange={(e) => setUsername(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>
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
              type="email"
              placeholder="name@mail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>
          <div className="mb-1 mt-4 flex flex-col gap-6">
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Jūsų slaptažodis
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>
          <div className="mb-1 mt-4 flex flex-col gap-6">
            <Typography
              variant="small"
              color="blue-gray"
              className="-mb-3 font-medium"
            >
              Pakartokite slaptažodį
            </Typography>
            <Input
              type="password"
              size="lg"
              placeholder="Password"
              value={password2}
              onChange={(e) => setPassword2(e.target.value)}
              className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
              labelProps={{
                className: "before:content-none after:content-none",
              }}
            />
          </div>
          <Checkbox
            label={
              <Typography
                variant="small"
                color="gray"
                className="flex items-center justify-start font-medium"
              >
                Aš sutinku su&nbsp;
                <a
                  href="#"
                  className="font-normal text-black underline transition-colors hover:text-gray-900"
                >
                  Terminais ir sąlygomis
                </a>
              </Typography>
            }
            containerProps={{ className: "-ml-2.5" }}
          />
          <Button className="mt-6" fullWidth type="submit">
            Kurti paskyra
          </Button>

          <Typography
            variant="paragraph"
            className="mt-4 text-center font-medium text-blue-gray-500"
          >
            Jau turite paskyrą?
            <Link to="/auth/prisijungti" className="ml-1 text-gray-900">
              Prisijungimas
            </Link>
          </Typography>
        </form>
      </div>
    </section>
  );
}

export default SignUp;
