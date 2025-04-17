import { useEffect, useRef } from "react";

export default function useSocket(onMessage) {
  const socketRef = useRef(null);
  const pendingCommands = useRef([]);
  const isAuthenticated = useRef(false); // ✅ Nueva bandera

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
    
      // AUTH OK
      if (data.type === "AUTH" && data.message?.startsWith("AUTH OK")) {
        isAuthenticated.current = true;
        console.log("🔓 Autenticado correctamente, enviando comandos pendientes");
        pendingCommands.current.forEach((cmd) => {
          socket.send(JSON.stringify(cmd));
        });
        pendingCommands.current = [];
      }
    
      // ✅ Si el servidor te manda solo IDs de satélites, solicita info detallada:
      if (data.type === "SATELLITES" && Array.isArray(data.satellites) && typeof data.satellites[0] === "string") {
        data.satellites.forEach((id) => {
          socket.send(JSON.stringify({ type: "SATELLITE-STATUS", satellite_id: id }));
        });
      }
    
      if (onMessage) onMessage(data);
    });
    

    socket.addEventListener("close", () => {
      console.log("🔌 Desconectado");
      isAuthenticated.current = false;
    });

    return () => {
      socket.close();
    };
  }, []);

  const sendCommand = (commandType, payload = {}) => {
    const message = { type: commandType, ...payload };

    if (
      socketRef.current?.readyState === WebSocket.OPEN &&
      isAuthenticated.current
    ) {
      socketRef.current.send(JSON.stringify(message)); // ✅ Enviar directamente
      console.log("📤 Enviado:", message);
    } else {
      pendingCommands.current.push(message); // 🕓 Encolar si aún no listo
      console.warn("⚠️ WebSocket no autenticado, comando encolado:", message);
    }
  };

  return { socketRef, sendCommand };
}
