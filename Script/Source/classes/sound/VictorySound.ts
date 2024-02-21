namespace Script {
    import fudge = FudgeCore;

    export class VictorySound implements SoundHandler {
        public audio: fudge.Audio;
        private path: string = "./Assets/Sounds/victory.mp3";

        public async loadSound(): Promise<void> {
            this.audio = new fudge.Audio();
            await this.audio.load(this.path);
        }
    }
}