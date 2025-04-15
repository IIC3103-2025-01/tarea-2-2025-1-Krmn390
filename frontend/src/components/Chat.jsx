import { useEffect, useRef, useState } from "react";

function Chat({ messages, onSend }) {
  const [input, setInput] = useState("");
  const scrollRef = useRef();

  const handleSend = () => {
    if (input.trim() !== "") {
      onSend(input);
      setInput("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  // 🔁 Scroll automático al final
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", maxWidth: 500, marginTop: "1rem" }}>
      <h3>💬 Chat con Satélites</h3>

      <div
        style={{
          height: 250,
          overflowY: "scroll",
          backgroundColor: "#f9f9f9",
          marginBottom: "1rem",
          padding: "0.5rem",
          fontSize: "0.9rem",
          border: "1px solid #ddd"
        }}
      >
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              color: msg.level === "warn" ? "red" : "black",
              marginBottom: "0.5rem"
            }}
          >
            <strong>{msg.station_id || "¿?"}:</strong> {msg.content}
            <br />
            <small>{new Date(msg.date).toLocaleString()}</small>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>

      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Escribe un mensaje o comando"
        style={{ width: "100%", padding: "0.5rem" }}
      />
      <button onClick={handleSend} style={{ marginTop: "0.5rem", width: "100%" }}>
        Enviar
      </button>
    </div>
  );
}

export default Chat;
