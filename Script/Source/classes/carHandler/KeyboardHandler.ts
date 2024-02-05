namespace Script {
      import fudge = FudgeCore;
      export class KeyboardHandler implements HandlerBase {
            nextAction(_position: fudge.Vector3, _rotation: number, _client: NetworkClient): [number, number] {
                  let transformation: [number, number] = [0, 0];
                  if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.W, fudge.KEYBOARD_CODE.ARROW_UP])) {
                        transformation[0] = 1;
                  }
                  if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.S, fudge.KEYBOARD_CODE.ARROW_DOWN])) {
                        transformation[0] = -1;
                  }
                  if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.A, fudge.KEYBOARD_CODE.ARROW_LEFT])) {
                        transformation[1] = -1;
                  }
                  if (fudge.Keyboard.isPressedOne([fudge.KEYBOARD_CODE.D, fudge.KEYBOARD_CODE.ARROW_RIGHT])) {
                        transformation[1] = 1;
                  }
                  _client.sendPosition(_position);
                  _client.sendRotation(_rotation);
                  return transformation;
            }
      }
}