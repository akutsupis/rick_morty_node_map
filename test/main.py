from data_loader import DataLoader

def load_data():
    data_loader = DataLoader()
    data_loader.save_to_json()
    return data_loader.get_characters(), data_loader.get_episodes(), data_loader.get_locations(), data_loader.get_nodes(), data_loader.get_edges()

if __name__ == "__main__":
    characters, episodes, locations, nodes, edges = load_data()
    print(f"Loaded {len(characters)} characters.")
    print(f"Loaded {len(episodes)} episodes.")
    print(f"Loaded {len(locations)} locations.")
    print(f"Generated {len(nodes)} nodes.")
    print(f"Generated {len(edges)} edges.")