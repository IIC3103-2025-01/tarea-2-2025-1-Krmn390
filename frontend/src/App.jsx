import { useReducer } from "react";
import useSocket from "./hooks/useSocket";
import { socketReducer, initialState } from "./reducers/socketReducer";
import { extractPayload } from "./utils/extractPayload";

function App() {
  const [state, dispatch] = useReducer(socketReducer, initialState);

  useSocket((data) => {
    dispatch({ type: data.type, payload: extractPayload(data) });
  });

  return (
    <div>
      <h1>Satélites: {state.satellites.length}</h1>
      <h2>Mensajes: {state.messages.length}</h2>
      {/* Agrega componentes visuales aquí */}
    </div>
  );
}

export default App;
