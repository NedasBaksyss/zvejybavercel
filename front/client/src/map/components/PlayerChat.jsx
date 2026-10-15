import { useEffect, useRef, useState } from "react";
import { usePlayerChat } from "../../multiplayer/usePlayerChat.js";
import "./playerChat.css";

export default function PlayerChat({ active, language, onReturnToGame }) {
  const chat = usePlayerChat();
  return active ? <ChatPanel key={String(chat.connected)} {...chat} language={language} onReturnToGame={onReturnToGame} /> : null;
}

function ChatPanel({ messages, connected, error, sending, send, language, onReturnToGame }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const logRef = useRef(null);
  const inputRef = useRef(null);
  const lt = language === "LT";
  const label = lt ? "Pokalbis" : "Chat";
  const errors = lt
    ? { cooldown: "Palaukite prieš siųsdami dar kartą.", timeout: "Negautas atsakymas. Bandykite dar kartą.", invalid: "Žinutė turi būti iki 200 simbolių.", empty: "Įrašykite žinutę.", disconnected: "Nėra ryšio." }
    : { cooldown: "Wait a moment before sending again.", timeout: "No reply. Please try again.", invalid: "Messages must be under 201 characters.", empty: "Type a message first.", disconnected: "Disconnected." };

  useEffect(() => {
    if (open) logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages, open]);

  function toggle() {
    setOpen(!open);
    if (open) onReturnToGame();
  }

  return (
    <div className="player-chat" data-game-chat="true" onKeyDown={(event) => {
      event.stopPropagation();
      if (event.key === "Escape" && open) {
        event.preventDefault();
        setOpen(false);
        onReturnToGame();
      }
    }}>
      <button type="button" className="player-chat-toggle" aria-label={label}
        title={label} aria-expanded={open} aria-controls="player-chat-panel" onClick={toggle}>
        <svg viewBox="0 0 16 16" aria-hidden="true" shapeRendering="crispEdges">
          <path fill="#091d22" d="M1 1h14v11H8v2H6v2H3v-4H1z" />
          <path fill="#c9d7ad" d="M2 2h12v9H7v2H5v1H4v-3H2z" />
          <path fill="#43645b" d="M4 4h8v1H4zm0 3h6v1H4z" />
        </svg>
      </button>
      {open && <section className="player-chat-panel" id="player-chat-panel" aria-label={label}>
        <header>{lt ? "Visi žaidėjai" : "All players"}<span role="status">{connected ? (lt ? "Prisijungta" : "Online") : (lt ? "Jungiamasi…" : "Connecting…")}</span></header>
        <div className="player-chat-log" ref={logRef} role="log" aria-live="polite" aria-relevant="additions" tabIndex={0}>
          {!messages.length && <p className="player-chat-empty">{lt ? "Pasisveikinkite su žaidėjais!" : "Say hello to the other anglers!"}</p>}
          {messages.map((message) => <p key={message.id}><strong>{message.name}: </strong><span>{message.text}</span></p>)}
        </div>
        {error && <p className="player-chat-error" role="alert">{errors[error] || errors.invalid}</p>}
        <form onSubmit={(event) => {
          event.preventDefault();
          send(draft, () => { setDraft(""); inputRef.current?.focus(); });
        }}>
          <input ref={inputRef} aria-label={lt ? "Žinutė" : "Message"} placeholder={lt ? "Rašykite čia…" : "Type a message…"}
            maxLength={200} value={draft} onChange={(event) => setDraft(event.target.value)} readOnly={sending} disabled={!connected} autoComplete="off" />
          <button type="submit" disabled={!connected || sending || !draft.trim()} aria-label={lt ? "Siųsti" : "Send"}>{sending ? "…" : "➤"}</button>
        </form>
      </section>}
    </div>
  );
}
