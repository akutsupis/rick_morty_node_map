import os
import json
import requests

# Create a folder to store the JSON data
DATA_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)


def fetch_data(endpoint):
    """
    Fetch data from the Rick and Morty API.

    This function retrieves data for each endpoint ('character', 'episode', or 'location')
    from the Rick and Morty API. It paginates through the results if necessary and combines
    all pages into a single list.

    Parameters
    ----------
    endpoint : str
        The specific API endpoint to fetch data from.

    Returns
    -------
    list
        A list of dictionaries containing the combined results fetched from the API across all pages.

    Raises
    ------
    Exception
        If the API returns a status code other than 200, an error is raised with details about the endpoint.

    Notes
    -----
    - Results are fetched in batches, based on the pagination information provided in each response.
    - Each page's data is appended to the `results` list, which is returned as the final output.
    """

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
    """
    Build a graph structure representing the relationships between characters, episodes, and locations.

    This function constructs a graph-like network, where:
    - `nodes` represent characters, episodes, or locations.
    - `edges` represent relationships such as characters appearing in episodes or residing in locations.

    Parameters
    ----------
    characters : list
        A list of dictionaries, each containing information about a character.
    episodes : list
        A list of dictionaries, each containing information about an episode.
    locations : list
        A list of dictionaries, each containing information about a location.

    Returns
    -------
    tuple
        A tuple containing two elements:
        - `nodes` (list): A list of dictionaries, each representing a node in the graph. Nodes have attributes
          such as `id`, `name`, `type`, and additional metadata depending on the type.
        - `edges` (list): A list of dictionaries, each representing an edge in the graph. Edges have attributes
          such as `source`, `target`, and `type`, indicating their relationship.

    Notes
    -----
    - Edges are generated for:
      - Characters appearing in episodes (`type="appeared_in"`).
      - Characters residing in locations (`type="resident_of"`).
    """

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
    """
    Save the generated graph structure (nodes and edges) to a JSON file.

    This function writes the nodes and edges of the network graph into a JSON file
    named "network.json" in the `data` folder. The file is written with an indentation
    of 2 spaces for readability.

    Parameters
    ----------
    nodes : list
        A list of dictionaries representing the nodes in the graph.
    edges : list
        A list of dictionaries representing the edges in the graph.

    Side Effects
    ------------
    - Creates a file named "network.json" in the `data` folder, saving the graph structure.

    Notes
    -----
    - If the `data` folder does not exist, it is created automatically before saving the file.
    - The generated JSON file contains two top-level keys: `nodes` and `edges`.
    """

    network = {"nodes": nodes, "edges": edges}
    filepath = os.path.join(DATA_FOLDER, "network.json")
    with open(filepath, "w") as f:
        json.dump(network, f, indent=2)
    print(f"Network data saved to {filepath}")


if __name__ == "__main__":
    """
    This script fetches characters, episodes, and locations data from the Rick and Morty API. 
    It then constructs a graph structure (nodes and edges) to represent the relationships between these entities.
    It then saves the graph to a JSON file.

    Workflow
    --------
    1. Fetch data using `fetch_data` for each endpoint ('character', 'episode', 'location').
    2. Build the graph structure using `build_network`.
    3. Save the nodes and edges to a JSON file with `save_network`.

    Notes
    -----
    - Internet connection required
    - The script is designed to be run as a standalone module
    - Since this is in Python and the website is in express.js, we can't run this script in prod.
    """

    print("Fetching data from API...")
    characters = fetch_data("character")
    episodes = fetch_data("episode")
    locations = fetch_data("location")

    print("Building network...")
    nodes, edges = build_network(characters, episodes, locations)

    print("Saving network...")
    save_network(nodes, edges)
    print("All done!")