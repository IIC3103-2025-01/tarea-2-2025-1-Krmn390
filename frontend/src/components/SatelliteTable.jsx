import { useState } from "react";

function SatelliteTable({ satellites }) {
  const [filterCountry, setFilterCountry] = useState("");
  const [filterMission, setFilterMission] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const filteredSatellites = satellites
    .filter((s) =>
      filterCountry ? s.organization.country.name.toLowerCase().includes(filterCountry.toLowerCase()) : true
    )
    .filter((s) =>
      filterMission ? s.mission.toLowerCase().includes(filterMission.toLowerCase()) : true
    )
    .sort((a, b) => sortDesc ? b.altitude - a.altitude : a.altitude - b.altitude);

  return (
    <div style={{ padding: "1rem", marginTop: "2rem", border: "1px solid #ccc" }}>
      <h2>📋 Tabla de Satélites</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="Filtrar por país"
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          style={{ marginRight: "1rem" }}
        />
        <input
          placeholder="Filtrar por misión"
          value={filterMission}
          onChange={(e) => setFilterMission(e.target.value)}
          style={{ marginRight: "1rem" }}
        />
        <button onClick={() => setSortDesc(!sortDesc)}>
          Ordenar por altitud: {sortDesc ? "↓" : "↑"}
        </button>
      </div>

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Misión</th>
            <th>Tipo</th>
            <th>Potencia</th>
            <th>Altitud</th>
            <th>Vida útil</th>
            <th>Fecha lanzamiento</th>
            <th>Organización</th>
            <th>País</th>
            <th>Bandera</th>
          </tr>
        </thead>
        <tbody>
          {filteredSatellites.map((s) => (
            <tr key={s.satellite_id}>
              <td>{s.satellite_id}</td>
              <td>{s.name}</td>
              <td>{s.mission}</td>
              <td>{s.type}</td>
              <td>{s.power}</td>
              <td>{s.altitude}</td>
              <td>{s.lifespan}</td>
              <td>{new Date(s.launch_date).toLocaleDateString()}</td>
              <td>{s.organization.name}</td>
              <td>{s.organization.country.name}</td>
              <td>
                <img
                  src={`https://flagcdn.com/w40/${s.organization.country.country_code.toLowerCase()}.png`}
                  alt="Bandera"
                  style={{ height: 20 }}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SatelliteTable;
