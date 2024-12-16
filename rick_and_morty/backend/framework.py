from flask import Flask, request, jsonify
from flask_cors import CORS
import json
from collections import defaultdict

app = Flask(__name__)
CORS(app)  # Allow requests from different origins (like Vercel frontend)

# Mock data (use Rick and Morty API data here)
mock_data = [
    {"id": 1, "name": "Rick Sanchez", "species": "Human", "location": "Earth", "episode": ["E1", "E2"]},
    {"id": 2, "name": "Morty Smith", "species": "Human", "location": "Earth", "episode": ["E1", "E3"]},
    {"id": 3, "name": "Birdperson", "species": "Bird", "location": "Bird World", "episode": ["E2", "E3"]}
]


# Generate node map dynamically
def generate_node_map(data, attribute):
    nodes = []
    edges = []
    groups = defaultdict(list)

    # Group characters by specified attribute
    for character in data:
        value = character[attribute]
        groups[value].append(character["id"])

    # Nodes
    for character in data:
        nodes.append({"id": character["id"], "label": character["name"]})

    # Edges
    for group, ids in groups.items():
        for i in range(len(ids)):
            for j in range(i + 1, len(ids)):
                edges.append({"source": ids[i], "target": ids[j], "label": group})

    return {"nodes": nodes, "edges": edges}


# API endpoint: Generate node map
@app.route('/api/node-map', methods=['GET'])
def node_map():
    attribute = request.args.get('attribute', default='species')
    node_map = generate_node_map(mock_data, attribute)
    return jsonify(node_map)


if __name__ == '__main__':
    app.run(debug=True)  # For local testing