import { HorizonMesh } from "./components/HorizonMesh.tsx";
import { useEffect, useState } from "preact/hooks";
import { Forma } from "forma-embedded-view-sdk/auto";
import { HorizonGraph } from "./components/HorizonGraph.tsx";

export default function App() {
  const [geoLocation, setGeoLocation] = useState<[number, number] | undefined>(undefined);
  const [horizonData, setHorizonData] = useState<
    [{ azimuth: number; horizon: number }] | undefined
  >(undefined);
  const [summerData, setSummerData] = useState<[{ azimuth: number; altitude: number }] | undefined>(
    undefined,
  );
  const [winterData, setWinterData] = useState<[{ azimuth: number; altitude: number }] | undefined>(
    undefined,
  );
  const [elevation, setElevation] = useState(undefined);
  useEffect(() => {
    Forma.project.getGeoLocation().then((geoLocation) => {
      setGeoLocation(geoLocation);
    });
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (!geoLocation) {
        return;
      }
      const res = await fetch(
        `https://cors-anywhere.herokuapp.com/https://re.jrc.ec.europa.eu/api/v5_2/printhorizon?lat=${geoLocation[0]}&lon=${geoLocation[1]}&browser=0&outputformat=json&js=1`,
      );
      const data = await res.json();
      setHorizonData(
        data["outputs"]["horizon_profile"].map((x: any) => {
          return { azimuth: x["A"], horizon: x["H_hor"] };
        }),
      );
      setSummerData(
        data["outputs"]["summer_solstice"].map((x: any) => {
          return { azimuth: x["A_sun(s)"], altitude: x["H_sun(s)"] };
        }),
      );
      setWinterData(
        data["outputs"]["winter_solstice"].map((x: any) => {
          return { azimuth: x["A_sun(w)"], altitude: x["H_sun(w)"] };
        }),
      );
      setElevation(data["inputs"]["location"]["elevation"]);
    };
    fetchData();
  }, [geoLocation]);

  return (
    <div style={{ display: "block", fontSize: "12px" }}>
      <h2>Impact of horizon</h2>
      <span style={{ marginBottom: "12px" }}>
        Inspect if there are hills or mountains outside your map area that block the light.
      </span>
      <p>
        Preview to get a feeling of the horizon on your location. Add the horizon geometry to your
        proposal and run the sun analysis to include the effect of the blocking horizon.
      </p>
      {horizonData && elevation && <HorizonMesh horizonData={horizonData} elevation={elevation} />}
      {horizonData && summerData && winterData && (
        <HorizonGraph horizon={horizonData} summer={summerData} winter={winterData} />
      )}
    </div>
  );
}
