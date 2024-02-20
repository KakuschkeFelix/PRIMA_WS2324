namespace Script {
    export type FurtwangenDriftConfig = {
        MAX_ROUNDS: number;
        FRICTION: {
            GRASS: number;
            TRACK: number;
        };
        CAR: {
            MAX_SPEED: number;
            MIN_SPEED: number;
            ACCERLATION: number;
            TURN_SPEED: number;
        };
        CAMERA: {
            LERP_FACTOR: number;
        };
    };

    export class ConfigLoader {
        public config: FurtwangenDriftConfig;
        private static instance: ConfigLoader;

        private constructor() {}

        public static getInstance(): ConfigLoader {
            if (!ConfigLoader.instance) {
                ConfigLoader.instance = new ConfigLoader();
            }
            return ConfigLoader.instance;
        }

        public async loadConfig(): Promise<void> {
            const response = await fetch("./external.json");
            this.config = await response.json();
        }
    }
}