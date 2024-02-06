namespace Script {
      import fudge = FudgeCore;
      import fudgeVUI = FudgeUserInterface;

      export class VUIHandler extends fudge.Mutable {
            public rounds: number = 0;
            public maxRounds: number = 0;
            public timeString: string = "00:00.000";
            public winnerMessage: string = "";
            public controller: fudgeVUI.Controller;
            private time: number = 0;

            constructor() {
                  super();
                  this.controller = new fudgeVUI.Controller(this, document.getElementById("VUI"));
            }

            protected reduceMutator(_mutator: fudge.Mutator): void {
                  return;
            }

            public increaseTime(timeDeltaSeconds: number): void {
                  this.time += timeDeltaSeconds;
                  this.timeString = this.getTimeString();
            }

            private getTimeString(): string {
                  const milliseconds = Math.floor(this.time * 1000) % 1000;
                  const seconds = Math.floor(this.time) % 60;
                  const minutes = Math.floor(this.time / 60) % 60;
                  return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`;
            }

            public showWinner(player: boolean) {
                  const winnerDiv = document.getElementById("winnerScreen");
                  winnerDiv.style.display = "flex";
                  if (player) {
                        this.winnerMessage = "You win!";
                  } else {
                        this.winnerMessage = "You lose!";
                  }
            }

      }
}