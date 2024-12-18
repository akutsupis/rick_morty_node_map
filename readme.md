# **Rick and Morty Interactive Network Map**
This project provides an **interactive network visualization** of characters, episodes, and locations from the TV show _Rick and Morty_. It fetches data from the [Rick and Morty API](), processes the data using Python, and visualizes it as a **force-directed graph** using D3.js.
The graph dynamically represents:
- Nodes: Characters, episodes, and locations, each styled and scaled based on metadata (e.g., degree of connectivity).
- Links: Relationships between the nodes, such as:
    - Characters appearing in episodes.
    - Characters residing in locations.

Users can zoom, drag nodes, toggle visibility, filter by node types, and interactively highlight nodes to focus on their relationships.
## **Live Demo**
The project is hosted on the web at:
[https://rick-morty-node-map.onrender.com/]()

> _Note_: This project is hosted on a free tier, so you may need to wait a few moments for the server to spin up.
> 

## **Features**
- Interactive graph with zoom, drag, and pan capabilities.
- Toggle between circular nodes and character images.
- Filter nodes based on types (Characters, Episodes, Locations).
- Search nodes by name and types (Characters, Episodes, Locations).
- Highlight connections to one particular node.

## **Requirements**
Before running the project, make sure you have the following installed:
- **Python**: Version 3.10 or higher.
- **Node.js**: Version 16 or higher with npm.

## **Setup Instructions**
### **1. Fetch and Process Data**
This step involves fetching data from the Rick and Morty API and processing it into a format suitable for visualization.
1. Install the necessary Python dependencies: