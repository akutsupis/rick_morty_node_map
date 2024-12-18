** Just my .md file as a .txt file because it's required. I'd recommend you just read readme.md**

# **Rick and Morty Interactive Network Map**

This project provides an **interactive network visualization** of characters, episodes, and locations from the TV show _Rick and Morty_. It fetches data from the [Rick and Morty API](https://rickandmortyapi.com), processes the data using Python, and visualizes it as a **force-directed graph** using D3.js.

The graph includes:
- **Nodes**: Characters, episodes, and locations, each scaled for size based on degree of connectivity.
- **Links**: All relationships between the nodes, such as:
  - Characters appearing in episodes.
  - Characters residing in locations.

## **Live Demo**
The project is hosted on the web at:
[https://rick-morty-node-map.onrender.com/](https://rick-morty-node-map.onrender.com/)

> _Note_: This project is hosted on the free tier, so you may need to wait a few moments for the server to spin up.

## **Features**
- Interactive graph with zoom, drag, and pan.
- Toggle between circular nodes and character images.
- Filter nodes based on types (Characters, Episodes, Locations).
- Search nodes by name and types (Characters, Episodes, Locations).
- Highlight connections to one particular node.

## **Interactions**
1. Checkbox toggles show/hide node types or switch between circular nodes categorized by type and images of characters.
2. Search tool filters nodes by name or type.
3. Clicking a node with "Highlight Selected Nodes" checked focuses on its relationships and rearranges the graph.
4. Clicking on a node always displays the node's data, including character images.

## **Requirements**
Before running the project, make sure you have the following installed:
- **Python**: Version 3.10 or higher.
- **Node.js**: Version 16 or higher with npm.
- Necessary Python packages:
  - `requests`

## **Network Structure**
The graph (and its underlying `network.json` file) is organized like this:
- **Nodes**:
  - **Characters**: Represent individuals from the show.
  - **Episodes**: Represent episodes in which characters appear.
  - **Locations**: Represent places associated with characters.
- **Edges**:
  - Connect **Characters** to the **Episodes** they appear in.
  - Connect **Characters** to the **Locations** they reside in.

### Relationships:
- A character connects to the episodes they appear in and the location they are _from_.
- Locations are linked to _characters_, and never linked to _episodes_.
- No selected node will connect to additional nodes of the same type.
- Every character is connected to at least one episode and one location.

## **Setup Instructions**
1. Install Python dependencies using `pip install -r requirements.txt`
2. Run `python DataStructure.py` to download and create the network json files.
2. Run `npm install` to install required Node.js dependencies.
3. Use `node app.js` to launch the server.
4. Open your browser and navigate to [http://localhost:3000](http://localhost:3000).

> The Rick and Morty API does not require any API key for access.
