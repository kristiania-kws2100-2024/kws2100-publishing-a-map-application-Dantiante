import { Dispatch, SetStateAction, useState, useMemo, useRef, MutableRefObject, useEffect } from "react";
import {Layer} from "ol/layer";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import {GeoJSON} from "ol/format"
import {Feature, Map, MapBrowserEvent, Overlay} from "ol"
import {Polygon} from "ol/geom"
import { RegularShape, Stroke, Style, Fill } from "ol/style";
import React from "react";

type civilDefenseProperties = {
        navn: string,
};

type civilDefenseFeature = Feature<Polygon> & {
    getProperties(): civilDefenseProperties;
};

const civilDefenseSource = new VectorSource<civilDefenseFeature>({
    url: "/Sivilforsvarsdistrikter.geojson",
    format: new GeoJSON(),
});

//Create a new style
const polygonStyle = (): Style => {
    return new Style({
      image: new RegularShape({
        points: 1,
      }),
      fill: new Fill({
        color: '#F8E47340',
      }),
      stroke: new Stroke({
        color: '#7F00FF',
        width: 2
      }),
    });
  };

const civilDefenseLayer = new VectorLayer ({
    source: civilDefenseSource,
    //Use the new style
    style: polygonStyle()
});


//Creates a new layer when checked which shows the different civil defense lines, also removes the layer once it is unchecked instead of making it hidden.
export function useCivilDefenseLayerCheckbox({
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

    useEffect(() => {
        overlay.setElement(overlayRef.current);
        map.addOverlay(overlay);
        return () => {
            map.removeOverlay(overlay);
        };
    }, []);
    const [,setSelectedCivilDefense] = useState<
    civilDefenseFeature | undefined
    >();

    function handleClick(e: MapBrowserEvent<MouseEvent>) {
        const clickedCivilDefense = civilDefenseSource.getFeaturesAtCoordinate(
            e.coordinate,
        ) as civilDefenseFeature[];
        if (clickedCivilDefense.length === 1) {
            setSelectedCivilDefense(clickedCivilDefense[0]);
            overlay.setPosition(e.coordinate);

            console.log(e. coordinate)
            console.log(clickedCivilDefense[0].getProperties().navn)
        } else {
            setSelectedCivilDefense(undefined);
            overlay.setPosition(undefined);
        }
    }

    useEffect(() => {
        if (checked && !layers.includes(civilDefenseLayer)) {
            setLayers((old) => [...old, civilDefenseLayer]);
            map.on("click", handleClick);
        } else if (!checked && layers.includes(civilDefenseLayer)){
            map.un("click", handleClick);
            setLayers((old) => old.filter((a) => a !== civilDefenseLayer));
        }
    }, [checked]);

    return (
        <div>
            <label>
                <input type="checkbox"
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                />
                {checked ? "Hide" : "Show"} Civil Defense Layer
            </label>
        </div>
    );
}

export default useCivilDefenseLayerCheckbox
