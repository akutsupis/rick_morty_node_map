import json
import os

def extract_id_from_url(url):
    return int(url.split("/")[-1])

class DataLoader:
    def __init__(self, base_path='../data'):
        self.base_path = base_path
        self.characters = []
        self.episodes = []
        self.locations = []
        self.nodes = []
        self.edges = []
        self.load_all_data()

    def load_all_data(self):
        character_file = os.path.join(self.base_path, 'character.json')
        episode_file = os.path.join(self.base_path, 'episode.json')
        location_file = os.path.join(self.base_path, 'location.json')

        if os.path.exists(character_file):
            with open(character_file, 'r') as f:
                self.characters = json.load(f)
        else:
            print(f"Character file not found at {character_file}")

        if os.path.exists(episode_file):
            with open(episode_file, 'r') as f:
                self.episodes = json.load(f)
        else:
            print(f"Episode file not found at {episode_file}")

        if os.path.exists(location_file):
            with open(location_file, 'r') as f:
                self.locations = json.load(f)
        else:
            print(f"Location file not found at {location_file}")

    def generate_nodes_and_edges(self):
        self.nodes = []
        self.edges = []

        # Add character nodes
        for character in self.characters:
            self.nodes.append({
                "id": character["id"],
                "label": character["name"],
                "group": "character",
                "image": character["image"]
            })

        # Add episode nodes
        for episode in self.episodes:
            self.nodes.append({
                "id": episode["id"],
                "label": episode["name"],
                "group": "episode"
            })

        # Add location nodes
        for location in self.locations:
            self.nodes.append({
                "id": location["id"],
                "label": location["name"],
                "group": "location"
            })

        # Add edges: characters <-> episodes (appears_in)
        for episode in self.episodes:
            for character_url in episode["characters"]:
                character_id = extract_id_from_url(character_url)
                self.edges.append({
                    "from": episode["id"],
                    "to": character_id,
                    "label": "appears_in"
                })

        # Add edges: characters <-> locations (located_in)
        for character in self.characters:
            if character["location"]["name"] and character["location"]["url"]:
                location_id = extract_id_from_url(character["location"]["url"])
                self.edges.append({
                    "from": character["id"],
                    "to": location_id,
                    "label": "located_in"
                })

        # Add edges: locations <-> residents (resides_in)
        for location in self.locations:
            for resident_url in location["residents"]:
                resident_id = extract_id_from_url(resident_url)
                self.edges.append({
                    "from": resident_id,
                    "to": location["id"],
                    "label": "resides_in"
                })

    def save_to_json(self, nodes_file='../data/nodes.json', edges_file='../data/edges.json'):
        self.generate_nodes_and_edges()
        with open(nodes_file, 'w') as f:
            json.dump(self.nodes, f, indent=4)
        with open(edges_file, 'w') as f:
            json.dump(self.edges, f, indent=4)
        print(f"Nodes saved to {nodes_file}")
        print(f"Edges saved to {edges_file}")

    def get_characters(self):
        return self.characters

    def get_episodes(self):
        return self.episodes

    def get_locations(self):
        return self.locations

    def get_nodes(self):
        return self.nodes

    def get_edges(self):
        return self.edges