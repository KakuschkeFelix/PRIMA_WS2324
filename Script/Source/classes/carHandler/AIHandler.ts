namespace Script {
      import fudge = FudgeCore;
      export class AIHandler implements HandlerBase {
            nextAction(position: fudge.Vector3): [number, number] {
                  let transformation: [number, number] = [0, 0];
                  // if (position.x < 0) {
                  //       transformation[0] = 1;
                  // } else {
                  //       transformation[0] = -1;
                  // }
                  // if (position.y < 0) {
                  //       transformation[1] = 1;
                  // } else {
                  //       transformation[1] = -1;
                  // }
                  return transformation;
            }
      }
}