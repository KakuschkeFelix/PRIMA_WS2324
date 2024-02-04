namespace Script {
      import fudge = FudgeCore;

      export class TileStraight extends fudge.Node implements Tile {
            constructor() {
                  const name = "TileStraight";
                  super(name);
            }

            build(position: fudge.Vector3, offset: fudge.Vector2): void {
                  position.add(new fudge.Vector3(offset.x, 0, offset.y));
                  position.scale(-1);
                  const material = fudge.Project.getResourcesByName("texRoadStraight")[0] as fudge.Material;
                  this.addComponent(new fudge.ComponentTransform());
                  for (let x = 0; x < 2; x++) {
                        for (let z = 0; z < 2; z++) {
                              const mtx = new fudge.Matrix4x4();
                              mtx.translate(new fudge.Vector3(x - 0.5, -0.25, z - 1));
                              mtx.rotateX(-90);
                              let node = new fudge.Node(`Quad_${x}_${z}`);
                              let cmpMesh = new fudge.ComponentMesh();
                              let mesh = new fudge.MeshQuad();
                              cmpMesh.mesh = mesh;
                              node.addComponent(cmpMesh);
                              let cmpMaterial = new fudge.ComponentMaterial(material);
                              if (x === 1) {
                                    cmpMaterial.mtxPivot.rotate(180);
                              }
                              node.addComponent(cmpMaterial);
                              node.addComponent(new fudge.ComponentTransform(mtx));
                              this.appendChild(node);
                        }
                  }
                  this.mtxLocal.translate(position);
            }
      }
}