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
        speed: fudge.Vector3;
        acceleration: fudge.Vector3;
        position: fudge.Vector2;
        rotation: number;
        constructor(color: CarColor, position: fudge.Vector2, handler: HandlerBase);
        update(_cameraTranslation: fudge.Vector3, timeDeltaSeconds: number): void;
        move(transformation: [number, number], timeDeltaSeconds: number): void;
        calculateRotationFrame(carY: number): number;
        calculateRotationRelativeToCamera(_cameraTranslation: fudge.Vector3): number;
        rotate(_cameraTranslation: fudge.Vector3, carY: number): void;
        initializeAnimation(): Promise<void>;
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    const NPC_CAR_COLORS: readonly ["carRed"];
    type NPCCarColor = typeof NPC_CAR_COLORS[number];
    const PC_CAR_COLOR = "carBlue";
    type CarColor = NPCCarColor | typeof PC_CAR_COLOR;
    const CAR_CENTER_FRAME = 6;
    const CAR_FRAMES_LEFT = 6;
    const CAR_FRAMES_RIGHT = 9;
    const CAR_FRAME_ANGLE_DIFF = 22.5;
    const CAR_POSITIONS: Record<CarColor, fudge.Vector2>;
    const CAR_MIN_ANGLE = 10;
    const CAR_MAX_ANGLE = 70;
    const CAR_MAX_SPEED = 5;
    const CAR_ACCERLATION = 0.5;
    const ROAD_FRICTION = 0.1;
    const OFFROAD_FRICTION = 0.25;
    const CAR_MIN_SPEED = 0.1;
}
declare namespace Script {
    import fudge = FudgeCore;
    class AIHandler implements HandlerBase {
        nextAction(position: fudge.Vector3): [number, number];
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    interface HandlerBase {
        nextAction(_position: fudge.Vector3): [number, number];
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    class KeyboardHandler implements HandlerBase {
        nextAction(_position: fudge.Vector3): [number, number];
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    class TrackBuilder {
        buildTrack(track: Track, offset: fudge.Vector2): fudge.Node;
        buildTile(tile: Tile, position: fudge.Vector3, trackGraph: fudge.Node, offset: fudge.Vector2): fudge.Node;
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    const TILE_WIDTH = 2;
    type Track = Tile[][];
    const OFFSET: fudge.Vector2;
}
declare namespace Script {
    import fudge = FudgeCore;
    class TileGrass extends fudge.Node implements Tile {
        constructor();
        build(position: fudge.Vector3, offset: fudge.Vector2): void;
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    class TileStraight extends fudge.Node implements Tile {
        constructor();
        build(position: fudge.Vector3, offset: fudge.Vector2): void;
    }
}
declare namespace Script {
    import fudge = FudgeCore;
    interface Tile extends fudge.Node {
        build(position: fudge.Vector3, offset: fudge.Vector2): void;
    }
}
