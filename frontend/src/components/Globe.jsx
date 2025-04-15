import { useEffect, useRef } from "react";
import Globe from "globe.gl";
import * as THREE from "three";

const DSN_STATIONS = [
  { name: "Goldstone DSN", lat: 35.4267, lng: -116.89 },
  { name: "Madrid DSN", lat: 40.4314, lng: -4.2481 },
  { name: "Canberra DSN", lat: -35.4014, lng: 148.9817 }
];

const satelliteColor = (type) => {
  switch (type) {
    case "COM": return "dodgerblue";
    case "SCI": return "green";
    case "NAV": return "orange";
    case "SPY": return "crimson";
    default: return "gray";
  }
};

export default function GlobeComponent({
    satellites = [],
    launchsites = [],
    launchArcs = [],
    showCoverage = false,
    failures = [],
    recentLaunches = [],
    issPosition = null,
    onAntennaClick = () => {},
    onSatelliteClick = () => {}
  }) {
    const globeRef = useRef();
  
    const DSN_STATIONS = [
      { name: "Goldstone DSN", lat: 35.4267, lng: -116.89 },
      { name: "Madrid DSN", lat: 40.4314, lng: -4.2481 },
      { name: "Canberra DSN", lat: -35.4014, lng: 148.9817 }
    ];
  
    useEffect(() => {
      const globe = Globe()(globeRef.current)
        .globeImageUrl("//unpkg.com/three-globe/example/img/earth-night.jpg")
        .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
        .pointOfView({ lat: 20, lng: 0, altitude: 2.5 })
        .pointsData([
          ...satellites.map((s) => ({
            type: "satellite",
            lat: s.position?.lat,
            lng: s.position?.long,
            size: 0.4,
            color: satelliteColor(s.type),
            label: `${s.name} (${s.satellite_id})`,
            raw: s
          })),
          ...DSN_STATIONS.map((station) => ({
            type: "antenna",
            lat: station.lat,
            lng: station.lng,
            size: 0.8,
            color: "white",
            label: station.name,
            raw: station
          })),
          ...launchsites.map((site) => ({
            type: "launchsite",
            lat: site.location.lat,
            lng: site.location.long,
            size: 0.6,
            color: "yellow",
            label: site.name
          })),
          ...failures
            .filter((f) => Date.now() - f.timestamp < 20000) // mostrar por 20 segundos
            .map((f) => ({
                lat: f.position?.lat,
                lng: f.position?.long,
                size: 1,
                color: "red",
                label: `💥 Satélite destruido: ${f.satellite_id}`
            })),
            ...recentLaunches
                .filter((l) => Date.now() - l.timestamp < 10000) // mostrar 10 segundos
                .map((l) => {
                    const site = launchsites.find((s) => s.station_id === l.launchsite_id);
                    if (!site) return null;
                    return {
                    lat: site.location.lat,
                    lng: site.location.long,
                    size: 1,
                    color: "cyan",
                    label: `🚀 Lanzamiento desde ${site.name}`
                    };
                })
                .filter(Boolean),
            ...(issPosition
                    ? [{
                        lat: issPosition.lat,
                        lng: issPosition.lng,
                        size: 1.2,
                        color: "magenta",
                        label: "🛰️ Estación Espacial Internacional (ISS)"
                      }]
                    : [])
        ])
        .pointAltitude("size")
        .pointColor("color")
        .pointLabel("label")
        .onPointClick((point) => {
            if (point.type === "antenna") {
              onAntennaClick(point.raw);
            } else if (point.type === "satellite") {
              onSatelliteClick(point.raw);
            }
          })          
        .arcsData(
            launchArcs
              .map((arc) => {
                const launchsite = launchsites.find((s) => s.station_id === arc.launchsite_id);
                if (!launchsite) return null;
                return {
                  startLat: launchsite.location.lat,
                  startLng: launchsite.location.long,
                  endLat: arc.debris_site.lat,
                  endLng: arc.debris_site.long,
                  satellite_id: arc.satellite_id
                };
              })
              .filter(Boolean)
          )
          .arcColor(() => ["#ffcc00", "#ff0000"])
          .arcStroke(0.8)
          .arcAltitude(0.2)
          .arcDashLength(0.4)
          .arcDashGap(2)
          .arcDashInitialGap(() => Math.random() * 5)
          .arcDashAnimateTime(4000)
    
          // 👇 Esto se agrega sin reemplazar lo anterior
          .onPointClick((point) => {
            if (point.type === "antenna") {
              onAntennaClick(point.raw);
            }
          })
        }, [satellites, launchsites, launchArcs, showCoverage]);

        return <div ref={globeRef} style={{ width: "100%", height: "600px" }} />;
      } 
