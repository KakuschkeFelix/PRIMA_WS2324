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

        public follow(car: Car): void {
            const carPos = car.mtxLocal.translation;
            const cameraPos = this.cmp.mtxPivot.translation;
            const distance = 1.5; // distance from the car

            // Calculate the new camera position in a circular path around the car
            cameraPos.x = carPos.x + distance * Math.cos(car.rotation * Math.PI / 180 - Math.PI / 2);
            cameraPos.z = carPos.z + distance * Math.sin(car.rotation * Math.PI / 180 - Math.PI / 2);
            cameraPos.y = carPos.y + 1;

            this.cmp.mtxPivot.rotation = new fudge.Vector3(30, -car.rotation, 0);

            console.log(cameraPos.toString(), this.cmp.mtxPivot.rotation.toString());

            this.cmp.mtxPivot.translation = cameraPos;
        }
      }
  }
  