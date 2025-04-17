// socketReducer.js ✅

export const initialState = {
  satellites: [],
  messages: [],
  launchArcs: [],
  launchsites: [],
  requests: [],
  failures: [],
  recentLaunches: [],
};

export function socketReducer(state, action) {
  switch (action.type) {
    case "POSITION_UPDATE":
      return {
        ...state,
        satellites: state.satellites.map((sat) => {
          const update = action.payload.find((s) => s.satellite_id === sat.satellite_id);
          return update
            ? {
                ...sat,
                position: update.position,
                altitude: update.altitude,
              }
            : sat;
        }),
      };

    case "SATELLITES":
      return { ...state, satellites: action.payload };

      case "COMM":
        if (!action.payload || !action.payload.trim()) return state;
        return {
          ...state,
          messages: [
            ...state.messages,
            {
              station_id: "¿?",
              content: action.payload,
              level: "info",
              date: new Date().toISOString()
            }
          ]
        };
      

    case "LAUNCH":
      return {
        ...state,
        launchArcs: [...state.launchArcs, action.payload],
        recentLaunches: [
          ...state.recentLaunches,
          {
            launchsite_id: action.payload.launchsite_id,
            timestamp: Date.now(),
          },
        ],
      };

    case "IN-ORBIT":
      return {
        ...state,
        satellites: state.satellites.map((s) =>
          s.satellite_id === action.payload.satellite_id
            ? { ...s, status: "in-orbit", altitude: action.payload.altitude }
            : s
        ),
        launchArcs: state.launchArcs.filter(
          (arc) => arc.satellite_id !== action.payload.satellite_id
        ),
      };

    case "CATASTROPHIC-FAILURE":
      const failedSat = state.satellites.find(
        (s) => s.satellite_id === action.payload.satellite_id
      );
      return {
        ...state,
        failures: [
          ...state.failures,
          {
            satellite_id: action.payload.satellite_id,
            position: failedSat?.position,
            timestamp: Date.now(),
          },
        ],
        satellites: state.satellites.filter(
          (s) => s.satellite_id !== action.payload.satellite_id
        ),
      };

    case "DEORBITING":
      return {
        ...state,
        satellites: state.satellites.filter(
          (s) => s.satellite_id !== action.payload.satellite_id
        ),
      };

    case "POWER-UP":
    case "POWER-DOWN":
      return {
        ...state,
        satellites: state.satellites.map((s) =>
          s.satellite_id === action.payload.satellite_id
            ? {
                ...s,
                power:
                  action.type === "POWER-UP"
                    ? s.power + action.payload.amount
                    : s.power - action.payload.amount,
              }
            : s
        ),
      };

    case "LAUNCHSITES":
      return { ...state, launchsites: action.payload };

    case "REQUEST":
      return { ...state, requests: [...state.requests, action.payload] };

    case "SATELLITE-STATUS":
      const sat = action.payload.satellite;
      const alreadyExists = state.satellites.find(s => s.satellite_id === sat.satellite_id);
      return {
        ...state,
        satellites: alreadyExists
          ? state.satellites.map((s) =>
              s.satellite_id === sat.satellite_id ? sat : s
            )
          : [...state.satellites, sat],
      };

    default:
      return state;
  }
}
