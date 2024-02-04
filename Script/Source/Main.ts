namespace Script {
  import fudge = FudgeCore;
  fudge.Debug.info("Main Program Template running!");

  let viewport: fudge.Viewport;
  let camera: Camera;
  let cars: Car[] = [];
  let pcCar: Car;
  document.addEventListener("interactiveViewportStarted", (event: any) => start(event));

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    const cameraPos = CAR_POSITIONS[PC_CAR_COLOR].toVector3();
    cameraPos.z = cameraPos.y - 1.5;
    cameraPos.y = 1;
    camera = new Camera(cameraPos, viewport);
    viewport.camera = camera.cmp;

    const graph = viewport.getBranch();

    await createCars(graph);

    fudge.Loop.addEventListener(fudge.EVENT.LOOP_FRAME, update);
    fudge.Loop.start();
  }

  async function createCars(graph: fudge.Node): Promise<void> {
    pcCar = new Car(PC_CAR_COLOR, CAR_POSITIONS[PC_CAR_COLOR], new KeyboardHandler());
    cars = [pcCar, ...NPC_CAR_COLORS.map(color => new Car(color, CAR_POSITIONS[color], new AIHandler()))];
    await Promise.all(cars.map(car => car.initializeAnimation()));
    cars.forEach(car => graph.addChild(car));

    console.log(cars[0]);
  }

  function update(_event: Event): void {
    const timeDeltaSeconds: number = fudge.Loop.timeFrameGame / 1000;
    cars.forEach(car => {
      car.update(camera.cmp.mtxPivot.translation, timeDeltaSeconds);
    });
    camera.follow(pcCar);

    // FOR ORBIT CAMERA
    // const cameraPos = CAR_POSITIONS[PC_CAR_COLOR].toVector3();
    // cameraPos.z = cameraPos.y - 1.5;
    // cameraPos.y = 1;
    // cars.forEach(car => car.update(cameraPos));


    viewport.draw();
  }
}