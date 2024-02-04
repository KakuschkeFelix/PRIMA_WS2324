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
    let track;
    document.addEventListener("interactiveViewportStarted", (event) => start(event));
    async function start(_event) {
        viewport = _event.detail;
        const cameraPos = Script.CAR_POSITIONS[Script.PC_CAR_COLOR].toVector3();
        cameraPos.z = cameraPos.y - 1.5;
        cameraPos.y = 1;
        camera = new Script.Camera(cameraPos, viewport);
        viewport.camera = camera.cmp;
        const graph = viewport.getBranch();
        await createCars(graph);
        const trackNode = buildTrack();
        graph.appendChild(trackNode);
        fudge.Loop.addEventListener("loopFrame" /* fudge.EVENT.LOOP_FRAME */, update);
        fudge.Loop.start();
    }
    async function createCars(graph) {
        pcCar = new Script.Car(Script.PC_CAR_COLOR, Script.CAR_POSITIONS[Script.PC_CAR_COLOR], new Script.KeyboardHandler());
        cars = [pcCar, ...Script.NPC_CAR_COLORS.map(color => new Script.Car(color, Script.CAR_POSITIONS[color], new Script.AIHandler()))];
        await Promise.all(cars.map(car => car.initializeAnimation()));
        cars.forEach(car => graph.addChild(car));
        console.log(cars[0]);
    }
    function buildTrack() {
        track = [
            [new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass()],
            [new Script.TileGrass(), new Script.TileTurn("Right", 0), new Script.TileTurn("Right", 270)],
            [new Script.TileGrass(), new Script.TileStraight(), new Script.TileTurn("Left", 180), new Script.TileTurn("Right", 270)],
            [new Script.TileGrass(), new Script.TileTurn("Right", 90), new Script.TileStraight(), new Script.TileTurn("Right", 180)],
            [new Script.TileGrass(), new Script.TileGrass(), new Script.TileGrass()]
        ];
        const offset = new fudge.Vector2(-1, -2);
        const trackBuilder = new Script.TrackBuilder();
        return trackBuilder.buildTrack(track, offset);
    }
    function update(_event) {
        const timeDeltaSeconds = fudge.Loop.timeFrameGame / 1000;
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
        follow(car, lerpFactor = 0.2) {
            const carPos = car.mtxLocal.translation;
            const cameraPos = this.cmp.mtxPivot.translation;
            const distance = 1.5; // distance from the car
            // Calculate the new camera position in a circular path around the car
            const targetPos = new fudge.Vector3(carPos.x + distance * Math.cos(car.rotation * Math.PI / 180 - Math.PI / 2), carPos.y + 1, carPos.z + distance * Math.sin(car.rotation * Math.PI / 180 - Math.PI / 2));
            // Use lerp to smoothly transition the camera's position
            cameraPos.x += (targetPos.x - cameraPos.x) * lerpFactor;
            cameraPos.y += (targetPos.y - cameraPos.y) * lerpFactor;
            cameraPos.z += (targetPos.z - cameraPos.z) * lerpFactor;
            this.cmp.mtxPivot.rotation = new fudge.Vector3(30, -car.rotation, 0);
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
        speed = fudge.Vector3.ZERO();
        acceleration = fudge.Vector3.ZERO();
        position;
        rotation;
        constructor(color, position, handler) {
            super(color);
            this.color = color;
            this.handler = handler;
            this.addComponent(new fudge.ComponentTransform());
            this.mtxLocal.translate(new fudge.Vector3(position.x, 0, position.y));
            this.mtxLocal.scale(fudge.Vector3.ONE(0.5));
            this.rotation = 0;
        }
        update(_cameraTranslation, timeDeltaSeconds) {
            const carY = this.calculateRotationRelativeToCamera(_cameraTranslation);
            this.rotate(_cameraTranslation, carY);
            const nextAction = this.handler.nextAction(this.mtxLocal.translation);
            this.move(nextAction, timeDeltaSeconds);
            this.showFrame(this.calculateRotationFrame(carY));
        }
        move(transformation, timeDeltaSeconds) {
            // Only allow rotation if the car is moving
            if (this.speed.magnitude > 0) {
                this.rotation += transformation[1] * 2;
            }
            const mtxClone = this.mtxLocal.clone;
            mtxClone.rotation = new fudge.Vector3(0, -this.rotation, 0);
            // Acceleration
            if (transformation[0] !== 0) {
                this.acceleration = mtxClone.forward;
                this.acceleration.scale(transformation[0] * Script.CAR_ACCERLATION * timeDeltaSeconds);
            }
            else {
                // Coasting
                this.acceleration = new fudge.Vector3(0, 0, 0);
            }
            this.speed.add(this.acceleration);
            if (this.speed.magnitude / timeDeltaSeconds > Script.CAR_MAX_SPEED) {
                this.speed.normalize(Script.CAR_MAX_SPEED * timeDeltaSeconds);
            }
            if (this.speed.magnitude / timeDeltaSeconds < Script.CAR_MIN_SPEED) {
                this.speed = fudge.Vector3.ZERO();
            }
            this.speed.scale(1 - Script.ROAD_FRICTION);
            this.mtxLocal.translate(this.speed, false);
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
    var fudge = FudgeCore;
    Script.NPC_CAR_COLORS = ["carRed"];
    Script.PC_CAR_COLOR = "carBlue";
    Script.CAR_CENTER_FRAME = 6;
    Script.CAR_FRAMES_LEFT = 6;
    Script.CAR_FRAMES_RIGHT = 9;
    Script.CAR_FRAME_ANGLE_DIFF = 22.5;
    Script.CAR_POSITIONS = {
        carRed: new fudge.Vector2(0.5, -1),
        carBlue: new fudge.Vector2(-0.5, -1),
    };
    Script.CAR_MIN_ANGLE = 10; // 10
    Script.CAR_MAX_ANGLE = 70; // 70
    Script.CAR_MAX_SPEED = 5;
    Script.CAR_ACCERLATION = 0.5;
    Script.ROAD_FRICTION = 0.1;
    Script.OFFROAD_FRICTION = 0.25;
    Script.CAR_MIN_SPEED = 0.1;
})(Script || (Script = {}));
var Script;
(function (Script) {
    class AIHandler {
        nextAction(position) {
            let transformation = [0, 0];
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
    Script.AIHandler = AIHandler;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class KeyboardHandler {
        nextAction(_position) {
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
            return transformation;
        }
    }
    Script.KeyboardHandler = KeyboardHandler;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class TrackBuilder {
        buildTrack(track, offset) {
            const trackGraph = new fudge.Node("TrackAbc");
            for (let z = 0; z < track.length; z++) {
                for (let x = 0; x < track[z].length; x++) {
                    if (!(x + offset.x === 0 && z + offset.y === 0)) {
                        this.buildTile(track[z][x], new fudge.Vector3(x, 0, z), trackGraph, offset);
                    }
                }
            }
            return trackGraph;
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
    }
    Script.TrackBuilder = TrackBuilder;
})(Script || (Script = {}));
var Script;
(function (Script) {
    Script.TILE_WIDTH = 2;
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
            mtx.translate(new fudge.Vector3(0, -0.251, -0.5));
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
    }
    Script.TileGrass = TileGrass;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class TileStraight extends fudge.Node {
        constructor() {
            const name = "TileStraight";
            super(name);
        }
        build(position, offset) {
            position.add(new fudge.Vector3(offset.x, 0, offset.y));
            position.scale(-1);
            const material = fudge.Project.getResourcesByName("texRoadStraight")[0];
            this.addComponent(new fudge.ComponentTransform());
            for (let x = 0; x < 2; x++) {
                for (let z = 0; z < 2; z++) {
                    const mtx = new fudge.Matrix4x4();
                    mtx.translate(new fudge.Vector3(x - 0.5, -0.25, z - 1));
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
        }
    }
    Script.TileStraight = TileStraight;
})(Script || (Script = {}));
var Script;
(function (Script) {
    var fudge = FudgeCore;
    class TileTurn extends fudge.Node {
        rotation;
        rotationTranslationMap = {
            0: new fudge.Vector3(0, 0, 0),
            90: new fudge.Vector3(0.5, 0, -0.5),
            180: new fudge.Vector3(0, 0, -1),
            270: new fudge.Vector3(-0.5, 0, -0.5)
        };
        constructor(orientation, rotation) {
            const name = "TileStraight";
            super(name);
            this.rotation = rotation;
            if (orientation === "Left") {
                this.rotation += 270;
            }
        }
        build(position, offset) {
            position.add(new fudge.Vector3(offset.x, 0, offset.y));
            position.scale(-1);
            this.addComponent(new fudge.ComponentTransform());
            const materialTL = fudge.Project.getResourcesByName("texRoadTurnOuter")[0];
            const materialTR = fudge.Project.getResourcesByName("texRoadStraight")[0];
            const materialBL = fudge.Project.getResourcesByName("texRoadStraight")[0];
            const materialBR = fudge.Project.getResourcesByName("texRoadTurnInner")[0];
            const nodeTL = this.buildQuad(materialTL, new fudge.Vector3(0.5, -0.25, 0), 180);
            const nodeTR = this.buildQuad(materialTR, new fudge.Vector3(-0.5, -0.25, 0), 90);
            const nodeBL = this.buildQuad(materialBL, new fudge.Vector3(0.5, -0.25, -1), 180);
            const nodeBR = this.buildQuad(materialBR, new fudge.Vector3(-0.5, -0.25, -1), 180);
            this.appendChild(nodeTL);
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
            // Save the current translation
            let translation = this.mtxLocal.translation.clone;
            translation.add(this.rotationTranslationMap[rotation]);
            // Reset the local matrix
            this.mtxLocal.set(fudge.Matrix4x4.IDENTITY());
            // Apply the rotation
            this.mtxLocal.rotateY(rotation);
            // Apply the saved translation
            this.mtxLocal.translation = translation;
        }
    }
    Script.TileTurn = TileTurn;
})(Script || (Script = {}));
//# sourceMappingURL=Script.js.map