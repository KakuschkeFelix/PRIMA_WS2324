declare namespace Script {
    import ƒ = FudgeCore;
    class CustomComponentScript extends ƒ.ComponentScript {
        static readonly iSubclass: number;
        message: string;
        constructor();
        hndEvent: (_event: Event) => void;
    }
}
declare namespace Script {
}
declare namespace Script {
    import fudge = FudgeCore;
    class Camera {
        cmp: fudge.ComponentCamera;
        constructor(position: fudge.Vector3, viewport: fudge.Viewport);
        get position(): fudge.Vector3;
        set position(_position: fudge.Vector3);
        follow(car: Car, lerpFactor?: number): void;
    }
}
declare namespace Script {
    import fudgeAid = FudgeAid;
    import fudge = FudgeCore;
    class Car extends fudgeAid.NodeSprite {
        color: CarColor;
        handler: HandlerBase;
        private trackHandler;
        private client;
        speed: fudge.Vector3;
        acceleration: fudge.Vector3;
        rotation: number;
        constructor(color: CarColor, position: fudge.Vector2, handler: HandlerBase, trackHandler: TrackHandler, client: NetworkClient);
        update(_cameraTranslation: fudge.Vector3, timeDeltaSeconds: number, idle?: boolean, otherPlayer?: boolean): void;
        move(transformation: [number, number], timeDeltaSeconds: number): void;
        calculateRotationFrame(carY: number): number;
        calculateRotationRelativeToCamera(_cameraTranslation: fudge.Vector3): number;
        rotate(_cameraTranslation: fudge.Vector3, carY: number): void;
        initializeAnimation(): Promise<void>;
    }
}
declare namespace Script {
    import fudgeCore = FudgeCore;
    class CarCheckpointScript extends fudgeCore.ComponentScript {
        static readonly iSubclass: number;
        checkpoints: fudgeCore.Vector2[];
        private currentCheckpoint;
        currentRound: number;
        trackHandler: TrackHandler;
        constructor();
        hndEvent: (_event: Event) => void;
        setupCheckpoints(checkpoints: fudgeCore.Vector2[]): void;
        checkCheckpoint(): void;
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    const PLAYER_ONE_COLOR: "carRed";
    const PLAYER_TWO_COLOR: "carBlue";
    type CarColor = typeof PLAYER_ONE_COLOR | typeof PLAYER_TWO_COLOR;
    const CAR_CENTER_FRAME = 6;
    const CAR_FRAMES_LEFT = 6;
    const CAR_FRAMES_RIGHT = 9;
    const CAR_FRAME_ANGLE_DIFF = 22.5;
    const CAR_POSITIONS: Record<CarColor, fudge.Vector2>;
    const CAR_MIN_ANGLE = 10;
    const CAR_MAX_ANGLE = 70;
    const CAR_MAX_SPEED = 20;
    const CAR_ACCERLATION = 0.2;
    const CAR_MIN_SPEED = 0.1;
    const CAR_TURN_SPEED = 200;
}
declare namespace Script {
    import fudge = FudgeCore;
    class AIHandler implements HandlerBase {
        nextAction(_position: fudge.Vector3, _rotation: number, _client: NetworkClient): [number, number];
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    interface HandlerBase {
        nextAction(_position: fudge.Vector3, _rotation: number, _client: NetworkClient): [number, number];
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    class KeyboardHandler implements HandlerBase {
        nextAction(_position: fudge.Vector3, _rotation: number, _client: NetworkClient): [number, number];
    }
}
declare namespace Script {
    import fudgeNet = FudgeNet;
    import fudge = FudgeCore;
    class NetworkClient {
        client: fudgeNet.FudgeClient;
        id: string;
        peers: Set<string>;
        lastPosition: fudge.Vector3;
        lastRotation: number;
        raceOver: boolean;
        constructor();
        connect(address: string): Promise<void>;
        getOtherCars(): Promise<string[]>;
        pingPlayerOne(target: string): Promise<void>;
        private makeNetworkCall;
        private handleMessage;
        sendPosition(position: fudge.Vector3): Promise<void>;
        sendRotation(rotation: number): Promise<void>;
        sendRaceOver(): Promise<void>;
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    class TrackBuilder {
        buildTrack(track: Track, offset: fudge.Vector2): fudge.Node;
        buildTile(tile: Tile, position: fudge.Vector3, trackGraph: fudge.Node, offset: fudge.Vector2): fudge.Node;
        buildBorder(track: Track, offset: fudge.Vector2, grassRows?: number): fudge.Node;
        private buildBorderAndGrassTiles;
        private buildGrassTiles;
        private buildCornerGrassTiles;
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    class TrackHandler {
        track: Track;
        offset: fudge.Vector2;
        defaultFriction: number;
        constructor(track: Track, offset: fudge.Vector2);
        getFrictionAt(position: fudge.Vector2): number;
        getTilePosition(position: fudge.Vector2): fudge.Vector2;
        isOutOfBounds(position: fudge.Vector2): boolean;
    }
}
declare namespace Script {
    const TILE_WIDTH = 2;
    const MAX_ROUNDS = 3;
    type Track = Tile[][];
}
declare namespace Script {
    import fudge = FudgeCore;
    interface Tile extends fudge.Node {
        build(position: fudge.Vector3, offset: fudge.Vector2): void;
        friction(): number;
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    class TileBorder extends fudge.Node implements Tile {
        borderLocation: "Top" | "Bottom" | "Left" | "Right";
        private locationRotationMap;
        private locationTranslationMap;
        constructor(borderLocation: "Top" | "Bottom" | "Left" | "Right");
        build(position: fudge.Vector3, offset: fudge.Vector2): void;
        friction(): number;
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    class TileGrass extends fudge.Node implements Tile {
        constructor();
        build(position: fudge.Vector3, offset: fudge.Vector2): void;
        friction(): number;
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    class TileStraight extends fudge.Node implements Tile {
        orientation: "Horizontal" | "Vertical";
        constructor(orientation?: "Horizontal" | "Vertical");
        build(position: fudge.Vector3, offset: fudge.Vector2): void;
        private horizontalTile;
        friction(): number;
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    type Side = "Left" | "Right" | "Top" | "Bottom";
    export class TileTurn extends fudge.Node implements Tile {
        private rotationTranslationMap;
        static sideRotationMap: {
            [key: string]: {
                [key: string]: number;
            };
        };
        private rotation;
        constructor(from: Side, to: Side);
        build(position: fudge.Vector3, offset: fudge.Vector2): void;
        private buildQuad;
        private rotateTile;
        friction(): number;
    }
    export {};
}
declare namespace Script {
    import fudge = FudgeCore;
    import fudgeVUI = FudgeUserInterface;
    class VUIHandler extends fudge.Mutable {
        rounds: number;
        maxRounds: number;
        timeString: string;
        winnerMessage: string;
        controller: fudgeVUI.Controller;
        private time;
        constructor();
        protected reduceMutator(_mutator: fudge.Mutator): void;
        increaseTime(timeDeltaSeconds: number): void;
        private getTimeString;
        showWinner(player: boolean): void;
    }
}
