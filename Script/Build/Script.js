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
        follow(car) {
            const carPos = car.mtxLocal.translation;
            const cameraPos = this.cmp.mtxPivot.translation;
            const distance = 1.5; // distance from the car
            // Calculate the new camera position in a circular path around the car
            cameraPos.x = carPos.x + distance * Math.cos(car.rotation * Math.PI / 180 - Math.PI / 2);
            cameraPos.z = carPos.z + distance * Math.sin(car.rotation * Math.PI / 180 - Math.PI / 2);
            cameraPos.y = carPos.y + 1;
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
            this.rotation += transformation[1] * 2;
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
            if (this.color === Script.PC_CAR_COLOR) {
                console.log(this.speed.magnitude / timeDeltaSeconds, this.acceleration.magnitude / timeDeltaSeconds);
            }
            if (this.speed.magnitude / timeDeltaSeconds > Script.CAR_MAX_SPEED) {
                this.speed.normalize(Script.CAR_MAX_SPEED * timeDeltaSeconds);
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
//# sourceMappingURL=Script.js.map