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

  let client: NetworkClient;
  document.addEventListener("interactiveViewportStarted", (event: any) => start(event));
  document.addEventListener('startClick', async (event) => {
    client = new NetworkClient();
    await client.connect((event as CustomEvent).detail);
});

  async function start(_event: CustomEvent): Promise<void> {
    viewport = _event.detail;

    
    const graph = viewport.getBranch();

    ui = new VUIHandler();
    ui.maxRounds = MAX_ROUNDS;
    
    const {node: trackNode, offset: trackOffset, borderNode} = buildTrack();
    graph.appendChild(trackNode);
    graph.appendChild(borderNode);

    const others = await client.getOtherCars();
    
    let color: CarColor;
    if (others.length > 0) {
      await createPCCar(graph, track, trackOffset, false);
      await createNPCCar(graph, track, trackOffset, false);
      color = PLAYER_TWO_COLOR;
      client.pingPlayerOne(others[0]);
      const pos = CAR_POSITIONS[PLAYER_ONE_COLOR];
      const rot = 0;
      client.lastPosition = new fudge.Vector3(pos.x, 0, pos.y);
      client.lastRotation = rot;
    } else {
      await createPCCar(graph, track, trackOffset, true);
      await createNPCCar(graph, track, trackOffset, true);
      color = PLAYER_ONE_COLOR;
      const pos = CAR_POSITIONS[PLAYER_TWO_COLOR];
      const rot = 0;
      client.lastPosition = new fudge.Vector3(pos.x, 0, pos.y);
      client.lastRotation = rot;
    }

    const cameraPos = CAR_POSITIONS[color].toVector3();
    cameraPos.z = cameraPos.y - 1.5;
    cameraPos.y = 1;
    camera = new Camera(cameraPos, viewport);
    viewport.camera = camera.cmp;
    
    fudge.Loop.addEventListener(fudge.EVENT.LOOP_FRAME, update);
    fudge.Loop.start();
  }

  async function createPCCar(graph: fudge.Node, track: Track, offset: fudge.Vector2, playerOne: boolean): Promise<void> {
    const color = playerOne ? PLAYER_ONE_COLOR : PLAYER_TWO_COLOR;
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

  async function createNPCCar(graph: fudge.Node, track: Track, offset: fudge.Vector2, playerOne: boolean): Promise<void> {
    const color = playerOne ? PLAYER_TWO_COLOR : PLAYER_ONE_COLOR;
    const car = new Car(color, CAR_POSITIONS[color], new AIHandler(), new TrackHandler(track, offset), client);
    await car.initializeAnimation();
    graph.addChild(car);
    cars.push(car);
  }

  function buildTrack(): {node: fudge.Node, offset: fudge.Vector2, borderNode: fudge.Node} {
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
    return { node: trackBuilder.buildTrack(track, offset), offset, borderNode: trackBuilder.buildBorder(track, offset)};
  }

  async function update(_event: Event): Promise<void> {
    let allPlayersReady = false;
    if (!allPlayersReady) {
      if (client.peers.size === 1) {
        allPlayersReady = true;
      }
    }
    const stopRace = !allPlayersReady || raceOver;
    const timeDeltaSeconds: number = fudge.Loop.timeFrameGame / 1000;
    cars.forEach(car => {
      car.update(camera.cmp.mtxPivot.translation, timeDeltaSeconds, stopRace, car.color !== pcCar.color);
    });
    camera.follow(pcCar);
    if (!stopRace) {
      pcCheckpointHandler.checkCheckpoint();
      ui.increaseTime(timeDeltaSeconds);
      ui.rounds = pcCheckpointHandler.currentRound;
      if (pcCheckpointHandler.currentRound >= MAX_ROUNDS) {
        raceOver = true;
        await client.sendRaceOver();
        ui.showWinner(true);
        pcCheckpointHandler.victorySound.playSound(pcCheckpointHandler.cmpAudio);
      } else {
        raceOver = client.raceOver;
        if (raceOver) {
          ui.showWinner(false);
          pcCheckpointHandler.defeatSound.playSound(pcCheckpointHandler.cmpAudio);
        }
      }
    }
    viewport.draw();
  }
}