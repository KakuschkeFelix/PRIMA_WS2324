namespace Script {
      import fudge = FudgeCore;

      export class TileTurn extends fudge.Node implements Tile {
            private rotationTranslationMap = {
                  0: new fudge.Vector3(0, 0, 0),
                  90: new fudge.Vector3(0.5, 0, -0.5),
                  180: new fudge.Vector3(0, 0, -1),
                  270: new fudge.Vector3(-0.5, 0, -0.5)
            } as { [key: number]: fudge.Vector3 };

            constructor(orientation: "Left" | "Right", public rotation: number) {
                  const name = "TileStraight";
                  super(name);
                  if (orientation === "Left") {
                        this.rotation += 270;
                  }
            }

            build(position: fudge.Vector3, offset: fudge.Vector2): void {
                  position.add(new fudge.Vector3(offset.x, 0, offset.y));
                  position.scale(-1);
                  this.addComponent(new fudge.ComponentTransform());
                  const materialTL = fudge.Project.getResourcesByName("texRoadTurnOuter")[0] as fudge.Material;
                  const materialTR = fudge.Project.getResourcesByName("texRoadStraight")[0] as fudge.Material;
                  const materialBL = fudge.Project.getResourcesByName("texRoadStraight")[0] as fudge.Material;
                  const materialBR = fudge.Project.getResourcesByName("texRoadTurnInner")[0] as fudge.Material;
                  const nodeTL = this.buildQuad(materialTL, new fudge.Vector3(0.5, -0.25, 0), 180);
                  const nodeTR = this.buildQuad(materialTR, new fudge.Vector3(-0.5, -0.25, 0), 90);
                  const nodeBL = this.buildQuad(materialBL, new fudge.Vector3(0.5, -0.25, -1), 180);
                  const nodeBR = this.buildQuad(materialBR, new fudge.Vector3(-0.5, -0.25, -1), 180);
                  this.appendChild(nodeTL);
                  this.appendChild(nodeTR);
                  this.appendChild(nodeBL);
                  this.appendChild(nodeBR);
                  this.mtxLocal.translate(position);
                  this.rotateTile(this.rotation % 360);
            }

            private buildQuad(material: fudge.Material, position: fudge.Vector3, rotationY: number): fudge.Node {
                  const mtx = new fudge.Matrix4x4();
                  mtx.translate(position);
                  mtx.rotateX(-90);
                  let node = new fudge.Node(`Quad`);
                  let cmpMesh = new fudge.ComponentMesh();
                  let mesh = new fudge.MeshQuad();
                  cmpMesh.mesh = mesh;
                  cmpMesh.mtxPivot = mtx;
                  node.addComponent(cmpMesh);
                  let cmpMaterial = new fudge.ComponentMaterial(material);
                  cmpMaterial.mtxPivot.rotate(rotationY);
                  node.addComponent(cmpMaterial);
                  return node;
            }

            private rotateTile(rotation: number): void {
                  // Save the current translation
                  let translation = this.mtxLocal.translation.clone;
                  translation.add(this.rotationTranslationMap[rotation]);

                  // Reset the local matrix
                  this.mtxLocal.set(fudge.Matrix4x4.IDENTITY());

                  // Apply the rotation
                  this.mtxLocal.rotateY(rotation);

                  // Apply the saved translation
                  this.mtxLocal.translation = translation;
            }
      }
}