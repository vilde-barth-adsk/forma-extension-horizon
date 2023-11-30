import { useEffect, useState } from "preact/hooks";
import { Forma } from "forma-embedded-view-sdk/auto";
import { addElement } from "../AddElement.ts";

// split a triangle into 2 triangles
function splitTriangles(triangles: Float32Array) {
  const newTriangles = new Float32Array(triangles.length * 4);
  for (let i = 0; i < triangles.length / 9; i++) {
    const [x1, y1, z1, x2, y2, z2, x3, y3, z3] = triangles.slice(i * 9, i * 9 + 9);
    const x4 = (x1 + x2) / 2;
    const y4 = (y1 + y2) / 2;
    const z4 = (z1 + z2) / 2;
    const x5 = (x2 + x3) / 2;
    const y5 = (y2 + y3) / 2;
    const z5 = (z2 + z3) / 2;
    const x6 = (x3 + x1) / 2;
    const y6 = (y3 + y1) / 2;
    const z6 = (z3 + z1) / 2;
    newTriangles.set(
      [
        x1,
        y1,
        z1,
        x4,
        y4,
        z4,
        x6,
        y6,
        z6,
        x4,
        y4,
        z4,
        x2,
        y2,
        z2,
        x5,
        y5,
        z5,
        x6,
        y6,
        z6,
        x5,
        y5,
        z5,
        x3,
        y3,
        z3,
        x4,
        y4,
        z4,
        x5,
        y5,
        z5,
        x6,
        y6,
        z6,
      ],
      i * 36,
    );
  }
  return newTriangles;
}

export function Horizon() {
  const [geoLocation, setGeoLocation] = useState<[number, number] | undefined>(undefined);
  const [horizonData, setHorizonData] = useState<
    [{ azimuth: number; horizon: number }] | undefined
  >(undefined);
  const [elevation, setElevation] = useState(undefined);
  const [mesh, setMesh] = useState<Float32Array | undefined>(undefined);

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
      setElevation(data["inputs"]["location"]["elevation"]);
    };
    fetchData();
  }, [geoLocation]);

  /*const drawHorizon = () => {
    const canvas = document.getElementById("horizonGraph");
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(0, horizonData[0]["horizon"]);
      for (let i = 0; i < horizonData.length; i++) {
        ctx.lineTo(i * 5, horizonData[i]["horizon"]);
      }
      ctx.stroke();
    }
  };*/

  useEffect(() => {
    if (horizonData && elevation) {
      const startZ = elevation - 100;
      const position = new Float32Array((horizonData.length - 1) * 6 * 3);
      const rad = 3000;
      for (let i = 0; i < horizonData.length - 1; i++) {
        const angle1 = horizonData[i]["azimuth"] + 180;
        const angle2 = horizonData[i + 1]["azimuth"] + 180;
        const x1 = rad * Math.sin((Math.PI * angle1) / 180);
        const y1 = rad * Math.cos((Math.PI * angle1) / 180);
        const z1 = elevation + rad * Math.tan((Math.PI * horizonData[i]["horizon"]) / 180);
        const x2 = rad * Math.sin((Math.PI * angle2) / 180);
        const y2 = rad * Math.cos((Math.PI * angle2) / 180);
        const z2 = elevation + rad * Math.tan((Math.PI * horizonData[i + 1]["horizon"]) / 180);
        position[18 * i] = x1;
        position[18 * i + 1] = y1;
        position[18 * i + 2] = startZ;
        position[18 * i + 3] = x2;
        position[18 * i + 4] = y2;
        position[18 * i + 5] = startZ;
        position[18 * i + 6] = x1;
        position[18 * i + 7] = y1;
        position[18 * i + 8] = z1;

        position[18 * i + 9] = x1;
        position[18 * i + 10] = y1;
        position[18 * i + 11] = z1;
        position[18 * i + 12] = x2;
        position[18 * i + 13] = y2;
        position[18 * i + 14] = startZ;
        position[18 * i + 15] = x2;
        position[18 * i + 16] = y2;
        position[18 * i + 17] = z2;
      }
      const newPositions = splitTriangles(splitTriangles(position));
      setMesh(newPositions);
    }
  }, [horizonData]);

  const preview = () => {
    const colors = [
      [96, 140, 165, 255],
      [128, 160, 182, 255],
      [128, 160, 182, 255],
      [175, 196, 213, 255],
      [194, 214, 225, 255],
      [194, 214, 225, 255],
    ];
    if (mesh) {
      const zValues = mesh.filter((_, i) => i % 3 === 2);
      const minZ = Math.min(...zValues);
      const maxZ = Math.max(...zValues);
      const color = new Uint8Array(4 * zValues.length);
      for (let i = 0; i < zValues.length; i++) {
        const index = Math.floor(((zValues[i] - minZ) / (maxZ - minZ)) * 5);
        color[4 * i] = colors[index][0];
        color[4 * i + 1] = colors[index][1];
        color[4 * i + 2] = colors[index][2];
        color[4 * i + 3] = colors[index][3];
      }
      Forma.render.updateMesh({ id: "horizon", geometryData: { position: mesh, color } });
    }
  };
  const addMeshToProposal = () => {
    if (mesh) {
      addElement(Array.from(mesh), "horizon");
    }
  };

  return (
    <>
      <button onClick={preview}>Preview</button>
      <button onClick={addMeshToProposal}>Add to proposal</button>
      <canvas width="500px" height="500px" id="horizonGraph" />
    </>
  );
}
