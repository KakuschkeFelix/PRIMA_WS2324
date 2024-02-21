namespace Script {
  import fudge = FudgeCore;
  fudge.Debug.info("Main Program Template running!");

  let viewport: fudge.Viewport;
  let camera: Camera;
  let cars: Car[] = [];
  let pcCar: Car;
  let pcCheckpointHandler: CarCheckpointScript;
  let track: Track;
  let checkpoints: fudge.Vector2[] = [];
  let ui: VUIHandler;
  let raceOver: boolean = false;
  let winner: boolean;

  let updateListener: EventListener;

  let client: NetworkClient;
  document.addEventListener("interactiveViewportStarted", (event: any) => start(event));
  document.addEventListener('startClick', async (event) => {
    client = new NetworkClient();
    await client.connect((event as CustomEvent).detail);
});
  document.addEventListener('raceOver', (event) => {
    raceOver = true;
    winner = (event as CustomEvent).detail;
  })

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    
    const graph = viewport.getBranch();

    await ConfigLoader.getInstance().loadConfig();

    ui = new VUIHandler();
    ui.maxRounds = ConfigLoader.getInstance().config.MAX_ROUNDS;

    const trackNode = graph.getChildrenByName("Track")[0];
    
    const {offset: trackOffset, borderNode} = buildTrack(trackNode);
    graph.appendChild(trackNode);
    graph.appendChild(borderNode);
    const carGraph = new fudge.Node("Cars");

    const others = await client.getOtherCars();
    
    const playerColor: CarColor = others.length === 0 ? PLAYER_ONE_COLOR : PLAYER_TWO_COLOR;
    const npcColor = others.length === 0 ? PLAYER_TWO_COLOR : PLAYER_ONE_COLOR;
    await createPCCar(carGraph, track, trackOffset, playerColor);
    await createNPCCar(carGraph, track, trackOffset, npcColor);

    const pos = CAR_POSITIONS[playerColor];
    const rot = 0;
    client.lastPosition = new fudge.Vector3(pos.x, 0, pos.y);
    client.lastRotation = rot;
    graph.appendChild(carGraph);

    

    const cameraPos = CAR_POSITIONS[playerColor].toVector3();
    cameraPos.z = cameraPos.y - 1.5;
    cameraPos.y = 1;
    camera = new Camera(cameraPos, viewport);
    viewport.camera = camera.cmp;
    
    fudge.Loop.addEventListener(fudge.EVENT.LOOP_FRAME, update);
    fudge.Loop.start();
  }

  async function createPCCar(graph: fudge.Node, track: Track, offset: fudge.Vector2, color: CarColor): Promise<void> {
    const trackHandler = new TrackHandler(track, offset);
    pcCar = new Car(color, CAR_POSITIONS[color], new KeyboardHandler(), trackHandler, client);
    pcCheckpointHandler = pcCar.getComponent(CarCheckpointScript);
    pcCheckpointHandler.trackHandler = trackHandler;
    pcCheckpointHandler.setupCheckpoints(checkpoints);
    await pcCheckpointHandler.setupAudio();
    fudge.AudioManager.default.listenWith(pcCheckpointHandler.cmpListener);
    await pcCar.initializeAnimation();
    graph.addChild(pcCar);
    cars.push(pcCar)
  }

  async function createNPCCar(graph: fudge.Node, track: Track, offset: fudge.Vector2, color: CarColor): Promise<void> {
    const car = new Car(color, CAR_POSITIONS[color], new AIHandler(), new TrackHandler(track, offset), client);
    await car.initializeAnimation();
    graph.addChild(car);
    cars.push(car);
  }

  function buildTrack(trackNode: fudge.Node): {offset: fudge.Vector2, borderNode: fudge.Node} {
    track = [
      [new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass()],
      [new TileGrass(), new TileTurn("Bottom", "Right"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileTurn("Left", "Bottom"), new TileGrass(), new TileGrass(), new TileTurn("Bottom", "Right"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileTurn("Left", "Bottom"), new TileGrass()],
      [new TileGrass(), new TileStraight(), new TileGrass(), new TileGrass(), new TileGrass(), new TileStraight(), new TileGrass(), new TileGrass(), new TileStraight(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileStraight(), new TileGrass()],
      [new TileGrass(), new TileStraight(), new TileGrass(), new TileGrass(), new TileGrass(), new TileTurn("Top", "Right"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileTurn("Left", "Top"), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileTurn("Top", "Right"), new TileTurn("Left", "Bottom")],
      [new TileGrass(), new TileStraight(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileStraight()],
      [new TileGrass(), new TileStraight(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileTurn("Right", "Bottom"), new TileTurn("Top", "Left")],
      [new TileGrass(), new TileTurn("Right", "Top"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileStraight("Horizontal"), new TileTurn("Top", "Left"), new TileGrass()],
      [new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass(), new TileGrass()],
    ];

    checkpoints = [new fudge.Vector2(2, 1), new fudge.Vector2(5, 2), new fudge.Vector2(10, 1), new fudge.Vector2(14, 4), new fudge.Vector2(11, 6)]
    const offset = new fudge.Vector2(-1, -2);
    const trackBuilder = new TrackBuilder();
    trackBuilder.buildTrack(trackNode, track, offset)
    return { offset, borderNode: trackBuilder.buildBorder(track, offset)};
  }

  async function update(_event: Event): Promise<void> {
    let allPlayersReady = false;
    if (!allPlayersReady) {
      if (client.peers.size === 1) {
        allPlayersReady = true;
      }
    }
    if (raceOver) {
      console.log(winner);
      if (winner) {
        ui.showWinner(true);
        pcCheckpointHandler.victorySound.playSound(pcCheckpointHandler.cmpAudio);
      } else {
        ui.showWinner(false);
        pcCheckpointHandler.defeatSound.playSound(pcCheckpointHandler.cmpAudio);
      }
      fudge.Loop.stop();
      fudge.Loop.removeEventListener(fudge.EVENT.LOOP_FRAME, update);
    }
    const stopRace = !allPlayersReady || raceOver;
    const timeDeltaSeconds: number = fudge.Loop.timeFrameGame / 1000;
    cars.forEach(car => {
      car.update(camera.cmp.mtxPivot.translation, timeDeltaSeconds, stopRace, car.color !== pcCar.color);
    });
    camera.follow(pcCar, ConfigLoader.getInstance().config.CAMERA.LERP_FACTOR);
    if (!stopRace) {
      pcCheckpointHandler.checkCheckpoint();
      ui.increaseTime(timeDeltaSeconds);
      ui.rounds = pcCheckpointHandler.currentRound;
      if (pcCheckpointHandler.currentRound >= ConfigLoader.getInstance().config.MAX_ROUNDS) {
        await client.sendRaceOver(); 
      }
    }
    viewport.draw();
  }
}