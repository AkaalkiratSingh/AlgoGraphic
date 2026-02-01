
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
        if (this.ops > 10000) {
            const msg = "Runtime Error: Execution limit exceeded (Infinite Loop?)";
            this.error(msg);
            // throw new Error(msg);
        }
    }

    _validateNode(id) {
        if (id < 0 || id >= this.getNodeCount()) {
            const msg = `Runtime Error: Node ID ${id} does not exist.`;
            this.error(msg);
            throw new Error(msg);
        }
    }

    _checkEdge(u, v) {
        this._validateNode(u);
        this._validateNode(v);
        return edges[u].includes(v);
    }

    getNeighbors(id) {
        this._tick();
        this._validateNode(id);
        return edges[id] ? [...edges[id]] : [];
    }

    getNodeCount() {
        return ((typeof nodeCount !== 'undefined') ? nodeCount : 0);
    }

    join(u, v) {
        this._tick();
        this._validateNode(u);
        this._validateNode(v);

        if (u === v) {
            this.error(`Runtime Error: Cannot join node ${u} to itself.`);
            // throw new Error(`Runtime Error: Cannot join node ${u} to itself.`);
        }

        if (this._checkEdge(u, v)) {
            this.log(`Warning: Edge between ${u} and ${v} already exists.`);
            return;
        }

        edges[u].push(v);
        edges[v].push(u);
        genGraphText();
        this.log(`Joined ${u} <--> ${v}`);
    }

    disconnect(u, v) {
        this._tick();
        this._validateNode(u);
        this._validateNode(v);

        if (!this._checkEdge(u, v)) {
            this.log(`Warning: No edge exists between ${u} and ${v} to disconnect.`);
            return;
        }

        edges[u] = edges[u].filter(n => n !== v);
        edges[v] = edges[v].filter(n => n !== u);
        genGraphText();
        this.log(`Disconnected ${u} -><- ${v}`);
    }

    colorNode(id, color) {
        this._tick();
        this._validateNode(id);
        visualState.nodeColors[id] = color;
    }

    colorEdge(u, v, color) {
        this._tick();
        this._validateNode(u);
        this._validateNode(v);
        const key = u < v ? `${u}-${v}` : `${v}-${u}`;
        visualState.edgeColors[key] = color;
    }

    resetColors() {
        visualState.nodeColors = {};
        visualState.edgeColors = {};
    }

    log(msg) {
        this._print(msg);
    }

    error(msg) {
        this._print(msg, 'red');
        throw new Error(msg);
    }

    _print(msg, className = "defaultMSG") {
        const consoleDiv = document.getElementById('console-output');
        if (!consoleDiv) return;

        const line = document.createElement('div');
        if (className) line.classList.add(className);

        line.textContent = `> ${msg}`;
        consoleDiv.appendChild(line);
        consoleDiv.scrollTop = consoleDiv.scrollHeight;
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
                api.error("Runtime Error : " + runtimeErr.message);
                console.error(runtimeErr);
            }
        }, 500);

    } catch (syntaxErr) {
        api.error("Syntax Error: " + syntaxErr.message);
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
