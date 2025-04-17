import { useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import Globe from "globe.gl";
import * as THREE from 'three';

function haversineDistance(pos1, pos2) {
  const R = 6371;
  const toRad = deg => deg * Math.PI / 180;
  const dLat = toRad(pos2.lat - pos1.lat);
  const dLng = toRad(pos2.lng - pos1.lng);
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(toRad(pos1.lat)) * Math.cos(toRad(pos2.lat)) *
            Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

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

const GlobeComponent = forwardRef(function GlobeComponent({
  satellites = [],
  launchsites = [],
  launchArcs = [],
  showCoverage = false,
  failures = [],
  recentLaunches = [],
  issPosition = null,
  onAntennaClick = () => {},
  onSatelliteClick = () => {}
}, ref) {
  const globeContainerRef = useRef();
  const globeInstance = useRef();

  useEffect(() => {
    const globe = Globe()(globeContainerRef.current)
      .globeImageUrl("//unpkg.com/three-globe/example/img/earth-blue-marble.jpg")
      .bumpImageUrl("//unpkg.com/three-globe/example/img/earth-topology.png")
      .backgroundImageUrl("//unpkg.com/three-globe/example/img/night-sky.png")
      .pointOfView({ lat: 20, lng: 0, altitude: 2.5 });

    const globeMaterial = globe.globeMaterial();
    globeMaterial.bumpScale = 10;

    new THREE.TextureLoader().load(
      "//unpkg.com/three-globe/example/img/earth-water.png",
      (texture) => {
        globeMaterial.specularMap = texture;
        globeMaterial.specular = new THREE.Color("grey");
        globeMaterial.shininess = 15;
      }
    );

    const directionalLight = globe.lights().find(l => l.type === "DirectionalLight");
    directionalLight && directionalLight.position.set(1, 1, 1);

    globeInstance.current = globe;
  }, []);

  useImperativeHandle(ref, () => ({
    setSize: (w, h) => {
      globeInstance.current.width(w).height(h);
    }
  }));

  // Antenas fijas
  useEffect(() => {
    const globe = globeInstance.current;
    if (!globe) return;

    const staticPoints = [
      ...DSN_STATIONS.map((station) => ({
        type: "antenna",
        lat: station.lat,
        lng: station.lng,
        size: 0.8,
        color: "white",
        label: station.name,
        raw: station
      }))
    ];

    globe
      .pointsData(staticPoints)
      .pointAltitude("size")
      .pointColor("color")
      .pointLabel("label")
      .onPointClick((point) => {
        if (point.type === "antenna") {
          const antenna = point.raw;

          const nearbySatellites = satellites
            .filter(s => s.position && s.power)
            .map(s => {
              const distance = haversineDistance(s.position, antenna);
              const signal = Math.max(0, 1 - distance / s.power);
              return {
                satellite: s,
                distance: distance.toFixed(2),
                signal: +(signal * 100).toFixed(1),
              };
            })
            .filter(({ signal }) => signal > 0);

          const totalSignal = nearbySatellites.reduce((sum, s) => sum + s.signal, 0).toFixed(1);

          onAntennaClick({
            ...antenna,
            totalSignal,
            nearbySatellites
          });
        } else if (point.type === "satellite") {
          onSatelliteClick(point.raw);
        }
      });
  }, [satellites]);

  // Satélites proyectados sobre la Tierra
  useEffect(() => {
    const globe = globeInstance.current;
    if (!globe) return;

    const staticPoints = globe.pointsData()?.filter(p => p.type !== "satellite") || [];

    const projectedSatellites = satellites
      .filter(s => s.position)
      .map(s => ({
        type: "satellite",
        lat: s.position.lat,
        lng: s.position.long,
        size: 0.4,
        color: satelliteColor(s.type),
        label: `${s.name} (${s.satellite_id})`,
        raw: s
      }));

    globe.pointsData([...staticPoints, ...projectedSatellites]);
  }, [satellites]);

  // Zonas de cobertura como círculos
  // Zonas de cobertura como círculos
useEffect(() => {
  const globe = globeInstance.current;
  if (!globe) return;

  const satellitesWithCoverage = satellites.filter(s => s.position && s.power);

  globe.customLayerData(showCoverage ? satellitesWithCoverage : [])
    .customThreeObject((sat) => {
      const radius = sat.power / 500; // Escala adecuada
      console.log(`🎯 Dibujando cobertura para ${sat.name} (r: ${radius})`);

      const geometry = new THREE.CircleGeometry(radius, 32);
      const material = new THREE.MeshBasicMaterial({
        color: 0x00ffff,
        transparent: true,
        opacity: 0.3,
        side: THREE.DoubleSide,
        depthWrite: false,
        depthTest: false
      });

      const mesh = new THREE.Mesh(geometry, material);
      mesh.rotateX(Math.PI / 2); // Para que quede plano sobre la tierra
      return mesh;
    })
    .customThreeObjectUpdate((obj, sat) => {
      obj.position.setFromSphericalCoords(
        6371, // Superficie del globo
        THREE.MathUtils.degToRad(90 - sat.position.lat),
        THREE.MathUtils.degToRad(sat.position.long)
      );
    });
}, [satellites, showCoverage]);


  return <div ref={globeContainerRef} style={{ width: "100%", height: "100%" }} />;
});

export default GlobeComponent;
