import { Dispatch, SetStateAction, useState, useMemo, useRef, MutableRefObject, useEffect } from "react";
import {Layer} from "ol/layer";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format"
import {Feature, Map, MapBrowserEvent, Overlay} from "ol";
import {Point} from "ol/geom";
import { Circle, Style, Fill, Stroke, RegularShape, Text} from "ol/style";
import { FeatureLike } from "ol/Feature";

type emergencyShelterProperties = {   
    romnr: number,
    plasser: number,
    adresse: string,
}

type emergencyShelterFeature = Feature<Point> & {
    getProperties(): emergencyShelterProperties;
};

const emergencyShelterSource = new VectorSource<emergencyShelterFeature>({
    url: "/Offentlige_tilfluktsrom.geojson",
    format:new GeoJSON(),
});

//A default style that is what you normally see
const defaultShelterStyle = (feature: FeatureLike) => {
    const properties = feature.getProperties() as emergencyShelterProperties
    return new Style({
        image: new Circle ({
            radius: 10 + properties.plasser / 100,
            fill:
                properties.plasser <= 1000
                ? new Fill ({color: "#EF820D"})
                : new Fill({color: "#FFC30B"}),
            stroke: new Stroke ({color: "#7F00FF", width: 2})
        }),
    })
}

//A new style which only is shown when hovered on
const hoverShelterStyle = (feature: FeatureLike) => {
    const properties = feature.getProperties() as emergencyShelterProperties;
    return new Style({
        image: new RegularShape ({
            radius: 10 + properties.plasser / 500,
            fill: new Fill ({color: "#7F00FF"}),
            stroke: new Stroke ({color: "#EF820D"}),
            points: 6,
        }),
        text: new Text ({
            text:
            properties.adresse + ": " + properties.plasser + "plasser: " + "Romnummer: " + properties.romnr,
            font: "bold 16px arial",
            stroke: new Stroke ({color: "#FFFFFF", width: 2}),
            fill: new Fill ({color: "#000000"}),
            offsetY: -10
        }),
    })
}




const emergencyShelterLayer = new VectorLayer ({
    source: emergencyShelterSource,
    style: defaultShelterStyle
});


//Makes a new layer on top of the last layer, also removes it once unchecked
export function emergencyShelterCheckbox({
    map,
    setLayers,
    layers,
}: {
    map: Map;
    setLayers: Dispatch<SetStateAction<Layer[]>>;
    layers: Layer[]
}) {
    const [checked, setChecked] = useState(false);
    const overlay = useMemo (() => new Overlay({}), []);
    const overlayRef = useRef() as MutableRefObject<HTMLDivElement>;

    // Function to handle pointer move over a shelter feature
    let lastHoveredFeature: Feature | undefined;
//When hovering over a point feature, changed the styling to the hover style
//Currently also a bug, where if you have both layers checked, if you are hovering over the civil defense layer, it deletes the regions
const handlePointerMove = (e: MapBrowserEvent<PointerEvent>) => {
    const pixel = map.getEventPixel(e.originalEvent);
    const feature = map.forEachFeatureAtPixel(pixel, (f) => f) as Feature;
    map.getViewport().style.cursor = feature ? 'pointer' : '';
    if (feature) {
        feature.setStyle(hoverShelterStyle(feature));
        overlay.setPosition(e.coordinate);
        lastHoveredFeature = feature;
    } else {
        if (lastHoveredFeature) {
            lastHoveredFeature.setStyle(defaultShelterStyle(lastHoveredFeature));
            lastHoveredFeature = undefined;
        }
        overlay.setPosition(undefined);
    }
};
//Changes it back to default style once you are no longer hovering over a feature
    const handlePointerLeave = () => {
        map.getViewport().style.cursor = '';
        if (lastHoveredFeature) {
            lastHoveredFeature.setStyle(defaultShelterStyle(lastHoveredFeature));
            lastHoveredFeature = undefined;
        }
        overlay.setPosition(undefined);
    };
    

    useEffect(() => {
        overlay.setElement(overlayRef.current);
        map.addOverlay(overlay);
        return () => {
            map.removeOverlay(overlay);
        };
    }, []);

   
useEffect(() => {
    if (checked && !layers.includes(emergencyShelterLayer)) {
        setLayers((old) => [...old, emergencyShelterLayer]);

        const clickListener = (e: MapBrowserEvent<MouseEvent>) => {
            handleClickEmergencyShelter(e);
        };

        const pointerMoveListener = (e: MapBrowserEvent<PointerEvent>) => {
            handlePointerMove(e);
        };

        const pointerLeaveListener = () => {
            handlePointerLeave();
        };

        map.on("click", clickListener);
        map.on("pointermove", pointerMoveListener);
        map.getViewport().addEventListener("pointerleave", pointerLeaveListener);

        return () => {
            map.un("click", clickListener);
            map.un("pointermove", pointerMoveListener);
            map.getViewport().removeEventListener("pointerleave", pointerLeaveListener);
        };
    } else if (!checked && layers.includes(emergencyShelterLayer)){
        map.un("click", handleClickEmergencyShelter);
        map.un("pointermove", handlePointerMove);
        map.getViewport().removeEventListener("pointerleave", handlePointerLeave);
        setLayers((old) => old.filter((a) => a !== emergencyShelterLayer));
    }
}, [checked]);
//If you click on the features, you get the data into the console log
    function handleClickEmergencyShelter(e: MapBrowserEvent<MouseEvent>) {
        map.forEachFeatureAtPixel(e.pixel, function(olFeature){
            var getGeoJSONData = olFeature.getProperties() as emergencyShelterProperties;

            const romnr = getGeoJSONData.romnr;
            const plasser = getGeoJSONData.plasser;
            const adresse = getGeoJSONData.adresse;

            console.log('Rom nummer:' + romnr)
            console.log('Plasser: ' + plasser)
            console.log('Adresse: ' + adresse)
        }, {
            hitTolerance: 5
        });    
    };

    return (
        <div className="emergencyShelterOverlay">
            <label>
                <input type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                />
                {checked ? "Hide" : "Show"} Emergency Shelter Layer
            </label>
            <div ref={overlayRef} className="emergencyShelterOverlayPopup" />
        </div>
    )
}

export default emergencyShelterCheckbox;
