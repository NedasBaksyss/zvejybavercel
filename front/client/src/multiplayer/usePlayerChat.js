import { useEffect, useRef, useState } from "react";
import { socket } from "./socket.js";

export function usePlayerChat() {
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(socket.connected);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);
  const request = useRef(0);

  useEffect(() => {
    const requests = request;
    const onConnect = () => { setConnected(true); setError(""); };
    const onDisconnect = () => {
      requests.current++;
      setConnected(false);
      setMessages([]);
      setSending(false);
      setError("");
    };
    const onHistory = (history) => setMessages(history.slice(-50));
    const onMessage = (message) => setMessages((previous) =>
      previous.some((entry) => entry.id === message.id)
        ? previous : [...previous, message].slice(-50));
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("chat:history", onHistory);
    socket.on("chat:message", onMessage);
    return () => {
      requests.current++;
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("chat:history", onHistory);
      socket.off("chat:message", onMessage);
    };
  }, []);

  function send(text, onSuccess) {
    if (!socket.connected || sending || !text.trim()) return;
    setSending(true);
    setError("");
    const currentRequest = ++request.current;
    socket.timeout(5000).emit("chat:send", { text }, (timeout, response) => {
      if (currentRequest !== request.current) return;
      setSending(false);
      if (timeout) setError("timeout");
      else if (!response?.ok) setError(response?.error || "invalid");
      else onSuccess();
    });
  }

  return { messages, connected, error, sending, send };
}
