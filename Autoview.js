/**
 * Startup script to display a graph given with the resource file referred to from the html document, 
 * play its sound and add an interactive orbit camera.
 * 
 * It is highly recommended to use TypeScript for further coding. 
 * Your recommended structure for coding and some starter code is already set up for you in the folder "Script".
 * However, the code below is written in Javascript, so no compilation is required to get started.
 * The types are annotated as comments here and may become regular Javascript-code as this TC39-Proposal progresses {@link https://github.com/tc39/proposal-type-annotations}
 * 
 * Do not extend this file, but use it as a template to transfer some of its functionality to your own code. 
 * This file will should disappear as you progress...
 * 
 * Have fun creating with FUDGE!
 * @author: Jirka Dell'Oro-Friedl, HFU, 2022
 */


var ƒ = FudgeCore;
var ƒAid = FudgeAid;
var fudgeNet = FudgeNet;
window.addEventListener("load", init);

// show dialog for startup, user interaction required e.g. for starting audio
function init(_event)/* : void */ {
  let dialog/* : HTMLDialogElement */ = document.querySelector("dialog");
  dialog.querySelector("h1").textContent = document.title;
  const button = dialog.querySelector("button#start");
  const serverAddressInput = dialog.querySelector("input#serverAddress");
  const serverAddressError = dialog.querySelector("span#serverAddressError");
  if (!serverAddressInput || !serverAddressError || !button) {
    alert("Invalid dialog setup");
    return;
  }

  serverAddressInput.addEventListener("input", function (_event) {
    if (!serverAddressInput.checkValidity()) {
      serverAddressError.textContent = "Please enter a valid server address";
    } else {
      serverAddressError.textContent = "";
    }
  });
  button.addEventListener("click", async function (_event) {
    if (!serverAddressInput?.checkValidity()) {
      alert("Please enter a valid server address");
      return;
    }
    const client = await makeConnection(serverAddressInput.value).catch(() => undefined);
    if (!client) {
      serverAddressError.textContent = "Could not connect to server";
      return;
    }
    dialog.style.display = "none";
    dialog.close();
    client.socket.close();
    // check if the connection is still open
    let connectionOpen = await checkConnection(client).catch(() => false);
    for (let i = 0; i < 5 && !connectionOpen; i++) {
      connectionOpen = await checkConnection(client).catch(() => false);
      if (!connectionOpen) break;
    }
    button.dispatchEvent(new CustomEvent("startClick", { bubbles: true, detail: serverAddressInput.value}));
    let graphId/* : string */ = document.head.querySelector("meta[autoView]").getAttribute("autoView");
    startInteractiveViewport(graphId);
  });
  dialog.showModal();
}

/**
 * checks the connection to the server
 * @param {string} address 
 * @returns {Promise<fudgeNet.FudgeClient>}
 */
async function makeConnection(address) {
  const client = new fudgeNet.FudgeClient();
  client.connectToServer(address);

  const maxAttempts = 10;
  let attempts = 0;

  return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
              attempts++;

              const result = client.id;

              if (result !== undefined) {
                    clearInterval(intervalId);
                    resolve(client);
              } else if (attempts >= maxAttempts) {
                    clearInterval(intervalId);
                    reject(new Error('Unable to get result within 1 second'));
              }
        }, 100);
  });
}

async function checkConnection(client) {
  const maxAttempts = 10;
  let attempts = 0;

  return new Promise((resolve, reject) => {
        const intervalId = setInterval(() => {
              attempts++;

              const result = client.id;

              if (result !== undefined) {
                    clearInterval(intervalId);
                    resolve(client);
              } else if (attempts >= maxAttempts) {
                    clearInterval(intervalId);
                    reject(new Error('Unable to get result within 1 second'));
              }
        }, 100);
  });
}

// setup and start interactive viewport
async function startInteractiveViewport(_graphId)/* : void */ {
  // load resources referenced in the link-tag
  await ƒ.Project.loadResourcesFromHTML();
  ƒ.Debug.log("Project:", ƒ.Project.resources);

  // get the graph to show from loaded resources
  let graph/* : ƒ.Graph */ = ƒ.Project.resources[_graphId];
  ƒ.Debug.log("Graph:", graph);
  if (!graph) {
    alert("Nothing to render. Create a graph with at least a mesh, material and probably some light");
    return;
  }

  // setup the viewport
  let cmpCamera/* : ƒ.ComponentCamera */ = new ƒ.ComponentCamera();
  let canvas/* : HTMLCanvasElement */ = document.querySelector("canvas");
  let viewport/* : ƒ.Viewport */ = new ƒ.Viewport();
  viewport.initialize("InteractiveViewport", graph, cmpCamera, canvas);
  ƒ.Debug.log("Viewport:", viewport);

  viewport.draw();

  canvas.dispatchEvent(new CustomEvent("interactiveViewportStarted", { bubbles: true, detail: viewport }));
}