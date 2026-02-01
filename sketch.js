let angle = 0;

// nodes holds the positions of nodes and velocities of the nodes in vector form and edges holds the connections between nodes
let diameter = 50;
let nodeCount = 15;
let nodes = [];
let velocities = [];
let edges = [];//Adjacency list representation of edges

let T;
let k; // ideal edge length
let edgeProb = 0.15;

let draggingNode = -1;
let offset;

let gray = '#4b5263';

function setup() {
    let container = select('#canvas-container');
    let canvas = createCanvas(container.width, container.height);
    canvas.parent('canvas-container');

    const btn = document.getElementById('ResetBTN');
    btn.addEventListener('click', reset);
    const txtArea = document.querySelector("#graphTEXT");
    txtArea.addEventListener('change', setupFromText);

    rectMode(CENTER);
    textAlign(CENTER, CENTER);
    textSize(max(16, diameter / 4));

    reset()
}

function draw() {
    background(34);

    //genGraphText();
    updateNodes();
    updateT();
    drawEdges(); drawNodes();
}

function reset() {
    nodeCount = select('#Number_Of_Nodes').value();
    edgeProb = select('#Probability').value();

    nodes = [];
    velocities = [];
    edges = [];

    for (let i = 0; i < nodeCount; i++) {
        let position = createVector(diameter + random(width - 2 * diameter), diameter + random(height - 2 * diameter));
        nodes.push(position);
        velocities.push(createVector(0, 0));
    }
    genConnections(edgeProb);

    k = sqrt((width * height) / nodeCount);
    T = width / 10;
    genGraphText();
}

function genGraphText() {
    let graphText = "";
    for (let i = 0; i < nodeCount; i++) {
        graphText += i + "\t: ";
        edges[i].sort((a, b) => a - b);
        for (let j of edges[i]) {

            graphText += j + " ";
        }
        graphText += "\n";
    }

    document.querySelector("#graphTEXT").value = graphText;
}


function genConnections(p) {
    for (let i = 0; i < nodeCount; i++) {
        edges.push([]);
    }
    for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
            if (random() < p) {
                edges[i].push(j);
                edges[j].push(i);
            }
        }
    }
}
function setupFromText() {
    let graphText = document.querySelector("#graphTEXT").value.trim();
    if (!graphText) return;

    let lines = graphText.split('\n').filter(line => line.trim().length > 0);
    let newNodeCount = lines.length;
    document.querySelector('#Number_Of_Nodes').value = newNodeCount;

    edges = Array.from({ length: newNodeCount }, () => []);
    if (newNodeCount > nodes.length) {
        for (let i = nodes.length; i < newNodeCount; i++) {
            nodes.push(createVector(diameter + random(width - 2 * diameter), diameter + random(height - 2 * diameter)));
            velocities.push(createVector(0, 0));
        }
    } else if (newNodeCount < nodes.length) {
        nodes.splice(newNodeCount);
        velocities.splice(newNodeCount);
    }

    nodeCount = newNodeCount;

    for (let line of lines) {
        let parts = line.split(':');
        if (parts.length < 2) continue;

        let v = parseInt(parts[0].trim());
        if (isNaN(v) || v >= nodeCount) continue;

        let neighbours = parts[1].trim().split(/\s+/);
        for (let n of neighbours) {
            let u = parseInt(n);
            if (!isNaN(u) && u < nodeCount && u !== v) {
                if (!edges[v].includes(u)) edges[v].push(u);
                if (!edges[u].includes(v)) edges[u].push(v);
            }
        }
    }


    k = sqrt((width * height) / nodeCount);
    T = width / 10;

    genGraphText();
}

