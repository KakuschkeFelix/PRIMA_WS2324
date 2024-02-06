namespace Script {
      import fudgeNet = FudgeNet;
      import fudge = FudgeCore;

      export class NetworkClient {
            client: fudgeNet.FudgeClient;
            id: string;
            peers: Set<string> = new Set();
            lastPosition: fudge.Vector3;
            lastRotation: number;

            constructor() {
                  this.client = new fudgeNet.FudgeClient();
            }

            public async connect(address: string): Promise<void> {
                  this.client.connectToServer(address);

                  await this.makeNetworkCall(5000, 100, () => {
                        if (this.client.id !== undefined) {
                              this.id = this.client.id;
                              return true;
                        }
                        return undefined;
                  });

                  this.client.addEventListener(fudgeNet.EVENT.MESSAGE_RECEIVED, (message) => this.handleMessage(message as MessageEvent));
            }

            public async getOtherCars() {
                  return await this.makeNetworkCall(5000, 100, () => {
                        const clients = Object.keys(this.client.clientsInfoFromServer);
                        if (clients.includes(this.id)) {
                              const others = clients.filter(client => client !== this.id);
                              this.peers = new Set(others);
                              return others;
                        }
                        return undefined;
                  });
            }

            public async pingPlayerOne(target: string) {
                  this.client.dispatch({
                        route: fudgeNet.ROUTE.VIA_SERVER,
                        content: {
                              ping: "pong",
                        },
                        idSource: this.id,
                        idTarget: target,
                  })
            }

            private async makeNetworkCall<T extends (...args: any[]) => any>(maxTimeout: number, timeout: number, handler: T): Promise<ReturnType<T>> {
                  const maxAttempts = maxTimeout / timeout;
                  let attempts = 0;

                  return new Promise((resolve, reject) => {
                        const intervalId = setInterval(() => {
                              attempts++;

                              const result = handler();

                              if (result !== undefined) {
                                    clearInterval(intervalId);
                                    resolve(result);
                              } else if (attempts >= maxAttempts) {
                                    clearInterval(intervalId);
                                    reject(new Error('Unable to get result within 5 seconds'));
                              }
                        }, timeout);
                  });
            }

            private async handleMessage(event: { data: string }) {
                  const message = JSON.parse(event.data) as fudgeNet.Message;
                  if (message.idTarget === this.id) {
                        if (message.idSource) {
                              this.peers.add(message.idSource);
                        }
                        if (message.content.position) {
                              const pos = message.content.position;
                              this.lastPosition = new fudge.Vector3(pos.x, pos.y, pos.z);
                        }
                        if (message.content.rotation) {
                              this.lastRotation = message.content.rotation;
                        }
                  }
            }

            public async sendPosition(position: fudge.Vector3) {
                  if (![...this.peers][0]) return;
                  this.client.dispatch({
                        route: fudgeNet.ROUTE.VIA_SERVER,
                        content: {
                              position: {
                                    x: position.x,
                                    y: position.y,
                                    z: position.z,
                              },
                        },
                        idSource: this.id,
                        idTarget: [...this.peers][0],
                  })
            }

            public async sendRotation(rotation: number) {
                  if (![...this.peers][0]) return;
                  this.client.dispatch({
                        route: fudgeNet.ROUTE.VIA_SERVER,
                        content: {
                              rotation,
                        },
                        idSource: this.id,
                        idTarget: [...this.peers][0],
                  })
            }
      }
}