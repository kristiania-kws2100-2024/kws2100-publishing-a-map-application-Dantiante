import './App.css';
import "ol/ol.css";
import {Map, View} from "ol/"
import { MutableRefObject, useEffect, useRef, useState } from 'react';
import TileLayer from 'ol/layer/Tile';
import {OSM} from "ol/source"
import { useGeographic } from 'ol/proj';
import { useCivilDefenseLayerCheckbox } from './Modules/civilDefense';
import { Layer } from 'ol/layer';
import emergencyShelterCheckbox from './Modules/emergencyShelter';



// I have tried making it work so that it start on Oslo, but I get an error when I use run npm lint, it tells me to put
// useGeographic() at the top of the function, and I have no idea why if I put the view in there, then the checkboxes do not work
// So I decided to just let it stay at middle of the world
const view = new View ({
  center: [0, 0],
  zoom:8
})

const map = new Map({
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: view
});


export function App() {

  useGeographic();




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
        {useCivilDefenseLayerCheckbox({ map, setLayers, layers})}
        {emergencyShelterCheckbox({map, setLayers, layers})}
    </nav>
    <main className='map' ref={mapRef}></main>
 

  </>
  );

}

export default App