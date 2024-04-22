import { Dispatch, SetStateAction, useState, useMemo, useRef, MutableRefObject, useEffect } from "react";
import { Layer } from "ol/layer";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { GeoJSON } from "ol/format";
import { Feature, Map, MapBrowserEvent, Overlay } from "ol";
import { Point } from "ol/geom";
import { Circle, Style, Fill, Stroke, RegularShape, Text } from "ol/style";
import { FeatureLike } from "ol/Feature";

type emergencyShelterProperties = {
    romnr: number;
    plasser: number;
    adresse: string;
};

type emergencyShelterFeature = Feature<Point> & {
    getProperties(): emergencyShelterProperties;
};

const emergencyShelterSource = new VectorSource<emergencyShelterFeature>({
    url: "/kws2100-publishing-a-map-application-Dantiante/Offentlige_tilfluktsrom.geojson",
    format: new GeoJSON(),
});

const defaultShelterStyle = (feature: FeatureLike) => {
    const properties = (feature.getProperties() as emergencyShelterProperties);
    return new Style({
        image: new Circle({
            radius: 10 + properties.plasser / 100,
            fill: properties.plasser <= 1000 ? new Fill({ color: "#EF820D" }) : new Fill({ color: "#FFC30B" }),
            stroke: new Stroke({ color: "#7F00FF", width: 2 }),
        }),
    });
};

const selectedShelterStyle = (feature: FeatureLike) => {
    const properties = (feature.getProperties() as emergencyShelterProperties);
    return new Style({
        image: new RegularShape({
            radius: 10 + properties.plasser / 500,
            fill: new Fill({ color: "#7F00FF" }),
            stroke: new Stroke({ color: "#EF820D" }),
            points: 6,
        }),
        text: new Text({
            text: `${properties.adresse}: ${properties.plasser} plasser: Romnummer: ${properties.romnr}`,
            font: "bold 16px arial",
            stroke: new Stroke({ color: "#FFFFFF", width: 2 }),
            fill: new Fill({ color: "#000000" }),
            offsetY: -10,
        }),
    });
};

const emergencyShelterLayer = new VectorLayer({
    source: emergencyShelterSource,
    style: defaultShelterStyle,
});

export function useEmergencyShelterCheckbox({
    map,
    setLayers,
    layers,
}: {
    map: Map;
    setLayers: Dispatch<SetStateAction<Layer[]>>;
    layers: Layer[];
}) {
    const [checked, setChecked] = useState(false);
    const [selectedFeature, setSelectedFeature] = useState<Feature | null>(null);
    const overlay = useMemo(() => new Overlay({}), []);
    const overlayRef = useRef() as MutableRefObject<HTMLDivElement>;

    useEffect(() => {
        overlay.setElement(overlayRef.current);
        map.addOverlay(overlay);
        return () => {
            map.removeOverlay(overlay);
        };
    }, [overlay, map]);

    useEffect(() => {
        const handleClickFeature = (e: MapBrowserEvent<MouseEvent>) => {
            const pixel = map.getEventPixel(e.originalEvent);
            const feature = map.forEachFeatureAtPixel(pixel, (f) => f) as Feature;
            if (feature && feature instanceof Feature) {
                if (selectedFeature === feature) {
                    // If the clicked feature is the same as the selected feature, toggle it off
                    setSelectedFeature(null);
                    feature.setStyle(defaultShelterStyle); // Reset the style to default
                } else {
                    setSelectedFeature(feature);
                    feature.setStyle(selectedShelterStyle); // Set the style to selected
                }
            }
        };

        if (checked) {
            map.on("click", handleClickFeature);
        } else {
            map.un("click", handleClickFeature);
        }

        return () => {
            map.un("click", handleClickFeature);
        };
    }, [checked, map, selectedFeature]);

    useEffect(() => {
        if (selectedFeature) {
            const geometry = selectedFeature.getGeometry();
            if (geometry instanceof Point) {
                overlay.setPosition(geometry.getCoordinates());
            }
        } else {
            overlay.setPosition(undefined);
        }
    }, [selectedFeature, overlay]);

    useEffect(() => {
        if (checked && !layers.includes(emergencyShelterLayer)) {
            setLayers((old) => [...old, emergencyShelterLayer]);
        } else if (!checked && layers.includes(emergencyShelterLayer)) {
            setLayers((old) => old.filter((a) => a !== emergencyShelterLayer));
            setSelectedFeature(null);
        }
    }, [checked, layers, emergencyShelterLayer, setLayers]);

    return (
        <div className="emergencyShelterOverlay">
            <label>
                <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => setChecked(e.target.checked)}
                />
                {checked ? "Hide" : "Show"} Emergency Shelter Layer
            </label>
            <div ref={overlayRef} className="emergencyShelterOverlayPopup" />
        </div>
    );
}

export default useEmergencyShelterCheckbox;
