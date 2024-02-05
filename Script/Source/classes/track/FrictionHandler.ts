namespace Script {
      import fudge = FudgeCore;

      export class FrictionHandler {
            defaultFriction: number;
            constructor(private track: Track, private offset: fudge.Vector2) {
                  this.defaultFriction = new TileGrass().friction();
            }

            getFrictionAt(position: fudge.Vector2) {
                  const tilePosition = this.getTilePosition(position);
                  const tile = this.track[tilePosition.y]?.[tilePosition.x];
                  if (tile) {
                        return tile.friction();
                  }
                  return this.defaultFriction;
            }

            private getTilePosition(position: fudge.Vector2): fudge.Vector2 {
                  const tilePosition = new fudge.Vector2(Math.floor((position.x - this.offset.x) / TILE_WIDTH) + this.offset.x, Math.floor((position.y  - this.offset.y - 0.5) / TILE_WIDTH) + this.offset.y);
                  tilePosition.scale(-1);
                  return tilePosition;
            }
      }
}