function updateNodes() {
    if (T < 0.01) return;

    for (let i = 0; i < nodeCount; i++) {

        if (i === draggingNode) continue;

        let F = createVector(0, 0);
        let dv = createVector(0, 0);
        for (let j = 0; j < nodeCount; j++) {
            if (i != j) {
                let d = p5.Vector.dist(nodes[i], nodes[j]);
                let n = p5.Vector.sub(nodes[j], nodes[i]);
                n.normalize();

                let Fr = p5.Vector.mult(n, -k * k / (4 * d));
                if (d < diameter) {
                    Fr.mult(5);
                }
                let Fa = p5.Vector.mult(n, 2 * d * d / k);

                if (edges[i].includes(j)) {
                    Fr.mult(4);
                    F.add(Fa);
                }
                F.add(Fr);
            }
        }

        //Centering force
        let Fc = createVector(width / 2 - nodes[i].x, height / 2 - nodes[i].y);
        let magnitude = Fc.mag();
        if (magnitude > 0.1) {
            Fc.mult(magnitude / 200);
        }
        Fc.div(1.5 * (nodeCount + 1 - edges[i].length));
        //Boosting isolated notes
        if (edges[i].length == 0) Fc.mult(2 * nodeCount);
        F.add(Fc);


        dv = p5.Vector.mult(F, deltaTime / 1000);
        if (dv.mag() > T) {
            dv.setMag(T);
        }
        velocities[i].add(dv);

        nodes[i].add(p5.Vector.mult(velocities[i], deltaTime / 1000));
        if (nodes[i].x > width - diameter / 2) {
            nodes[i].x = width - diameter / 2;
            velocities[i].x -= 10.5;
        }
        if (nodes[i].x < diameter / 2) {
            nodes[i].x = diameter / 2;
            velocities[i].x += 10.5;
        }
        if (nodes[i].y > height - diameter / 2) {
            nodes[i].y = height - diameter / 2;
            velocities[i].y -= 10.5;
        }
        if (nodes[i].y < diameter / 2) {
            nodes[i].y = diameter / 2;
            velocities[i].y += 10.5;
        }
        velocities[i].mult(0.92);
    }
}

function drawEdges() {
    strokeWeight(2);
    for (let i = 0; i < nodeCount; i++) {
        let from = nodes[i];
        for (let j of edges[i]) {
            if (j > i) {
                let to = nodes[j];

                let key = `${i}-${j}`;
                if (typeof visualState !== 'undefined' && visualState.edgeColors[key]) {
                    stroke(visualState.edgeColors[key]);
                    strokeWeight(4);
                } else {
                    stroke(gray);
                    strokeWeight(2);
                }


                line(from.x, from.y, to.x, to.y);
            }
        }
    }
}
function drawNodes() {
    // stroke(gray);
    for (let i = 0; i < nodeCount; i++) {
        let pos = nodes[i];

        let borderColor = gray;

        if (typeof visualState !== 'undefined' && visualState.nodeColors[i]) {
            borderColor = visualState.nodeColors[i];
        }
        fill(0);
        stroke(borderColor);
        strokeWeight(1);
        ellipse(pos.x, pos.y, diameter, diameter);
        strokeWeight(2);

        fill(255);
        text(i, pos.x, pos.y);
    }
}

function updateT() {
    let E = 0;
    for (let v of velocities) {
        E += v.magSq();
    }
    let epn = E / nodeCount;
    if (epn > 1) {
        T *= 0.99;
    } else {
        T *= 0.90;
    }

    if (T < 0.01 || epn < 0.001) {
        T = 0;
        for (let v of velocities) v.set(0, 0);
    }
}

function mousePressed() {
    for (let i = 0; i < nodeCount; i++) {
        let d = dist(mouseX, mouseY, nodes[i].x, nodes[i].y);
        if (d < diameter / 2) {
            draggingNode = i;
            offset = createVector(nodes[i].x - mouseX, nodes[i].y - mouseY);
            break;
        }
    }
}
function mouseDragged() {
    if (draggingNode !== -1) {
        nodes[draggingNode].x = mouseX + offset.x;
        nodes[draggingNode].y = mouseY + offset.y;

        velocities[draggingNode].set(0, 0);

        if (T < width / 50) T = width / 20;
    }
}
function mouseReleased() {
    draggingNode = -1;
}

function windowResized() {
    let container = select('#canvas-container');
    resizeCanvas(container.width, container.height);
}

// Making variables accessible to simuation.js
window.genGraphText = genGraphText;
window.edges = edges; 
window.nodeCount = nodeCount;