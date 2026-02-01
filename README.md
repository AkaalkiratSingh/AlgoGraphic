# AlgoGraphic
**A Scriptable, Force-Directed Graph Algorithm Visualizer.**

AlgoGraphic is an interactive environment that users to write graph algorithms in JavaScript and visualize their execution step-by-step on a live, force-directed graph. Unlike standard visualizers with pre-baked algorithms, AlgoGraphic puts **you** in control, offering a custom API to script your own traversals, searches, and pathfinding logic.

---

##  Key Features

* **Scriptable Sandbox:** Write your own algorithms using standard JavaScript directly in the browser.

* **Generator-Based Animation:** Utilizes ES6 Generators (`function*` and `yield`) to handle step-by-step execution control. While writing te algorithms, the user can access the graph via a G(an object exposed to the user that allows the user to access the graph safely).

* **Force-Directed Layout:** Powered by **p5.js**, the graph self-organizes using physics-based nodes that can be dragged and rearranged in real-time.

All Nodes repel each other, and neighbouring nodes apply an attractive force on each other
1. Repulsive Force ($f_r$): Calculated for all pairs of nodes to prevent overlapping and ensure a uniform distribution across the canvas.$$f_r(d) = \frac{k^2}{d}$$2. Attractive Force ($f_a$): Calculated only for pairs of nodes $(u, v)$ connected by an edge, acting like a spring to maintain the structure.$$f_a(d) = \frac{d^2}{k}$$
---

## How It Works

The core of the visualization engine relies on **JavaScript Generator Functions**.

Standard JavaScript runs to completion immediately, which makes visualizing algorithms difficult. AlgoGraphic solves this by expecting a generator function named `run(G)`.

1.  **The `yield` Keyword:** When you write `yield;` inside your loop, the algorithm pauses execution.
2.  **The Render Cycle:** The visualizer catches this pause, draws the current state of the graph (colors, highlights) to the canvas, and waits for a specific tick rate.
3.  **Resume:** The visualizer resumes the function from where it left off.

This allows you to write linear, readable code (like a standard `while` loop) that acts like an animation.

---

## Accessing the Graph

Your algorithm must be a generator function named `run` that accepts the Graph API object `G`.

`function* run(G) { ... }`

### The `G` Object Methods

| Method | Parameters | Description |
| :--- | :--- | :--- |
| **`G.getNeighbors(id)`** | `id` (int)  | Returns an array of node IDs connected to the given node. |
| **`G.getNodeCount()`** | *none* | Returns the total number of nodes in the current graph. |
| **`G.colorNode(id, color)`** | `id` (int), `color` (string) | Colors a specific node. Accepts color in Hexcode(RGB) as string|
| **`G.colorEdge(u, v, color)`** | `u` (int), `v` (int), `color` (string) | Colors the edge connecting node `u` and node `v`. Accepts color in Hexcode(RGB) as string |
| **`G.log(message)`** | `message` (string) | Prints a message to the internal sandbox console. |
| **`G.resetColors()`** | *none* | Resets all nodes and edges to their default visual state. |
|**`G.join(u, v)`**|`u` (int), `v` (int)|Creates a new undirected edge between node `u` and node `v`.|
|**`G.disconnect(u, v)`**|`u` (int), `v` (int)|Removes the existing edge between node `u` and node `v`.|
---

## 💻 Example Code

These are some example implementations. Copy them and paste directly into the coding window and Press Run to See the code in Action

**BFS Implementation**
```javascript
function* run(G) {
    // Example: BFS

    const colors = {
        visiting:"#e5c07b", // Gold
        visited: "#56b6c2", // Cyan
        done:    "#1a8aef", // Blue
        edge:    "#e06c75"  // Red
    };

    let start = 0;   // Starting Position
    let Q = [start]; // Queue for BFS implementation
    let visited = new Set([start]); 

    G.log("Starting BFS from " + start);
    G.colorNode(start, colors.visiting);
    yield; // Pause to show start

    while(Q.length > 0) {
        let curr = Q.shift(); 
        G.colorNode(curr, colors.visiting); // Color the Current node to be Golden 
        yield; // Pause

        let neighbors = G.getNeighbors(curr); // Find the neighbours of the current node
        for(let n of neighbors) {
            if(!visited.has(n)) {
                visited.add(n);
                G.colorEdge(curr, n, colors.edge); // Color the currently traversed edge
                G.colorNode(n, colors.visited);
                G.log("Visiting " + n);
                Q.push(n);
                yield; // Pause
            }
        }
        G.colorNode(curr, colors.done);
    }
    G.log("BFS Completed");
}
```

**DFS Implementation**
```javascript
function* run(G) {
  // Example: DFS

const colors = {
    visiting:"#e5c07b", // Gold
    visited: "#56b6c2", // Cyan
    done:    "#1a8aef", // Blue
    edge:    "#e06c75"  // Red
  };

  let start = 0;        //Starting Position
  let stack = [start];  //Stack for DFS Implementation (JS does not natively support Stack so we will use a list)
  let visited = new Set();

  G.log("Starting DFS from " + start);
  G.colorNode(start, colors.visiting);
  yield; // Pause

  while (stack.length > 0) {
    let u = stack.pop();

    if (!visited.has(u)) {
        visited.add(u);
        
        G.colorNode(u, colors.visiting);
        G.log("Visiting " + u);
        yield; // Pause

        let neighbors = G.getNeighbors(u);
        
        for (let v of neighbors) {
            if (!visited.has(v)) {
                G.colorEdge(u, v, colors.edge);
                G.colorNode(v, colors.visited);
                yield;
            }
        }
        //The list of neighbors is reversed and appended (only unvisited ones) to the back of the stack
        neighbors.sort((a, b) => b - a);
            for (let v of neighbors) {
                if (!visited.has(v)) {
                    stack.push(v);
                }
        }

        // Mark node as fully finished
        G.colorNode(u, colors.done);
    }
  }

  G.log("DFS Traversal Complete.");
}
```