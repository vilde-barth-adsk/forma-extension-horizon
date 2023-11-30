import { Forma } from "forma-embedded-view-sdk/auto";

export async function addElement(position: number[], name?: string) {

    const { urn } = await Forma.integrateElements.createElementHierarchy({
        authcontext: Forma.getProjectId(),
        data: {
            rootElement: "root",
            elements: {
                root: {
                    id: "root",
                    properties: {
                        name,
                        geometry: {
                            type: "Inline",
                            format: "Mesh",
                            verts: position,
                            faces: Array(position.length / 3).fill(1).map((_, i) => i),
                            doubleSided: true,
                        },
                    },
                },
            },
        },
    });
    await Forma.proposal.addElement({ urn });
}