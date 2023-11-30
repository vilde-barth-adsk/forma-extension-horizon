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

export function HorizonMesh({horizonData, elevation}){
  const [mesh, setMesh] = useState<Float32Array | undefined>(undefined);

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
      setMesh(position);
    }
  }, [horizonData]);

  const preview = () => {
    const colors = [
          [96,140,165,255],
          [128,160,182,255],
          [128,160,182,255],
          [175,196,213,255],
          [194,214,228,255],
          [207,221,230,255],
    ];
    if (mesh) {
        const newMesh = splitTriangles(splitTriangles(mesh));
        const zValues = newMesh.filter((_, i) => i % 3 === 2);
      const minZ = Math.min(...zValues);
      const maxZ = Math.max(...zValues);
      const color = new Uint8Array(4 * zValues.length);
      for (let i = 0; i < zValues.length; i++) {
        const index = Math.floor(((zValues[i] - minZ) / (maxZ - minZ)) * (colors.length-1));
        color[4 * i] = colors[index][0];
        color[4 * i + 1] = colors[index][1];
        color[4 * i + 2] = colors[index][2];
        color[4 * i + 3] = colors[index][3];
      }
      Forma.render.updateMesh({ id: "horizon", geometryData: { position: newMesh, color } });
    }
  };
  const addMeshToProposal = () => {
    if (mesh) {
      addElement(Array.from(mesh), "horizon");
    }
  };

  return (
    <div style={{display: "flex"}}>
      <weave-button onClick={preview}>Preview</weave-button>
      <weave-button variant="solid" onClick={addMeshToProposal}>Add to proposal</weave-button>
      <canvas width="500px" height="500px" id="horizonGraph" />
    </div>
  );
}
