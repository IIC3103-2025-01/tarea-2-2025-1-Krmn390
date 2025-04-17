import { useReducer, useState } from "react";
import { useEffect, useRef} from "react";
import useSocket from "./hooks/useSocket";
import useISS from "./hooks/useISS";
import { socketReducer, initialState } from "./reducers/socketReducer";
import { extractPayload } from "./utils/extractPayload";
import Chat from "./components/Chat"; 
import GlobeComponent from "./components/Globe";
import SatelliteTable from "./components/SatelliteTable";
import "./App.css"; // Import your CSS file



function App() {
  // funciones y constantes 
    const [state, dispatch] = useReducer(socketReducer, initialState);
    const [showCoverage, setShowCoverage] = useState(false);
    const [selectedAntenna, setSelectedAntenna] = useState(null);
    const [selectedSatellite, setSelectedSatellite] = useState(null);
    
    const { sendCommand } = useSocket((data) => {
      dispatch({ type: data.type, payload: extractPayload(data) });
    });

    useEffect(() => {
      sendCommand("SATELLITES", {});  // ✅ Correcto
      sendCommand("LAUNCHSITES", {}); // ✅ Correcto
    }, []);
    

    console.log("🛰️ Satélites en estado:", state.satellites);


    const handleSendMessage = (text) => {
      sendCommand("COMM", { message: text });
    };

    const handleAntennaClick = (antenna) => {
      setSelectedAntenna(antenna);
    };

    const getSatellitesInRange = () => {
      if (!selectedAntenna) return [];

      return state.satellites
        .map((s) => {
          const distance = getDistance(
            selectedAntenna.lat,
            selectedAntenna.lng,
            s.position?.lat,
            s.position?.long
          );
          const signal = Math.max(0, 1 - distance / s.power);
          return signal > 0
            ? { satellite: s, distance: distance.toFixed(2), signal: (signal * 100).toFixed(1) }
            : null;
        })
        .filter(Boolean);
    };

    const getDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371; // km
      const dLat = toRad(lat2 - lat1);
      const dLon = toRad(lon2 - lon1);
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };

    const toRad = (value) => (value * Math.PI) / 180;

    const satellitesInRange = getSatellitesInRange();

    const handleSatelliteClick = (sat) => {
      setSelectedSatellite(sat);
    };
    
    const issPosition = useISS();

    const globeRef = useRef();

    useEffect(() => {
      const handleResize = () => {
        const container = document.querySelector(".globe-container");
        if (container && globeRef.current?.setSize) {
          globeRef.current.setSize(container.offsetWidth, container.offsetHeight);
        }
      };
      window.addEventListener("resize", handleResize);
      handleResize(); // Inicial
      return () => window.removeEventListener("resize", handleResize);
    }, []);
  
  return (
    <div className = "app-container">
      <div className = "globe-section">
        <div className = "globe-container">
          <GlobeComponent
            satellites={state.satellites}
            launchsites={state.launchsites}
            launchArcs={state.launchArcs}
            failures={state.failures}
            recentLaunches={state.recentLaunches}
            showCoverage={showCoverage}
            onAntennaClick={handleAntennaClick}
            onSatelliteClick={handleSatelliteClick}
            issPosition={issPosition}
            ref={globeRef}

          />
        </div>
        <div className="globe-buttons">
            <button onClick={() => setShowCoverage(!showCoverage)}>
              {showCoverage ? "Ocultar" : "Mostrar"} Zonas de Cobertura
            </button>
            <button onClick={() => setSelectedSatellite(null)}>Cerrar</button>
        </div>
      </div>

      <div className = "info-section">
        <div className="info-panel">
          <SatelliteTable satellites={state.satellites} />
        </div>
        <div className="chat-panel">
          <Chat messages={state.messages} onSend={handleSendMessage} />

        </div>
      </div>

      {selectedSatellite && (
          <div style={{ margin: "1rem 0", padding: "1rem", border: "1px solid #ccc" }}>
            <h3>🛰️ Satélite seleccionado: {selectedSatellite.name}</h3>
            <p><strong>ID:</strong> {selectedSatellite.satellite_id}</p>
            <p><strong>Misión:</strong> {selectedSatellite.mission}</p>
            <p><strong>Tipo:</strong> {selectedSatellite.type}</p>
            <p><strong>Potencia:</strong> {selectedSatellite.power}</p>
            <p><strong>Vida útil:</strong> {selectedSatellite.lifespan} días</p>
            <p><strong>Fecha de lanzamiento:</strong> {new Date(selectedSatellite.launch_date).toLocaleDateString()}</p>
            <p><strong>Organización:</strong> {selectedSatellite.organization.name}</p>
            <p><strong>País:</strong> {selectedSatellite.organization.country.name}</p>
            <img
              src={`https://flagcdn.com/w80/${selectedSatellite.organization.country.country_code.toLowerCase()}.png`}
              alt="Bandera"
              style={{ height: 30, marginTop: 10 }}
            />
          </div>
        )}
        
        {selectedAntenna && (
          <div style={{ margin: "1rem 0", padding: "1rem", border: "1px solid #ccc" }}>
            <h3>📡 Antena seleccionada: {selectedAntenna.name}</h3>
            <p>Lat: {selectedAntenna.lat} | Lng: {selectedAntenna.lng}</p>
            <h4>🛰️ Satélites en cobertura:</h4>
            {satellitesInRange.length > 0 ? (
              <ul>
                {satellitesInRange.map((entry, idx) => (
                  <li key={idx}>
                    {entry.satellite.name} – Distancia: {entry.distance} km – Señal: {entry.signal}%
                  </li>
                ))}
              </ul>
            ) : (
              <p>No hay satélites en cobertura.</p>
            )}
          </div>
        )}
        
      
    </div>
  );
}




export default App;