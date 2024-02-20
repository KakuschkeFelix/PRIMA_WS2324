namespace Script {
    import fudge = FudgeCore;

    export interface SoundHandler {
        audio: fudge.Audio;
        loadSound(): Promise<void>;
    }

    export class Sound {
        constructor(private soundHandler: SoundHandler) {}

        public async loadSound(): Promise<void> {
            await this.soundHandler.loadSound();
        }

        public playSound(audio: fudge.ComponentAudio): void {
            audio.setAudio(this.soundHandler.audio);
            audio.connect(true);
            audio.play(true);
        }
    }
}