import {
  Card,
  CardBody,
  Typography,
  Button,
  Input,
} from "@material-tailwind/react";

import { useContext, useState } from "react";
import { AuthContext, AlertContext } from "@/context";

export function Profile() {
  const [passwordOld, setPasswordOld] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordRepeat, setPasswordRepeat] = useState("");

  const { user, setUser, token, setToken } = useContext(AuthContext);
  const { addAlert, hideAllAlerts } = useContext(AlertContext);

  const handleSubmit = async (e) => {
    e.preventDefault();

    hideAllAlerts();

    if (!passwordOld || !passwordNew || !passwordRepeat) {
      addAlert("Visi laukai privalomi", "warning");
      return;
    }

    if (passwordNew !== passwordRepeat) {
      addAlert("Nesutampa slaptažodžiai", "warning");
      return;
    }

    try {
      const res = await fetch(`/api/users/${user.id}/password`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          currentPassword: passwordOld,
          newPassword: passwordNew,
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
          if (data.errors) {
            data.errors.forEach((error) => {
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
      // console.log("User registered:", data);
      addAlert("Slaptažodis pakeistas!", "success");
      // setTimeout(doNavigateSignIn, 1000);
    } catch (error) {
      addAlert("Network error, please try again later.", "error");
    }
  };

  return (
    <>
      <div className="relative mt-8 h-72 w-full overflow-hidden rounded-xl bg-[url('/img/background-image.png')] bg-cover	bg-center">
        <div className="absolute inset-0 h-full w-full bg-gray-900/75" />
      </div>
      <Card className="mx-3 -mt-16 mb-6 border border-blue-gray-100 lg:mx-4">
        <CardBody className="p-4">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div>
                <Typography variant="h5" color="blue-gray" className="mb-1">
                  {user.userName}
                </Typography>
                <Typography
                  variant="small"
                  className="font-normal text-blue-gray-600"
                >
                  {user.roleTitle}
                </Typography>
              </div>
            </div>
          </div>
          <div className="px-4 pb-4">
            <Typography variant="h6" color="blue-gray" className="mb-2">
              Keisti slaptažodį
            </Typography>
            <div className="mt-6">
              <form
                className="mx-auto mb-2 mt-8 max-w-screen-lg"
                onSubmit={handleSubmit}
              >
                <div className="mb-1 mt-4 flex flex-col gap-6">
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className="-mb-3 font-medium"
                  >
                    Dabartinis slaptažodis
                  </Typography>
                  <Input
                    type="password"
                    size="lg"
                    placeholder="Password"
                    value={passwordOld}
                    onChange={(e) => setPasswordOld(e.target.value)}
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
                    Naujas slaptažodis
                  </Typography>
                  <Input
                    type="password"
                    size="lg"
                    placeholder="Password"
                    value={passwordNew}
                    onChange={(e) => setPasswordNew(e.target.value)}
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
                    value={passwordRepeat}
                    onChange={(e) => setPasswordRepeat(e.target.value)}
                    className=" !border-t-blue-gray-200 focus:!border-t-gray-900"
                    labelProps={{
                      className: "before:content-none after:content-none",
                    }}
                  />
                </div>
                <Button className="mt-6" fullWidth type="submit">
                  Keisti
                </Button>
              </form>
            </div>
          </div>
        </CardBody>
      </Card>
    </>
  );
}

export default Profile;
