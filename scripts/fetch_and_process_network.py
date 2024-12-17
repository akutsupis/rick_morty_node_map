import os
import json
import requests

# Create a folder to store the JSON data
DATA_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)


def fetch_data(endpoint):
    """Fetch data from Rick and Morty API by endpoint ('character', 'episode', 'location')."""
    results = []
    url = f"https://rickandmortyapi.com/api/{endpoint}"

    while url:
        response = requests.get(url)
        if response.status_code != 200:
            raise Exception(f"Error fetching {endpoint}: {response.status_code}")
        data = response.json()
        results.extend(data["results"])
        url = data["info"]["next"]

    print(f"Fetched {len(results)} {endpoint} entries.")
    return results


def build_network(characters, episodes, locations):
    """Build a graph structure with nodes for characters, episodes (shared appearances), and locations."""
    nodes = []
    edges = []

    # Add character nodes
    for char in characters:
        nodes.append({
            "id": f"char-{char['id']}",
            "type": "character",
            "name": char["name"],
            "species": char["species"] or "Unknown",
            "status": char["status"],
            "gender": char["gender"],
            "origin": char["origin"]["name"],
            "location": char["location"]["name"],
            "image": char["image"],  # Node uses this for images
        })

    # Add episode nodes and character-episode edges
    for ep in episodes:
        episode_id = f"ep-{ep['id']}"
        nodes.append({
            "id": episode_id,
            "type": "episode",
            "name": ep["name"],
            "air_date": ep["air_date"],
            "episode": ep["episode"]
        })

        # Connect each character to the episode
        for char_url in ep["characters"]:
            char_id = char_url.split("/")[-1]
            edges.append({
                "source": f"char-{char_id}",
                "target": episode_id,
                "type": "appeared_in"
            })

    # Add location nodes and character-location edges
    for loc in locations:
        location_id = f"loc-{loc['id']}"
        nodes.append({
            "id": location_id,
            "type": "location",
            "name": loc["name"],
            "dimension": loc["dimension"] or "Unknown",
            "location_type": loc["type"]
        })

        # Connect each character to the relevant location
        for char_url in loc["residents"]:
            char_id = char_url.split("/")[-1]
            edges.append({
                "source": f"char-{char_id}",
                "target": location_id,
                "type": "resident_of"
            })

    return nodes, edges


def save_network(nodes, edges):
    """Save the processed network to a JSON file."""
    network = {"nodes": nodes, "edges": edges}
    filepath = os.path.join(DATA_FOLDER, "network.json")
    with open(filepath, "w") as f:
        json.dump(network, f, indent=2)
    print(f"Network data saved to {filepath}")


if __name__ == "__main__":
    print("Fetching data from API...")
    characters = fetch_data("character")
    episodes = fetch_data("episode")
    locations = fetch_data("location")

    print("Building network...")
    nodes, edges = build_network(characters, episodes, locations)

    print("Saving network...")
    save_network(nodes, edges)
    print("All done!")