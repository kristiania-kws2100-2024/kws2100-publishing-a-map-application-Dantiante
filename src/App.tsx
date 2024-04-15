import './App.css';
import { MutableRefObject, useEffect, useRef, useState } from "react";
import { Map, View } from "ol/";
import { Layer } from "ol/layer";
import TileLayer from "ol/layer/Tile";
import { OSM } from "ol/source";
import { useGeographic } from "ol/proj";
import { useEmergencyShelterCheckbox } from "./Modules/emergencyShelter";
import { useCivilDefenseLayerCheckbox } from "./Modules/civilDefense";

useGeographic();

const view = new View({
  center: [5.348, 60.386],
  zoom: 12,
});

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM(),
    }),
  ],
  view: view,
});

export function App() {
  useGeographic();

  const [layers, setLayers] = useState<Layer[]>([
    new TileLayer({ source: new OSM() }),
  ]);

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;

  useEffect(() => {
    map.setTarget(mapRef.current);
  }, []);

  useEffect(() => {
    map.setLayers(layers);
  }, [layers]);

  return (
    <>
      <header>
        <h1 className="header">Map application</h1>
      </header>

      <nav className="navBar">
        Actions:
        {useCivilDefenseLayerCheckbox({ map, setLayers, layers })}
        {useEmergencyShelterCheckbox({ map, setLayers, layers })}
      </nav>

      <main className="map" ref={mapRef}></main>
    </>
  );
}

export default App;