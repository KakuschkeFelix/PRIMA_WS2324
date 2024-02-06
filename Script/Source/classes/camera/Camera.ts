namespace Script {
      import fudge = FudgeCore;
  
      export class Camera {
          cmp: fudge.ComponentCamera;
          constructor(position: fudge.Vector3, viewport: fudge.Viewport) {
              this.cmp = viewport.getBranch().getComponent(fudge.ComponentCamera) satisfies fudge.ComponentCamera;
              this.cmp.mtxPivot.translate(position);
              this.cmp.mtxPivot.rotateX(30);
          }
  
          public get position(): fudge.Vector3 {
              return this.cmp.mtxPivot.translation;
          }
  
          public set position(_position: fudge.Vector3) {
              this.cmp.mtxPivot.translation = _position;
          }

        public follow(car: Car, lerpFactor: number = 0.2): void {
            const carPos = car.mtxLocal.translation;
            const cameraPos = this.cmp.mtxPivot.translation;
            const distance = 2; // distance from the car

            // Calculate the new camera position in a circular path around the car
            const targetPos = new fudge.Vector3(
                carPos.x + distance * Math.cos(car.rotation * Math.PI / 180 - Math.PI / 2),
                carPos.y + 1,
                carPos.z + distance * Math.sin(car.rotation * Math.PI / 180 - Math.PI / 2)
            );

            // Use lerp to smoothly transition the camera's position
            cameraPos.x += (targetPos.x - cameraPos.x) * lerpFactor;
            cameraPos.y += (targetPos.y - cameraPos.y) * lerpFactor;
            cameraPos.z += (targetPos.z - cameraPos.z) * lerpFactor;

            this.cmp.mtxPivot.rotation = new fudge.Vector3(15, -car.rotation, 0);

            this.cmp.mtxPivot.translation = cameraPos;
        }
      }
  }
  