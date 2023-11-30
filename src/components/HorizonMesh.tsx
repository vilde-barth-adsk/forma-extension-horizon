import { useEffect, useState } from "preact/hooks";
import { Forma } from "forma-embedded-view-sdk/auto";
import { addElement } from "../AddElement.ts";

export function HorizonMesh({ horizonData, elevation }) {
  const [mesh, setMesh] = useState<Float32Array | undefined>(undefined);
  const [adding, setIsAdding] = useState(false);

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
      [96, 140, 165, 255],
      [128, 160, 182, 255],
      [128, 160, 182, 255],
      [175, 196, 213, 255],
      [194, 214, 228, 255],
      [207, 221, 230, 255],
    ];
    if (mesh) {
      const zValues = mesh.filter((_, i) => i % 3 === 2);
      const minZ = Math.min(...zValues);
      const maxZ = Math.max(...zValues);
      const color = new Uint8Array(4 * zValues.length);
      for (let i = 0; i < zValues.length; i++) {
        const index = Math.floor(((zValues[i] - minZ) / (maxZ - minZ)) * (colors.length - 1));
        color[4 * i] = colors[index][0];
        color[4 * i + 1] = colors[index][1];
        color[4 * i + 2] = colors[index][2];
        color[4 * i + 3] = colors[index][3];
      }
      Forma.render.updateMesh({ id: "horizon", geometryData: { position: mesh, color } });
    }
  };
  const addMeshToProposal = async () => {
    if (mesh) {
      setIsAdding(true);
      await addElement(Array.from(mesh), "horizon");
      setIsAdding(false);
    }
  };

  return (
    <div style={{ display: "flex" }}>
      <weave-button onClick={preview} style={{ marginRight: "10px" }}>
        Preview
      </weave-button>
      <weave-button disabled={adding} variant="solid" onClick={addMeshToProposal}>
        {adding ? "Adding..." : "Add to proposal"}
      </weave-button>
    </div>
  );
}
