import { useEffect, useState } from "react";

export default function useISS() {
  const [issPosition, setIssPosition] = useState(null);

  useEffect(() => {
    const fetchPosition = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_NASA_URL);
        const data = await res.json();
        const { latitude, longitude } = data;
        setIssPosition({ lat: parseFloat(latitude), lng: parseFloat(longitude) });
      } catch (err) {
        console.error("❌ Error obteniendo posición de la ISS", err);
      }
    };

    fetchPosition();
    const interval = setInterval(fetchPosition, 5000);
    return () => clearInterval(interval);
  }, []);

  return issPosition;
}
