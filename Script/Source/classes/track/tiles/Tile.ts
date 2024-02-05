namespace Script {
      import fudge = FudgeCore;

      export interface Tile extends fudge.Node {
            build(position: fudge.Vector3, offset: fudge.Vector2): void;
            friction(): number;
      }
}