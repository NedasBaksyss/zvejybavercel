import React from "react";
import {
  Button,
  Dialog,
  Card,
  CardBody,
  CardFooter,
  Typography,
  Input,
} from "@material-tailwind/react";

export function DialogForgotPassword() {
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState(null);

  const handleOpen = () => setOpen((cur) => !cur);

  const handleRequest = async () => {
    setMessage(null);
    setLoading(true);
    try {
      const res = await fetch("/api/password-reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      let data = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch (e) {
        data = null;
      }
      if (!res.ok) {
        setMessage((data && data.message) || "Failed to request password reset");
        setLoading(false);
        return;
      }
      setMessage("If the email exists you will receive a password reset link shortly.");
      setLoading(false);
    } catch (err) {
      setMessage(err.message || "Network error");
      setLoading(false);
    }
  };

  return (
    <>
      <Button variant="text" onClick={handleOpen}>Pamiršau slaptažodį</Button>
      <Dialog size="xs" open={open} handler={handleOpen} className="bg-transparent shadow-none ">
        <Card className="mx-auto w-full max-w-[24rem]">
          <CardBody className="flex flex-col gap-4">
            <Typography variant="h5" color="blue-gray">Keisti slaptažodį</Typography>
            <Input label="Email" size="lg" value={email} onChange={(e)=>setEmail(e.target.value)} />
            {message && <Typography className="text-black">{message}</Typography>}
          </CardBody>
          <CardFooter className="pt-0">
            <Button variant="text" color="red" onClick={handleOpen} className="mr-1">Atšaukti</Button>
            <Button variant="gradient" onClick={handleRequest} fullWidth disabled={loading} className="bg-black text-white hover:opacity-90">{loading?"Sending...":"Send reset email"}</Button>
          </CardFooter>
        </Card>
      </Dialog>
    </>
  );
}

export default DialogForgotPassword;
