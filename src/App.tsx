import './App.css';
import "ol/ol.css";
import {Map, View} from "ol/"
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import TileLayer from 'ol/layer/Tile';
import {OSM} from "ol/source"
import { useGeographic } from 'ol/proj';
import { civilDefenseLayerCheckbox } from './Modules/civilDefense';
import { Layer } from 'ol/layer';
import emergencyShelterCheckbox from './Modules/emergencyShelter';


useGeographic();

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [10, 59], zoom: 8
  })
});

export function App() {


  const [layers, setLayers] = useState<Layer[]>([
    new TileLayer({ source: new OSM}),
  ]);
  

  const mapRef = useRef() as MutableRefObject<HTMLDivElement>;
  useEffect(() => {map.setTarget(mapRef.current);}, []);
  useEffect(() => map.setLayers(layers), [layers]);
  
  
  return (
    <>


    <header><h1 className='header'>Map application</h1></header>
    
    <nav className='navBar'>Actions:
        {civilDefenseLayerCheckbox({ map, setLayers, layers})}
        {emergencyShelterCheckbox({map, setLayers, layers})}
    </nav>
    <main className='map' ref={mapRef}></main>
 

  </>
  );

}

export default App