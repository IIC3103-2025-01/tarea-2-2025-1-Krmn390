export const initialState = {
    satellites: [],
    messages: [],
    launchArcs: [],
    launchsites: [],
    requests: [],
    failures: [],
  };
  
  export function socketReducer(state, action) {
    switch (action.type) {
      case "SATELLITES":
        return { ...state, satellites: action.payload };
      case "COMM":
        return { ...state, messages: [...state.messages, action.payload] };
      case "LAUNCH":
        return { ...state, launchArcs: [...state.launchArcs, action.payload] };
      case "IN-ORBIT":
        return {
          ...state,
          satellites: state.satellites.map((s) =>
            s.satellite_id === action.payload.satellite_id
              ? { ...s, status: "in-orbit", altitude: action.payload.altitude }
              : s
          ),
        };
      case "CATASTROPHIC-FAILURE":
        return {
          ...state,
          failures: [...state.failures, action.payload.satellite_id],
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
        return {
          ...state,
          satellites: state.satellites.map((s) =>
            s.satellite_id === action.payload.satellite.satellite_id
              ? action.payload.satellite
              : s
          ),
        };
      default:
        return state;
    }
  }
  