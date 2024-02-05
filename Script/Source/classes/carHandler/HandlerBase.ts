namespace Script {
      import fudge = FudgeCore;
      export interface HandlerBase {
            nextAction(_position: fudge.Vector3, _rotation: number, _client: NetworkClient): [number, number];
      }
}