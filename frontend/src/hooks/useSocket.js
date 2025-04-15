import { useEffect, useRef } from "react";

export default function useSocket(onMessage) {
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = new WebSocket(import.meta.env.VITE_WS_URL);
    socketRef.current = socket;

    socket.addEventListener("open", () => {
      console.log("✅ WebSocket conectado");
      socket.send(
        JSON.stringify({
          type: "AUTH",
          name: import.meta.env.VITE_STUDENT_NAME,
          student_number: import.meta.env.VITE_STUDENT_NUMBER,
        })
      );
    });

    socket.addEventListener("message", (event) => {
      const data = JSON.parse(event.data);
      console.log("📡 Recibido:", data);
      if (onMessage) onMessage(data);
    });

    socket.addEventListener("close", () => {
      console.log("🔌 Desconectado");
    });

    return () => {
      socket.close();
    };
  }, []);

  const sendCommand = (commandType, payload = {}) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: commandType, ...payload });
      console.log("📤 Enviando:", message);
      socketRef.current.send(message);
    } else {
      console.warn("⚠️ WebSocket no está conectado");
    }
  };

  return { socketRef, sendCommand };
}
