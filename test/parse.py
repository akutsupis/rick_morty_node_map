import json

# Load JSON data
with open('character.json') as f:
    characters = json.load(f)

with open('episode.json') as f:
    episodes = json.load(f)

with open('location.json') as f:
    locations = json.load(f)

# Prepare nodes and edges
nodes = []
edges = []

# Add character nodes
for character in characters:
    nodes.append({
        "id": character["id"],
        "label": character["name"],
        "group": "character"
    })

# Add episode nodes
for episode in episodes:
    nodes.append({
        "id": episode["id"],
        "label": episode["name"],
        "group": "episode"
    })

# Add location nodes
for location in locations:
    nodes.append({
        "id": location["id"],
        "label": location["name"],
        "group": "location"
    })

# Add edges between characters and episodes
for episode in episodes:
    for character_id in episode["characters"]:
        edges.append({
            "from": episode["id"],
            "to": character_id,
            "label": "appears_in"
        })

# Add edges between characters and locations
for character in characters:
    if character["location"]["name"]:
        edges.append({
            "from": character["id"],
            "to": character["location"]["id"],
            "label": "located_in"
        })

# Save prepared data to JSON
with open('nodes.json', 'w') as f:
    json.dump(nodes, f)

with open('edges.json', 'w') as f:
    json.dump(edges, f)