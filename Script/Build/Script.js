"use strict";
var Script;
(function (Script) {
    var ƒ = FudgeCore;
    ƒ.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CustomComponentScript extends ƒ.ComponentScript {
        // Register the script as component for use in the editor via drag&drop
        static iSubclass = ƒ.Component.registerSubclass(CustomComponentScript);
        // Properties may be mutated by users in the editor via the automatically created user interface
        message = "CustomComponentScript added to ";
        constructor() {
            super();
            // Don't start when running in editor
            if (ƒ.Project.mode == ƒ.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */, this.hndEvent);
        }
        // Activate the functions of this component as response to events
        hndEvent = (_event) => {
            switch (_event.type) {
                case "componentAdd" /* ƒ.EVENT.COMPONENT_ADD */:
                    ƒ.Debug.log(this.message, this.node);
                    break;
                case "componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* ƒ.EVENT.COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* ƒ.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* ƒ.EVENT.NODE_DESERIALIZED */:
                    // if deserialized the node is now fully reconstructed and access to all its components and children is possible
                    break;
            }
        };
    }
    Script.CustomComponentScript = CustomComponentScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    fudge.Debug.info("Main Program Template running!");
    let viewport;
    let camera;
    let cars = [];
    let pcCar;
    let pcCheckpointHandler;
    let track;
    let checkpoints = [];
    let ui;
    let raceOver = false;
    let winner;
    let updateListener;
    let client;
    document.addEventListener("interactiveViewportStarted", (event) => start(event));
    document.addEventListener('startClick', async (event) => {
        client = new Script.NetworkClient();
        await client.connect(event.detail);
    });
    document.addEventListener('raceOver', (event) => {
        raceOver = true;
        winner = event.detail;
    });
    async function start(_event) {
        viewport = _event.detail;
        const graph = viewport.getBranch();
        await Script.ConfigLoader.getInstance().loadConfig();
        ui = new Script.VUIHandler();
        ui.maxRounds = Script.ConfigLoader.getInstance().config.MAX_ROUNDS;
        const trackNode = graph.getChildrenByName("Track")[0];
        const { offset: trackOffset, borderNode } = buildTrack(trackNode);
        graph.appendChild(trackNode);
        graph.appendChild(borderNode);
        const carGraph = new fudge.Node("Cars");
        const others = await client.getOtherCars();
        const playerColor = others.length === 0 ? Script.PLAYER_ONE_COLOR : Script.PLAYER_TWO_COLOR;
        const npcColor = others.length === 0 ? Script.PLAYER_TWO_COLOR : Script.PLAYER_ONE_COLOR;
        await createPCCar(carGraph, track, trackOffset, playerColor);
        await createNPCCar(carGraph, track, trackOffset, npcColor);
        const pos = Script.CAR_POSITIONS[playerColor];
        const rot = 0;
        client.lastPosition = new fudge.Vector3(pos.x, 0, pos.y);
        client.lastRotation = rot;
        graph.appendChild(carGraph);
        const cameraPos = Script.CAR_POSITIONS[playerColor].toVector3();
        cameraPos.z = cameraPos.y - 1.5;
        cameraPos.y = 1;
        camera = new Script.Camera(cameraPos, viewport);
        viewport.camera = camera.cmp;
        fudge.Loop.addEventListener("loopFrame" /* fudge.EVENT.LOOP_FRAME */, update);
        fudge.Loop.start();
    }
    async function createPCCar(graph, track, offset, color) {
        const trackHandler = new Script.TrackHandler(track, offset);
        pcCar = new Script.Car(color, Script.CAR_POSITIONS[color], new Script.KeyboardHandler(), trackHandler, client);
        pcCheckpointHandler = pcCar.getComponent(Script.CarCheckpointScript);
        pcCheckpointHandler.trackHandler = trackHandler;
        pcCheckpointHandler.setupCheckpoints(checkpoints);
        await pcCheckpointHandler.setupAudio();
        fudge.AudioManager.default.listenWith(pcCheckpointHandler.cmpListener);
        await pcCar.initializeAnimation();
        graph.addChild(pcCar);
        cars.push(pcCar);
    }
    async function createNPCCar(graph, track, offset, color) {
        const car = new Script.Car(color, Script.CAR_POSITIONS[color], new Script.AIHandler(), new Script.TrackHandler(track, offset), client);
        await car.initializeAnimation();
        graph.addChild(car);
        cars.push(car);
    }
    function buildTrack(trackNode) {
        track = [
            [new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass()],
            [new Script.TileGrass(), new Script.TileTurn("Bottom", "Right"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileTurn("Left", "Bottom"), new Script.TileGrass(), new Script.TileGrass(), new Script.TileTurn("Bottom", "Right"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileTurn("Left", "Bottom"), new Script.TileGrass()],
            [new Script.TileGrass(), new Script.TileStraight(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileStraight(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileStraight(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileStraight(), new Script.TileGrass()],
            [new Script.TileGrass(), new Script.TileStraight(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileTurn("Top", "Right"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileTurn("Left", "Top"), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileTurn("Top", "Right"), new Script.TileTurn("Left", "Bottom")],
            [new Script.TileGrass(), new Script.TileStraight(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileStraight()],
            [new Script.TileGrass(), new Script.TileStraight(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileTurn("Right", "Bottom"), new Script.TileTurn("Top", "Left")],
            [new Script.TileGrass(), new Script.TileTurn("Right", "Top"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileStraight("Horizontal"), new Script.TileTurn("Top", "Left"), new Script.TileGrass()],
            [new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass()],
        ];
        checkpoints = [new fudge.Vector2(2, 1), new fudge.Vector2(5, 2), new fudge.Vector2(10, 1), new fudge.Vector2(14, 4), new fudge.Vector2(11, 6)];
        const offset = new fudge.Vector2(-1, -2);
        const trackBuilder = new Script.TrackBuilder();
        trackBuilder.buildTrack(trackNode, track, offset);
        return { offset, borderNode: trackBuilder.buildBorder(track, offset) };
    }
    async function update(_event) {
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
            }
            else {
                ui.showWinner(false);
                pcCheckpointHandler.defeatSound.playSound(pcCheckpointHandler.cmpAudio);
            }
            fudge.Loop.stop();
            fudge.Loop.removeEventListener("loopFrame" /* fudge.EVENT.LOOP_FRAME */, update);
        }
        const stopRace = !allPlayersReady || raceOver;
        const timeDeltaSeconds = fudge.Loop.timeFrameGame / 1000;
        cars.forEach(car => {
            car.update(camera.cmp.mtxPivot.translation, timeDeltaSeconds, stopRace, car.color !== pcCar.color);
        });
        camera.follow(pcCar, Script.ConfigLoader.getInstance().config.CAMERA.LERP_FACTOR);
        if (!stopRace) {
            pcCheckpointHandler.checkCheckpoint();
            ui.increaseTime(timeDeltaSeconds);
            ui.rounds = pcCheckpointHandler.currentRound;
            if (pcCheckpointHandler.currentRound >= Script.ConfigLoader.getInstance().config.MAX_ROUNDS) {
                await client.sendRaceOver();
            }
        }
        viewport.draw();
    }
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class Camera {
        cmp;
        constructor(position, viewport) {
            this.cmp = viewport.getBranch().getComponent(fudge.ComponentCamera);
            this.cmp.mtxPivot.translate(position);
            this.cmp.mtxPivot.rotateX(30);
        }
        get position() {
            return this.cmp.mtxPivot.translation;
        }
        set position(_position) {
            this.cmp.mtxPivot.translation = _position;
        }
        follow(car, lerpFactor) {
            const carPos = car.mtxLocal.translation;
            const cameraPos = this.cmp.mtxPivot.translation;
            const distance = 2; // distance from the car
            // Calculate the new camera position in a circular path around the car
            const targetPos = new fudge.Vector3(carPos.x + distance * Math.cos(car.rotation * Math.PI / 180 - Math.PI / 2), carPos.y + 1, carPos.z + distance * Math.sin(car.rotation * Math.PI / 180 - Math.PI / 2));
            // Use lerp to smoothly transition the camera's position
            cameraPos.x += (targetPos.x - cameraPos.x) * lerpFactor;
            cameraPos.y += (targetPos.y - cameraPos.y) * lerpFactor;
            cameraPos.z += (targetPos.z - cameraPos.z) * lerpFactor;
            this.cmp.mtxPivot.rotation = new fudge.Vector3(15, -car.rotation, 0);
            this.cmp.mtxPivot.translation = cameraPos;
        }
    }
    Script.Camera = Camera;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudgeAid = FudgeAid;
    var fudge = FudgeCore;
    class Car extends fudgeAid.NodeSprite {
        color;
        handler;
        trackHandler;
        client;
        speed = fudge.Vector3.ZERO();
        acceleration = fudge.Vector3.ZERO();
        rotation;
        constructor(color, position, handler, trackHandler, client) {
            super(color);
            this.color = color;
            this.handler = handler;
            this.trackHandler = trackHandler;
            this.client = client;
            this.addComponent(new fudge.ComponentTransform());
            this.mtxLocal.translate(new fudge.Vector3(position.x, 0, position.y));
            this.mtxLocal.scale(fudge.Vector3.ONE(0.5));
            this.rotation = 0;
            this.addComponent(new Script.CarCheckpointScript());
        }
        update(_cameraTranslation, timeDeltaSeconds, idle = false, otherPlayer = false) {
            const carY = this.calculateRotationRelativeToCamera(_cameraTranslation);
            this.rotate(_cameraTranslation, carY);
            if (!idle && !otherPlayer) {
                const nextAction = this.handler.nextAction(this.mtxLocal.translation, this.rotation, this.client);
                this.move(nextAction, timeDeltaSeconds);
            }
            if (otherPlayer) {
                this.mtxLocal.translation = this.client.lastPosition;
                this.rotation = this.client.lastRotation;
            }
            this.showFrame(this.calculateRotationFrame(carY));
        }
        move(transformation, timeDeltaSeconds) {
            // Only allow rotation if the car is moving
            if (this.speed.magnitude > 0) {
                this.rotation += transformation[1] * Script.ConfigLoader.getInstance().config.CAR.TURN_SPEED * timeDeltaSeconds;
            }
            const mtxClone = this.mtxLocal.clone;
            mtxClone.rotation = new fudge.Vector3(0, -this.rotation, 0);
            // Acceleration
            if (transformation[0] !== 0) {
                this.acceleration = mtxClone.forward;
                this.acceleration.scale(transformation[0] * Script.ConfigLoader.getInstance().config.CAR.ACCERLATION * timeDeltaSeconds);
            }
            else {
                // Coasting
                this.acceleration = new fudge.Vector3(0, 0, 0);
            }
            this.speed.add(this.acceleration);
            if (this.speed.magnitude / timeDeltaSeconds > Script.ConfigLoader.getInstance().config.CAR.MAX_SPEED) {
                this.speed.normalize(Script.ConfigLoader.getInstance().config.CAR.MAX_SPEED * timeDeltaSeconds);
            }
            if (this.speed.magnitude / timeDeltaSeconds < Script.ConfigLoader.getInstance().config.CAR.MIN_SPEED) {
                this.speed = fudge.Vector3.ZERO();
            }
            const friction = this.trackHandler.getFrictionAt(new fudge.Vector2(this.mtxLocal.translation.x, this.mtxLocal.translation.z));
            this.speed.scale(friction);
            const oldPosition = this.mtxLocal.translation.clone;
            this.mtxLocal.translate(this.speed, false);
            const newPosition = new fudge.Vector2(this.mtxLocal.translation.x, this.mtxLocal.translation.z);
            if (this.trackHandler.isOutOfBounds(newPosition)) {
                this.mtxLocal.translation = oldPosition;
            }
        }
        calculateRotationFrame(carY) {
            const frame = (Script.CAR_CENTER_FRAME + Math.round((-carY - this.rotation) / Script.CAR_FRAME_ANGLE_DIFF)) % (Script.CAR_FRAMES_LEFT + Script.CAR_FRAMES_RIGHT + 1);
            if (frame < 0) {
                return frame + (Script.CAR_FRAMES_LEFT + Script.CAR_FRAMES_RIGHT + 1);
            }
            return frame;
        }
        calculateRotationRelativeToCamera(_cameraTranslation) {
            const carMtx = this.mtxLocal.clone;
            carMtx.lookAt(_cameraTranslation, fudge.Vector3.Y(), true);
            return carMtx.rotation.y + 180;
        }
        rotate(_cameraTranslation, carY) {
            const distance = fudge.Vector3.DIFFERENCE(this.mtxLocal.translation, _cameraTranslation).magnitude;
            const carAngle = Math.max(Math.min(-8 * distance + 90, Script.CAR_MAX_ANGLE), Script.CAR_MIN_ANGLE);
            this.mtxLocal.rotation = new fudge.Vector3(carAngle, carY, 0);
        }
        async initializeAnimation() {
            let _spriteSheet = new fudge.TextureImage();
            await _spriteSheet.load(`./Assets/Images/Cars/${this.color}.png`);
            let coat = new fudge.CoatTextured(undefined, _spriteSheet);
            const animation = new fudgeAid.SpriteSheetAnimation(this.color, coat);
            animation.generateByGrid(fudge.Rectangle.GET(0, 0, 64, 64), Script.CAR_FRAMES_LEFT + Script.CAR_FRAMES_RIGHT + 1, 64, fudge.ORIGIN2D.CENTER, fudge.Vector2.X(64));
            this.setAnimation(animation);
            this.framerate = 1;
        }
    }
    Script.Car = Car;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudgeCore = FudgeCore;
    fudgeCore.Project.registerScriptNamespace(Script); // Register the namespace to FUDGE for serialization
    class CarCheckpointScript extends fudgeCore.ComponentScript {
        static iSubclass = fudgeCore.Component.registerSubclass(Script.CustomComponentScript);
        checkpoints = [];
        currentCheckpoint = 0;
        currentRound = 0;
        trackHandler;
        cmpAudio;
        cmpListener;
        roundSound;
        defeatSound;
        victorySound;
        constructor() {
            super();
            // Don't start when running in editor
            if (fudgeCore.Project.mode == fudgeCore.MODE.EDITOR)
                return;
            // Listen to this component being added to or removed from a node
            this.addEventListener("componentAdd" /* fudgeCore.EVENT.COMPONENT_ADD */, this.hndEvent);
            this.addEventListener("componentRemove" /* fudgeCore.EVENT.COMPONENT_REMOVE */, this.hndEvent);
            this.addEventListener("nodeDeserialized" /* fudgeCore.EVENT.NODE_DESERIALIZED */, this.hndEvent);
            this.roundSound = new Script.Sound(new Script.RoundSound());
            this.defeatSound = new Script.Sound(new Script.DefeatSound());
            this.victorySound = new Script.Sound(new Script.VictorySound());
        }
        // Activate the functions of this component as response to events
        hndEvent = async (_event) => {
            switch (_event.type) {
                case "componentAdd" /* fudgeCore.EVENT.COMPONENT_ADD */:
                    break;
                case "componentRemove" /* fudgeCore.EVENT.COMPONENT_REMOVE */:
                    this.removeEventListener("componentAdd" /* fudgeCore.EVENT.COMPONENT_ADD */, this.hndEvent);
                    this.removeEventListener("componentRemove" /* fudgeCore.EVENT.COMPONENT_REMOVE */, this.hndEvent);
                    break;
                case "nodeDeserialized" /* fudgeCore.EVENT.NODE_DESERIALIZED */:
                    break;
            }
        };
        setupCheckpoints(checkpoints) {
            const startPos = this.trackHandler.offset.clone;
            startPos.scale(-1);
            this.checkpoints = [...checkpoints, startPos];
        }
        async setupAudio() {
            this.cmpAudio = new fudgeCore.ComponentAudio();
            this.cmpAudio.volume = 0.8;
            this.node.addComponent(this.cmpAudio);
            this.cmpListener = new fudgeCore.ComponentAudioListener();
            this.node.addComponent(this.cmpListener);
            await this.roundSound.loadSound();
            await this.defeatSound.loadSound();
            await this.victorySound.loadSound();
        }
        checkCheckpoint() {
            const carPosition = this.node.mtxLocal.translation.clone;
            const checkpointPosition = this.trackHandler.getTilePosition(new fudgeCore.Vector2(carPosition.x, carPosition.z));
            if (this.currentCheckpoint < this.checkpoints.length) {
                if (this.checkpoints[this.currentCheckpoint].equals(checkpointPosition)) {
                    this.currentCheckpoint++;
                }
            }
            else {
                this.roundSound.playSound(this.cmpAudio);
                this.currentRound++;
                this.currentCheckpoint = 0;
            }
        }
    }
    Script.CarCheckpointScript = CarCheckpointScript;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    Script.PLAYER_ONE_COLOR = "carRed";
    Script.PLAYER_TWO_COLOR = "carBlue";
    Script.CAR_CENTER_FRAME = 6;
    Script.CAR_FRAMES_LEFT = 6;
    Script.CAR_FRAMES_RIGHT = 9;
    Script.CAR_FRAME_ANGLE_DIFF = 22.5;
    Script.CAR_POSITIONS = {
        carRed: new fudge.Vector2(0.5, -2.5),
        carBlue: new fudge.Vector2(-0.5, -2.5),
    };
    Script.CAR_MIN_ANGLE = 10; // 10
    Script.CAR_MAX_ANGLE = 70; // 70
})(Script || (Script = {}));
var Script;
(function (Script) {
    class AIHandler {
        nextAction(_position, _rotation, _client) {
            return [0, 0];
        }
    }
    Script.AIHandler = AIHandler;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class KeyboardHandler {
        nextAction(_position, _rotation, _client) {
            let transformation = [0, 0];
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
    Script.KeyboardHandler = KeyboardHandler;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class ConfigLoader {
        config;
        static instance;
        constructor() { }
        static getInstance() {
            if (!ConfigLoader.instance) {
                ConfigLoader.instance = new ConfigLoader();
            }
            return ConfigLoader.instance;
        }
        async loadConfig() {
            const response = await fetch("./external.json");
            this.config = await response.json();
        }
    }
    Script.ConfigLoader = ConfigLoader;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudgeNet = FudgeNet;
    var fudge = FudgeCore;
    class NetworkClient {
        client;
        id;
        peers = new Set();
        lastPosition;
        lastRotation;
        raceOver = false;
        constructor() {
            this.client = new fudgeNet.FudgeClient();
        }
        async connect(address) {
            this.client.connectToServer(address);
            await this.makeNetworkCall(5000, 100, () => {
                if (this.client.id !== undefined) {
                    this.id = this.client.id;
                    return true;
                }
                return undefined;
            });
            this.client.addEventListener(fudgeNet.EVENT.MESSAGE_RECEIVED, (message) => this.handleMessage(message));
        }
        async getOtherCars() {
            return await this.makeNetworkCall(5000, 100, () => {
                const clients = Object.keys(this.client.clientsInfoFromServer);
                if (clients.includes(this.id)) {
                    const others = clients.filter(client => client !== this.id);
                    this.peers = new Set(others);
                    return others;
                }
                return undefined;
            });
        }
        async pingPlayerOne(target) {
            this.client.dispatch({
                route: fudgeNet.ROUTE.VIA_SERVER,
                content: {
                    ping: "pong",
                },
                idSource: this.id,
                idTarget: target,
            });
        }
        async makeNetworkCall(maxTimeout, timeout, handler) {
            const maxAttempts = maxTimeout / timeout;
            let attempts = 0;
            return new Promise((resolve, reject) => {
                const intervalId = setInterval(() => {
                    attempts++;
                    const result = handler();
                    if (result !== undefined) {
                        clearInterval(intervalId);
                        resolve(result);
                    }
                    else if (attempts >= maxAttempts) {
                        clearInterval(intervalId);
                        reject(new Error('Unable to get result within 5 seconds'));
                    }
                }, timeout);
            });
        }
        async handleMessage(event) {
            const message = JSON.parse(event.data);
            if (message.idTarget === this.id) {
                if (message.idSource) {
                    this.peers.add(message.idSource);
                }
                if (message.content.position) {
                    const pos = message.content.position;
                    this.lastPosition = new fudge.Vector3(pos.x, pos.y, pos.z);
                }
                if (message.content.rotation) {
                    this.lastRotation = message.content.rotation;
                }
                if (message.content.raceOver) {
                    document.dispatchEvent(new CustomEvent('raceOver', { detail: false }));
                }
            }
        }
        async sendPosition(position) {
            if (![...this.peers][0])
                return;
            this.client.dispatch({
                route: fudgeNet.ROUTE.VIA_SERVER,
                content: {
                    position: {
                        x: position.x,
                        y: position.y,
                        z: position.z,
                    },
                },
                idSource: this.id,
                idTarget: [...this.peers][0],
            });
        }
        async sendRotation(rotation) {
            if (![...this.peers][0])
                return;
            this.client.dispatch({
                route: fudgeNet.ROUTE.VIA_SERVER,
                content: {
                    rotation,
                },
                idSource: this.id,
                idTarget: [...this.peers][0],
            });
        }
        async sendRaceOver() {
            if (![...this.peers][0])
                return;
            this.client.dispatch({
                route: fudgeNet.ROUTE.VIA_SERVER,
                content: {
                    raceOver: true,
                },
                idSource: this.id,
                idTarget: [...this.peers][0],
            });
            document.dispatchEvent(new CustomEvent('raceOver', { detail: true }));
        }
    }
    Script.NetworkClient = NetworkClient;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class DefeatSound {
        audio;
        path = "./Assets/Sounds/defeat.mp3";
        async loadSound() {
            this.audio = new fudge.Audio();
            await this.audio.load(this.path);
        }
    }
    Script.DefeatSound = DefeatSound;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class RoundSound {
        audio;
        path = "./Assets/Sounds/round.mp3";
        async loadSound() {
            this.audio = new fudge.Audio();
            await this.audio.load(this.path);
        }
    }
    Script.RoundSound = RoundSound;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class Sound {
        soundHandler;
        constructor(soundHandler) {
            this.soundHandler = soundHandler;
        }
        async loadSound() {
            await this.soundHandler.loadSound();
        }
        playSound(audio) {
            audio.setAudio(this.soundHandler.audio);
            audio.connect(true);
            audio.play(true);
        }
    }
    Script.Sound = Sound;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class VictorySound {
        audio;
        path = "./Assets/Sounds/victory.mp3";
        async loadSound() {
            this.audio = new fudge.Audio();
            await this.audio.load(this.path);
        }
    }
    Script.VictorySound = VictorySound;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class TrackBuilder {
        buildTrack(trackNode, track, offset) {
            for (let z = 0; z < track.length; z++) {
                for (let x = 0; x < track[z].length; x++) {
                    if (!(x + offset.x === 0 && z + offset.y === 0)) {
                        this.buildTile(track[z][x], new fudge.Vector3(x, 0, z), trackNode, offset);
                    }
                }
            }
            return trackNode;
        }
        buildTile(tile, position, trackGraph, offset) {
            const node = new fudge.Node(`${position.x}_${position.z}`);
            tile.build(position, offset);
            node.appendChild(tile);
            node.addComponent(new fudge.ComponentTransform());
            node.mtxLocal.translate(position);
            trackGraph.appendChild(node);
            return trackGraph;
        }
        buildBorder(track, offset, grassRows = 2) {
            const borderGraph = new fudge.Node("Border");
            const LEFT = 0;
            const RIGHT = track[0].length - 1;
            const TOP = 0;
            const BOTTOM = track.length - 1;
            for (let row = 0; row < track.length; row++) {
                for (let column = 0; column < track[row].length; column++) {
                    this.buildBorderAndGrassTiles(row, column, borderGraph, offset, grassRows, LEFT, RIGHT, TOP, BOTTOM);
                }
            }
            return borderGraph;
        }
        buildBorderAndGrassTiles(row, column, borderGraph, offset, grassRows, LEFT, RIGHT, TOP, BOTTOM) {
            if (column === LEFT || column === RIGHT) {
                this.buildTile(new Script.TileBorder(column === LEFT ? "Left" : "Right"), new fudge.Vector3(column + (column === LEFT ? -1 : 1), 0, row), borderGraph, offset);
                this.buildGrassTiles(column, row, borderGraph, offset, grassRows, column === LEFT ? -1 : 1, 0);
            }
            if (row === TOP || row === BOTTOM) {
                this.buildTile(new Script.TileBorder(row === TOP ? "Top" : "Bottom"), new fudge.Vector3(column, 0, row + (row === TOP ? -1 : 1)), borderGraph, offset);
                this.buildGrassTiles(column, row, borderGraph, offset, grassRows, 0, row === TOP ? -1 : 1);
            }
            this.buildCornerGrassTiles(row, column, borderGraph, offset, grassRows, LEFT, RIGHT, TOP, BOTTOM);
        }
        buildGrassTiles(column, row, borderGraph, offset, grassRows, xDirection, zDirection) {
            for (let i = 1; i <= grassRows; i++) {
                this.buildTile(new Script.TileGrass(), new fudge.Vector3(column + i * xDirection, 0, row + i * zDirection), borderGraph, offset);
            }
        }
        buildCornerGrassTiles(row, column, borderGraph, offset, grassRows, LEFT, RIGHT, TOP, BOTTOM) {
            if ((column === LEFT && row === TOP) || (column === LEFT && row === BOTTOM) || (column === RIGHT && row === TOP) || (column === RIGHT && row === BOTTOM)) {
                for (let i = 1; i <= grassRows; i++) {
                    for (let j = 1; j <= grassRows; j++) {
                        this.buildTile(new Script.TileGrass(), new fudge.Vector3(column + (column === LEFT ? -i : i), 0, row + (row === TOP ? -j : j)), borderGraph, offset);
                    }
                }
            }
        }
    }
    Script.TrackBuilder = TrackBuilder;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class TrackHandler {
        track;
        offset;
        defaultFriction;
        constructor(track, offset) {
            this.track = track;
            this.offset = offset;
            this.defaultFriction = new Script.TileGrass().friction();
        }
        getFrictionAt(position) {
            const tilePosition = this.getTilePosition(position);
            const tile = this.track[tilePosition.y]?.[tilePosition.x];
            if (tile) {
                return tile.friction();
            }
            return this.defaultFriction;
        }
        getTilePosition(position) {
            const tilePosition = new fudge.Vector2(Math.floor((position.x - this.offset.x) / Script.TILE_WIDTH) + this.offset.x, Math.floor((position.y - this.offset.y - 0.5) / Script.TILE_WIDTH) + this.offset.y);
            tilePosition.scale(-1);
            return tilePosition;
        }
        isOutOfBounds(position) {
            const tilePosition = this.getTilePosition(position);
            return !this.track[tilePosition.y]?.[tilePosition.x];
        }
    }
    Script.TrackHandler = TrackHandler;
})(Script || (Script = {}));
var Script;
(function (Script) {
    Script.TILE_WIDTH = 2;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class TileBorder extends fudge.Node {
        borderLocation;
        locationRotationMap = {
            "Top": 0,
            "Bottom": 0,
            "Left": 90,
            "Right": 90,
        };
        locationTranslationMap = {
            "Top": (_x) => new fudge.Vector3(_x - 0.5, -0.01, -1.5),
            "Bottom": (_x) => new fudge.Vector3(_x - 0.5, -0.01, 0.5),
            "Left": (_x) => new fudge.Vector3(-1, -0.01, _x - 1),
            "Right": (_x) => new fudge.Vector3(1, -0.01, _x - 1),
        };
        constructor(borderLocation) {
            const name = "TileBorder";
            super(name);
            this.borderLocation = borderLocation;
        }
        build(position, offset) {
            position.add(new fudge.Vector3(offset.x, 0, offset.y));
            position.scale(-1);
            const material = fudge.Project.getResourcesByName("texBorder")[0];
            this.addComponent(new fudge.ComponentTransform());
            for (let x = 0; x < 2; x++) {
                const mtx = new fudge.Matrix4x4();
                mtx.translate(this.locationTranslationMap[this.borderLocation](x));
                mtx.rotateY(this.locationRotationMap[this.borderLocation]);
                mtx.scaleY(0.5);
                let node = new fudge.Node(`Quad_${x}`);
                let cmpMesh = new fudge.ComponentMesh();
                let mesh = new fudge.MeshSprite();
                cmpMesh.mesh = mesh;
                node.addComponent(cmpMesh);
                let cmpMaterial = new fudge.ComponentMaterial(material);
                node.addComponent(cmpMaterial);
                node.addComponent(new fudge.ComponentTransform(mtx));
                this.appendChild(node);
            }
            this.mtxLocal.translate(position);
        }
        friction() {
            return 0;
        }
    }
    Script.TileBorder = TileBorder;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class TileGrass extends fudge.Node {
        constructor() {
            const name = "TileGrass";
            super(name);
        }
        build(position, offset) {
            position.add(new fudge.Vector3(offset.x, 0, offset.y));
            position.scale(-1);
            const material = fudge.Project.getResourcesByName("texGrass")[0];
            this.addComponent(new fudge.ComponentTransform());
            const mtx = new fudge.Matrix4x4();
            mtx.translate(new fudge.Vector3(0, 0, -0.5));
            mtx.rotateX(-90);
            let node = new fudge.Node(`Quad`);
            let cmpMesh = new fudge.ComponentMesh();
            let mesh = new fudge.MeshQuad();
            cmpMesh.mesh = mesh;
            cmpMesh.mtxPivot.scale(new fudge.Vector3(Script.TILE_WIDTH, Script.TILE_WIDTH, Script.TILE_WIDTH));
            node.addComponent(cmpMesh);
            let cmpMaterial = new fudge.ComponentMaterial(material);
            node.addComponent(cmpMaterial);
            node.addComponent(new fudge.ComponentTransform(mtx));
            this.appendChild(node);
            this.mtxLocal.translate(position);
        }
        friction() {
            return Script.ConfigLoader.getInstance().config.FRICTION.GRASS;
        }
    }
    Script.TileGrass = TileGrass;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class TileStraight extends fudge.Node {
        orientation;
        constructor(orientation = "Vertical") {
            const name = `TileStraight_${orientation}`;
            super(name);
            this.orientation = orientation;
        }
        build(position, offset) {
            position.add(new fudge.Vector3(offset.x, 0, offset.y));
            position.scale(-1);
            const material = fudge.Project.getResourcesByName("texRoadStraight")[0];
            this.addComponent(new fudge.ComponentTransform());
            for (let x = 0; x < 2; x++) {
                for (let z = 0; z < 2; z++) {
                    const mtx = new fudge.Matrix4x4();
                    mtx.translate(new fudge.Vector3(x - 0.5, 0, z - 1));
                    mtx.rotateX(-90);
                    let node = new fudge.Node(`Quad_${x}_${z}`);
                    let cmpMesh = new fudge.ComponentMesh();
                    let mesh = new fudge.MeshQuad();
                    cmpMesh.mesh = mesh;
                    node.addComponent(cmpMesh);
                    let cmpMaterial = new fudge.ComponentMaterial(material);
                    if (x === 1) {
                        cmpMaterial.mtxPivot.rotate(180);
                    }
                    node.addComponent(cmpMaterial);
                    node.addComponent(new fudge.ComponentTransform(mtx));
                    this.appendChild(node);
                }
            }
            this.mtxLocal.translate(position);
            if (this.orientation === "Horizontal") {
                this.horizontalTile();
            }
        }
        horizontalTile() {
            let translation = this.mtxLocal.translation.clone;
            translation.add(new fudge.Vector3(0.5, 0, -0.5));
            this.mtxLocal.set(fudge.Matrix4x4.IDENTITY());
            this.mtxLocal.rotateY(90);
            this.mtxLocal.translation = translation;
        }
        friction() {
            return Script.ConfigLoader.getInstance().config.FRICTION.TRACK;
        }
    }
    Script.TileStraight = TileStraight;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class TileTurn extends fudge.Node {
        rotationTranslationMap = {
            0: new fudge.Vector3(0, 0, 0),
            90: new fudge.Vector3(0.5, 0, -0.5),
            180: new fudge.Vector3(0, 0, -1),
            270: new fudge.Vector3(-0.5, 0, -0.5)
        };
        static sideRotationMap = {
            "Left": {
                "Top": 180,
                "Bottom": 270
            },
            "Right": {
                "Top": 90,
                "Bottom": 0
            },
            "Top": {
                "Left": 180,
                "Right": 90
            },
            "Bottom": {
                "Left": 270,
                "Right": 0
            }
        };
        rotation;
        constructor(from, to) {
            const rotation = TileTurn.sideRotationMap[from][to];
            const name = `TileTurn_${rotation}`;
            super(name);
            this.rotation = rotation;
        }
        build(position, offset) {
            position.add(new fudge.Vector3(offset.x, 0, offset.y));
            position.scale(-1);
            this.addComponent(new fudge.ComponentTransform());
            const materialTL = fudge.Project.getResourcesByName("texRoadTurnOuter")[0];
            const materialGrassTL = fudge.Project.getResourcesByName("texGrass")[0];
            const materialTR = fudge.Project.getResourcesByName("texRoadStraight")[0];
            const materialBL = fudge.Project.getResourcesByName("texRoadStraight")[0];
            const materialBR = fudge.Project.getResourcesByName("texRoadTurnInner")[0];
            const nodeTL = this.buildQuad(materialTL, new fudge.Vector3(0.5, 0, 0), 180);
            const nodeGrassTL = this.buildQuad(materialGrassTL, new fudge.Vector3(0.5, -0.001, 0), 180);
            const nodeTR = this.buildQuad(materialTR, new fudge.Vector3(-0.5, 0, 0), 90);
            const nodeBL = this.buildQuad(materialBL, new fudge.Vector3(0.5, 0, -1), 180);
            const nodeBR = this.buildQuad(materialBR, new fudge.Vector3(-0.5, 0, -1), 180);
            this.appendChild(nodeTL);
            this.appendChild(nodeGrassTL);
            this.appendChild(nodeTR);
            this.appendChild(nodeBL);
            this.appendChild(nodeBR);
            this.mtxLocal.translate(position);
            this.rotateTile(this.rotation % 360);
        }
        buildQuad(material, position, rotationY) {
            const mtx = new fudge.Matrix4x4();
            mtx.translate(position);
            mtx.rotateX(-90);
            let node = new fudge.Node(`Quad`);
            let cmpMesh = new fudge.ComponentMesh();
            let mesh = new fudge.MeshQuad();
            cmpMesh.mesh = mesh;
            cmpMesh.mtxPivot = mtx;
            node.addComponent(cmpMesh);
            let cmpMaterial = new fudge.ComponentMaterial(material);
            cmpMaterial.mtxPivot.rotate(rotationY);
            node.addComponent(cmpMaterial);
            return node;
        }
        rotateTile(rotation) {
            let translation = this.mtxLocal.translation.clone;
            translation.add(this.rotationTranslationMap[rotation]);
            this.mtxLocal.set(fudge.Matrix4x4.IDENTITY());
            this.mtxLocal.rotateY(rotation);
            this.mtxLocal.translation = translation;
        }
        friction() {
            return Script.ConfigLoader.getInstance().config.FRICTION.TRACK;
        }
    }
    Script.TileTurn = TileTurn;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    var fudgeVUI = FudgeUserInterface;
    class VUIHandler extends fudge.Mutable {
        rounds = 0;
        maxRounds = 0;
        timeString = "00:00.000";
        winnerMessage = "";
        controller;
        time = 0;
        constructor() {
            super();
            this.controller = new fudgeVUI.Controller(this, document.getElementById("VUI"));
        }
        reduceMutator(_mutator) {
            return;
        }
        increaseTime(timeDeltaSeconds) {
            this.time += timeDeltaSeconds;
            this.timeString = this.getTimeString();
        }
        getTimeString() {
            const milliseconds = Math.floor(this.time * 1000) % 1000;
            const seconds = Math.floor(this.time) % 60;
            const minutes = Math.floor(this.time / 60) % 60;
            return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
        }
        showWinner(player) {
            const winnerDiv = document.getElementById("winnerScreen");
            winnerDiv.style.display = "flex";
            if (player) {
                this.winnerMessage = "You win!";
            }
            else {
                this.winnerMessage = "You lose!";
            }
        }
    }
    Script.VUIHandler = VUIHandler;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map