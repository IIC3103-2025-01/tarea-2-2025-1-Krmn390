import { useState } from "react";

function SatelliteTable({ satellites }) {
  const [filterCountry, setFilterCountry] = useState("");
  const [filterMission, setFilterMission] = useState("");
  const [sortDesc, setSortDesc] = useState(true);

  const validSatellites = satellites.filter((s) => s.satellite_id);

  const filteredSatellites = validSatellites
    .filter((s) =>
      filterCountry
        ? (s.organization?.country?.name || "")
            .toLowerCase()
            .includes(filterCountry.toLowerCase())
        : true
    )
    .filter((s) =>
      filterMission
        ? s.mission?.toLowerCase().includes(filterMission.toLowerCase())
        : true
    )
    .sort((a, b) => (sortDesc ? b.altitude - a.altitude : a.altitude - b.altitude));

  return (
    <div
      style={{
        padding: "1rem",
        marginTop: "0rem",
        border: "1px solid #444",
        borderRadius: "8px",
        backgroundColor: "#1c1c1c",
        color: "#fff",
        height: 300,
        overflowY: "scroll",
      }}
    >
      <h2 style={{ marginBottom: "1rem" }}>🛰️ Satélites en órbita</h2>

      <div style={{ marginBottom: "1rem" }}>
        <input
          placeholder="Filtrar por país"
          value={filterCountry}
          onChange={(e) => setFilterCountry(e.target.value)}
          style={{ marginRight: "1rem", backgroundColor: "#333", color: "#fff", border: "1px solid #666", padding: "0.4rem" }}
        />
        <input
          placeholder="Filtrar por misión"
          value={filterMission}
          onChange={(e) => setFilterMission(e.target.value)}
          style={{ marginRight: "1rem", backgroundColor: "#333", color: "#fff", border: "1px solid #666", padding: "0.4rem" }}
        />
        <button
          onClick={() => setSortDesc(!sortDesc)}
          style={{
            padding: "0.4rem 0.6rem",
            backgroundColor: "#444",
            color: "#fff",
            border: "1px solid #666",
            cursor: "pointer",
          }}
        >
          Ordenar por altitud: {sortDesc ? "↓" : "↑"}
        </button>
      </div>

      <table
        style={{
          width: "100%",
          borderCollapse: "separate",
          borderSpacing: "0 0.5rem",
        }}
      >
        <thead>
          <tr>
            {["ID", "Nombre", "Misión", "Tipo", "Potencia", "Altitud", "Vida útil", "Fecha lanzamiento", "Organización", "País", "Estado"].map(
              (header, i) => (
                <th
                  key={i}
                  style={{
                    padding: "0.5rem",
                    textAlign: "left",
                    whiteSpace: "nowrap",
                    borderBottom: "1px solid #555",
                  }}
                >
                  {header}
                </th>
              )
            )}
          </tr>
        </thead>

        <tbody>
          {filteredSatellites.map((s) => (
            <tr
              key={s.satellite_id}
              style={{
                backgroundColor: s.status === "lost" ? "#3a1a1a" : "#292929",
                borderLeft: s.status === "lost" ? "4px solid #ff4d4d" : "none",
              }}
            >
              <td style={{ padding: "0.5rem" }}>{s.satellite_id}</td>
              <td style={{ padding: "0.5rem" }}>{s.name}</td>
              <td style={{ padding: "0.5rem" }}>{s.mission}</td>
              <td style={{ padding: "0.5rem", fontWeight: "bold", color: s.type === "SPY" ? "red" : "#ccc" }}>{s.type}</td>
              <td style={{ padding: "0.5rem" }}>{s.power}</td>
              <td style={{ padding: "0.5rem" }}>{Math.round(s.altitude)}</td>
              <td style={{ padding: "0.5rem" }}>{s.lifespan}</td>
              <td style={{ padding: "0.5rem" }}>
                {new Date(s.launch_date).toLocaleDateString()}
              </td>
              <td style={{ padding: "0.5rem" }}>{s.organization?.name}</td>
              <td style={{ padding: "0.5rem", alignItems: "center"}}>
                {s.organization?.country?.country_code && (
                  <img
                    src={`https://flagcdn.com/w40/${s.organization.country.country_code.toLowerCase()}.png`}
                    alt={s.organization.country.name}
                    title={s.organization.country.name}
                    style={{ width: "24px", height: "16px", objectFit: "cover", border: "1px solid #ccc" }}
                  />
                )}
              </td>
              <td style={{ padding: "0.5rem" }}>
                {s.status === "lost" ? (
                  <span title={`Destruido el ${new Date(s.destroyed_at * 1000).toLocaleString()}`}>
                    Perdido
                  </span>
                ) : (
                  "Activo"
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SatelliteTable;
