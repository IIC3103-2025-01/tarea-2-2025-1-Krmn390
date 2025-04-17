export function extractPayload(event) {
    switch (event.type) {
      case "POSITION_UPDATE":
        console.log("✈️ POSITION_UPDATE recibido:", event.satellites);
        return event.satellites;
      case "SATELLITES":
        console.log("✅ SATELLITES completo recibido:", event.satellites);
        return event.satellites;
      case "COMM":
        return event.message;
      case "LAUNCH":
        return {
          satellite_id: event.satellite_id,
          launchsite_id: event.launchsite_id,
          debris_site: event.debris_site,
        };
      case "IN-ORBIT":
        return {
          satellite_id: event.satellite_id,
          altitude: event.altitude,
        };
      case "CATASTROPHIC-FAILURE":
      case "DEORBITING":
        return { satellite_id: event.satellite_id };
      case "POWER-UP":
      case "POWER-DOWN":
        return {
          satellite_id: event.satellite_id,
          amount: event.amount,
        };
      case "LAUNCHSITES":
        return event.launchsites;
      case "REQUEST":
        return event.message;
      case "SATELLITE-STATUS":
        return { satellite: event.satellite };
      default:
        return event;
    }
  }
  