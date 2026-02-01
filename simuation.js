
const visualState = {
    nodeColors: {},
    edgeColors: {}
};


class GraphAPI {
    constructor() {
        this.ops = 0;
    }

    _tick() {
        this.ops++;
        if (this.ops > 10000) throw new Error("Execution limit exceeded (Infinite Loop?)");
    }


    getNeighbors(id) {
        this._tick();
        return edges[id] ? [...edges[id]] : [];
    }

    getNodeCount() {
        return nodeCount;
    }


    colorNode(id, color) {
        this._tick();
        visualState.nodeColors[id] = color;
    }

    colorEdge(u, v, color) {
        this._tick();
        const key = u < v ? `${u}-${v}` : `${v}-${u}`;
        visualState.edgeColors[key] = color;
    }

    resetColors() {
        visualState.nodeColors = {};
        visualState.edgeColors = {};
    }

    log(msg) {
        const consoleDiv = document.getElementById('console-output');
        const line = document.createElement('div');
        line.textContent = `> ${msg}`;
        consoleDiv.appendChild(line);
        consoleDiv.scrollTop = consoleDiv.scrollHeight
    }
}

let simulationTimer = null;

function runUserAlgorithm() {
    if (simulationTimer) clearInterval(simulationTimer);
    const consoleDiv = document.getElementById('console-output');
    consoleDiv.innerHTML = "";

    const api = new GraphAPI();
    api.resetColors();

    const rawCode = document.getElementById('CODE').value;

    const wrappedCode = `${rawCode}; return run;`;

    try {

        const generatorFunction = new Function(wrappedCode)();
        const iterator = generatorFunction(api);

        simulationTimer = setInterval(() => {
            try {
                const res = iterator.next();

                if (res.done) {
                    clearInterval(simulationTimer);
                    api.log("Finished.\n---------------------");
                }
            } catch (runtimeErr) {
                clearInterval(simulationTimer);
                api.log("Runtime Error: " + runtimeErr.message);
                console.error(runtimeErr);
            }
        }, 500);

    } catch (syntaxErr) {
        api.log("Syntax Error: " + syntaxErr.message);
        api.log("Note: Your function must be named 'run'");
    }
}

function clearVisuals() {
    if (simulationTimer) {
        clearInterval(simulationTimer);
        simulationTimer = null
    }

    visualState.nodeColors = {};
    visualState.edgeColors = {};
}

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById('RunBTN').addEventListener('click', runUserAlgorithm);
    document.getElementById('ClearBTN').addEventListener('click', clearVisuals);
});
