namespace Script {
      import fudge = FudgeCore;
      export class AIHandler implements HandlerBase {
            nextAction(_position: fudge.Vector3, _rotation: number, _client: NetworkClient): [number, number] {
                  return [0, 0];
            }
      }
}