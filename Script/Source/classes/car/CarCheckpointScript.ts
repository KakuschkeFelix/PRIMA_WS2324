namespace Script {
      import fudgeCore = FudgeCore;
      fudgeCore.Project.registerScriptNamespace(Script);  // Register the namespace to FUDGE for serialization
    
      export class CarCheckpointScript extends fudgeCore.ComponentScript {
        public static readonly iSubclass: number = fudgeCore.Component.registerSubclass(CustomComponentScript);

        public checkpoints: fudgeCore.Vector2[] = [];
        private currentCheckpoint: number = 0;

        public currentRound: number = 0;

        public trackHandler: TrackHandler;
        
        constructor() {
          super();
    
          // Don't start when running in editor
          if (fudgeCore.Project.mode == fudgeCore.MODE.EDITOR)
            return;
    
          // Listen to this component being added to or removed from a node
          this.addEventListener(fudgeCore.EVENT.COMPONENT_ADD, this.hndEvent);
          this.addEventListener(fudgeCore.EVENT.COMPONENT_REMOVE, this.hndEvent);
          this.addEventListener(fudgeCore.EVENT.NODE_DESERIALIZED, this.hndEvent);
        }
    
        // Activate the functions of this component as response to events
        public hndEvent = (_event: Event): void => {
          switch (_event.type) {
            case fudgeCore.EVENT.COMPONENT_ADD:
              break;
            case fudgeCore.EVENT.COMPONENT_REMOVE:
              this.removeEventListener(fudgeCore.EVENT.COMPONENT_ADD, this.hndEvent);
              this.removeEventListener(fudgeCore.EVENT.COMPONENT_REMOVE, this.hndEvent);
              break;
            case fudgeCore.EVENT.NODE_DESERIALIZED:
              // if deserialized the node is now fully reconstructed and access to all its components and children is possible
              break;
          }
        }

        public setupCheckpoints(checkpoints: fudgeCore.Vector2[]): void {
          const startPos = this.trackHandler.offset.clone;
          startPos.scale(-1);
          this.checkpoints = [...checkpoints, startPos];
        }

        public checkCheckpoint(): void {
          const carPosition = this.node.mtxLocal.translation.clone;
          const checkpointPosition = this.trackHandler.getTilePosition(new fudgeCore.Vector2(carPosition.x, carPosition.z));
          console.log(checkpointPosition.toString());

          if (this.currentCheckpoint < this.checkpoints.length) {
            if (this.checkpoints[this.currentCheckpoint].equals(checkpointPosition)) {
              this.currentCheckpoint++;
            }
          } else {
            this.currentRound++;
            this.currentCheckpoint = 0;
          }
        }
      }
    }