namespace Script {
      import fudge = FudgeCore;

      export const PLAYER_ONE_COLOR = "carRed" as const;
      export const PLAYER_TWO_COLOR = "carBlue" as const;

      export type CarColor = typeof PLAYER_ONE_COLOR | typeof PLAYER_TWO_COLOR;

      export const CAR_CENTER_FRAME = 6;
      export const CAR_FRAMES_LEFT = 6;
      export const CAR_FRAMES_RIGHT = 9;
      export const CAR_FRAME_ANGLE_DIFF = 22.5;

      export const CAR_POSITIONS: Record<CarColor, fudge.Vector2> = {
            carRed: new fudge.Vector2(0.5, -2.5),
            carBlue: new fudge.Vector2(-0.5, -2.5),
      };

      export const CAR_MIN_ANGLE = 10; // 10
      export const CAR_MAX_ANGLE = 70; // 70

      export const CAR_MAX_SPEED = 20;
      export const CAR_ACCERLATION = 0.2;
      export const CAR_MIN_SPEED = 0.1;

      export const CAR_TURN_SPEED = 200;
}