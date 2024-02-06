namespace Script {
      import fudge = FudgeCore;

      export class TileBorder extends fudge.Node implements Tile {
            private locationRotationMap = {
                  "Top": 0,
                  "Bottom": 0,
                  "Left": 90,
                  "Right": 90,
            }

            private locationTranslationMap = {
                  "Top": (_x: number) => new fudge.Vector3(_x - 0.5, -0.01, -1.5),
                  "Bottom": (_x: number) => new fudge.Vector3(_x - 0.5, -0.01, 0.5),
                  "Left": (_x: number) => new fudge.Vector3(-1, -0.01, _x - 1),
                  "Right": (_x: number) => new fudge.Vector3(1, -0.01, _x - 1),
            }

            constructor(public borderLocation: "Top" | "Bottom" | "Left" | "Right") {
                  const name = "TileBorder";
                  super(name);
            }

            build(position: fudge.Vector3, offset: fudge.Vector2): void {
                  position.add(new fudge.Vector3(offset.x, 0, offset.y));
                  position.scale(-1);
                  const material = fudge.Project.getResourcesByName("texBorder")[0] as fudge.Material;
                  this.addComponent(new fudge.ComponentTransform());
                  for (let x = 0; x < 2; x++) {
                        const mtx = new fudge.Matrix4x4();
                        mtx.translate(this.locationTranslationMap[this.borderLocation](x));
                        mtx.rotateY(this.locationRotationMap[this.borderLocation]);
                        mtx.scaleY(0.5);
                        let node = new fudge.Node(`Quad_${x}`);
                        let cmpMesh = new fudge.ComponentMesh();
                        let mesh = new fudge.MeshSprite();
                        cmpMesh.mesh = mesh;
                        node.addComponent(cmpMesh);
                        let cmpMaterial = new fudge.ComponentMaterial(material);
                        node.addComponent(cmpMaterial);
                        node.addComponent(new fudge.ComponentTransform(mtx));
                        this.appendChild(node);
                  }
                  this.mtxLocal.translate(position);
            }

            friction(): number {
                  return 0;
            }
      }
}