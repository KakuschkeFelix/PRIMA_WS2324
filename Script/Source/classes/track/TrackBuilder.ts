namespace Script {
      import fudge = FudgeCore;

      export class TrackBuilder {
            public buildTrack(trackNode: fudge.Node, track: Track, offset: fudge.Vector2): fudge.Node {
                  for (let z = 0; z < track.length; z++) {
                        for (let x = 0; x < track[z].length; x++) {
                              if (!(x + offset.x === 0 && z + offset.y === 0)) {
                                    this.buildTile(track[z][x], new fudge.Vector3(x, 0, z), trackNode, offset);
                              }
                        }
                  }
                  return trackNode;
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

            public buildBorder(track: Track, offset: fudge.Vector2, grassRows: number = 2): fudge.Node {
                  const borderGraph = new fudge.Node("Border");
                  const LEFT = 0;
                  const RIGHT = track[0].length - 1;
                  const TOP = 0;
                  const BOTTOM = track.length - 1;

                  for (let row = 0; row < track.length; row++) {
                        for (let column = 0; column < track[row].length; column++) {
                              this.buildBorderAndGrassTiles(row, column, borderGraph, offset, grassRows, LEFT, RIGHT, TOP, BOTTOM);
                        }
                  }
                  return borderGraph;
            }

            private buildBorderAndGrassTiles(row: number, column: number, borderGraph: fudge.Node, offset: fudge.Vector2, grassRows: number, LEFT: number, RIGHT: number, TOP: number, BOTTOM: number) {
                  if (column === LEFT || column === RIGHT) {
                        this.buildTile(new TileBorder(column === LEFT ? "Left" : "Right"), new fudge.Vector3(column + (column === LEFT ? -1 : 1), 0, row), borderGraph, offset);
                        this.buildGrassTiles(column, row, borderGraph, offset, grassRows, column === LEFT ? -1 : 1, 0);
                  }
                  if (row === TOP || row === BOTTOM) {
                        this.buildTile(new TileBorder(row === TOP ? "Top" : "Bottom"), new fudge.Vector3(column, 0, row + (row === TOP ? -1 : 1)), borderGraph, offset);
                        this.buildGrassTiles(column, row, borderGraph, offset, grassRows, 0, row === TOP ? -1 : 1);
                  }
                  this.buildCornerGrassTiles(row, column, borderGraph, offset, grassRows, LEFT, RIGHT, TOP, BOTTOM);
            }

            private buildGrassTiles(column: number, row: number, borderGraph: fudge.Node, offset: fudge.Vector2, grassRows: number, xDirection: number, zDirection: number) {
                  for (let i = 1; i <= grassRows; i++) {
                        this.buildTile(new TileGrass(), new fudge.Vector3(column + i * xDirection, 0, row + i * zDirection), borderGraph, offset);
                  }
            }

            private buildCornerGrassTiles(row: number, column: number, borderGraph: fudge.Node, offset: fudge.Vector2, grassRows: number, LEFT: number, RIGHT: number, TOP: number, BOTTOM: number) {
                  if ((column === LEFT && row === TOP) || (column === LEFT && row === BOTTOM) || (column === RIGHT && row === TOP) || (column === RIGHT && row === BOTTOM)) {
                        for (let i = 1; i <= grassRows; i++) {
                              for (let j = 1; j <= grassRows; j++) {
                                    this.buildTile(new TileGrass(), new fudge.Vector3(column + (column === LEFT ? -i : i), 0, row + (row === TOP ? -j : j)), borderGraph, offset);
                              }
                        }
                  }
            }
      }
}