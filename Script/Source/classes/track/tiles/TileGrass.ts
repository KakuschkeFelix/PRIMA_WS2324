namespace Script {
      import fudge = FudgeCore;

      export class TileGrass extends fudge.Node implements Tile {
            constructor() {
                  const name = "TileGrass";
                  super(name);
            }

            build(position: fudge.Vector3, offset: fudge.Vector2): void {
                  position.add(new fudge.Vector3(offset.x, 0, offset.y));
                  position.scale(-1);
                  const material = fudge.Project.getResourcesByName("texGrass")[0] as fudge.Material;
                  this.addComponent(new fudge.ComponentTransform());
                  const mtx = new fudge.Matrix4x4();
                  mtx.translate(new fudge.Vector3(0, -0.251, -0.5));
                  mtx.rotateX(-90);
                  let node = new fudge.Node(`Quad`);
                  let cmpMesh = new fudge.ComponentMesh();
                  let mesh = new fudge.MeshQuad();
                  cmpMesh.mesh = mesh;
                  cmpMesh.mtxPivot.scale(new fudge.Vector3(TILE_WIDTH, TILE_WIDTH, TILE_WIDTH));
                  node.addComponent(cmpMesh);
                  let cmpMaterial = new fudge.ComponentMaterial(material);
                  node.addComponent(cmpMaterial);
                  node.addComponent(new fudge.ComponentTransform(mtx));
                  this.appendChild(node);
                  this.mtxLocal.translate(position);
            }

            friction(): number {
                  return 0.92;
            }
      }
}