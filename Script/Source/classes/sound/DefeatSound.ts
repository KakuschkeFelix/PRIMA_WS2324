namespace Script {
    import fudge = FudgeCore;

    export class DefeatSound implements SoundHandler {
        public audio: fudge.Audio;
        private path: string = "./Sounds/defeat.mp3";

        public async loadSound(): Promise<void> {
            this.audio = new fudge.Audio();
            await this.audio.load(this.path);
        }
    }
}