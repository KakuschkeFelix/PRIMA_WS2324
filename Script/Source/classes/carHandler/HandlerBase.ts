namespace Script {
      import fudge = FudgeCore;
      export interface HandlerBase {
            nextAction(_position: fudge.Vector3): [number, number];
      }
}