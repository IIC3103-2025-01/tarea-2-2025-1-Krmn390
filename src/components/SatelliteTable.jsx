import { useState } from "react";

function SatelliteTable({ satellites }) {
  const [filterCountry, setFilterCountry] = useState("");
  const [filterMission, setFilterMission] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const validSatellites = satellites.filter(s => s.organization && s.organization.country);

  const filteredSatellites = validSatellites
    .filter((s) =>
      filterCountry ? s.organization.country.name.toLowerCase().includes(filterCountry.toLowerCase()) : true
    )
    .filter((s) =>
      filterMission ? s.mission.toLowerCase().includes(filterMission.toLowerCase()) : true
    )
    .sort((a, b) => sortDesc ? b.altitude - a.altitude : a.altitude - b.altitude);

  return (
    <div style={{ padding: "1rem", marginTop: "2rem", border: "1px solid #ccc", height: 250,
      overflowY: "scroll" }}>
      <h2>📋 Tabla de Satélites</h2>

      <div style={{ marginBottom: "1rem"}}>
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

      <table
  style={{
    width: "100%",
    borderCollapse: "separate",
    borderSpacing: "0 0.5rem"  // espacio vertical entre filas
  }}
>

      <thead>
  <tr>
    {["ID", "Nombre", "Misión", "Tipo", "Potencia", "Altitud", "Vida útil", "Fecha lanzamiento", "Organización", "País", "Bandera"].map((header, i) => (
      <th key={i} style={{ padding: "0.5rem", textAlign: "left", whiteSpace: "nowrap" }}>{header}</th>
    ))}
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
              <td>{s.organization?.name || "Sin datos"}</td>
              <td>{s.organization?.country?.name || "N/A"}</td>
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
