namespace Script {
      import fudge = FudgeCore;

      export class TrackBuilder {
            public buildTrack(track: Track, offset: fudge.Vector2): fudge.Node {
                  const trackGraph = new fudge.Node("TrackAbc");
                  for (let z = 0; z < track.length; z++) {
                        for (let x = 0; x < track[z].length; x++) {
                              if (!(x + offset.x === 0 && z + offset.y === 0)) {
                                    this.buildTile(track[z][x], new fudge.Vector3(x, 0, z), trackGraph, offset);
                              }
                        }
                  }
                  return trackGraph;
            }

            public buildTile(tile: Tile, position: fudge.Vector3, trackGraph: fudge.Node, offset: fudge.Vector2): fudge.Node {
                  const node = new fudge.Node(`${position.x}_${position.z}`);
                  tile.build(position, offset);
                  node.appendChild(tile);
                  node.addComponent(new fudge.ComponentTransform());
                  node.mtxLocal.translate(position);
                  trackGraph.appendChild(node);
                  return trackGraph;
            }
      }
}