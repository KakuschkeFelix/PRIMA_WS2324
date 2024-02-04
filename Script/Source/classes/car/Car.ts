namespace Script {
      import fudgeAid = FudgeAid;
      import fudge = FudgeCore;

      export class Car extends fudgeAid.NodeSprite  {
            speed = fudge.Vector3.ZERO();
            acceleration = fudge.Vector3.ZERO();
            position: fudge.Vector2;
            rotation: number;

            constructor(public color: CarColor, position: fudge.Vector2, public handler: HandlerBase) {
                  super(color);
                  this.addComponent(new fudge.ComponentTransform());
                  this.mtxLocal.translate(new fudge.Vector3(position.x, 0, position.y));
                  this.mtxLocal.scale(fudge.Vector3.ONE(0.5));
                  this.rotation = 0;
            }

            update(_cameraTranslation: fudge.Vector3, timeDeltaSeconds: number): void {
                  const carY = this.calculateRotationRelativeToCamera(_cameraTranslation);
                  this.rotate(_cameraTranslation, carY);
                  const nextAction = this.handler.nextAction(this.mtxLocal.translation);
                  this.move(nextAction, timeDeltaSeconds);
                  this.showFrame(this.calculateRotationFrame(carY));
            }

            move(transformation: [number, number], timeDeltaSeconds: number): void {
                  this.rotation += transformation[1] * 2;
                  const mtxClone = this.mtxLocal.clone;
                  mtxClone.rotation = new fudge.Vector3(0, -this.rotation, 0);
                  
                  this.acceleration = mtxClone.forward;
                  this.acceleration.scale(transformation[0] * CAR_ACCERLATION * timeDeltaSeconds);
                  if (transformation[0] !== 0) {
                  } else {
                        this.speed.scale(0.98);
                  }

                  this.speed.add(this.acceleration);
                  
                  if (this.color === PC_CAR_COLOR) {
                        console.log(this.speed.toString());
                  }
                  
                  if (this.speed.magnitude > CAR_MAX_SPEED) {
                        this.speed.normalize(CAR_MAX_SPEED);
                  }
                  
                  this.mtxLocal.translate(this.speed, false);
            }

            calculateRotationFrame(carY: number): number {
                  const frame = (CAR_CENTER_FRAME + Math.round((-carY - this.rotation) / CAR_FRAME_ANGLE_DIFF)) % (CAR_FRAMES_LEFT + CAR_FRAMES_RIGHT + 1);
                  if (frame < 0) {
                        return frame + (CAR_FRAMES_LEFT + CAR_FRAMES_RIGHT + 1);
                  }
                  return frame;
            }

            calculateRotationRelativeToCamera(_cameraTranslation: fudge.Vector3): number {
                  const carMtx = this.mtxLocal.clone;
                  carMtx.lookAt(_cameraTranslation, fudge.Vector3.Y(), true);
                  return carMtx.rotation.y + 180;
            }

            rotate(_cameraTranslation: fudge.Vector3, carY: number): void {
                  const distance = fudge.Vector3.DIFFERENCE(this.mtxLocal.translation, _cameraTranslation).magnitude;
                  const carAngle = Math.max(Math.min(-8 * distance + 90, CAR_MAX_ANGLE), CAR_MIN_ANGLE);
                  this.mtxLocal.rotation = new fudge.Vector3(carAngle, carY, 0);
            }

            async initializeAnimation(): Promise<void> {
                  let _spriteSheet: fudge.TextureImage = new fudge.TextureImage();
                  await _spriteSheet.load(`./Assets/Images/Cars/${this.color}.png`);
                  let coat: fudge.CoatTextured = new fudge.CoatTextured(undefined, _spriteSheet);
                  const animation = new fudgeAid.SpriteSheetAnimation(this.color, coat);
                  animation.generateByGrid(fudge.Rectangle.GET(0, 0, 64, 64), CAR_FRAMES_LEFT + CAR_FRAMES_RIGHT + 1, 64, fudge.ORIGIN2D.CENTER, fudge.Vector2.X(64));
                  this.setAnimation(animation);
                  this.framerate = 1;
            }
      }
}