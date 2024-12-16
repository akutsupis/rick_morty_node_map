import requests
import json
import os


def fetch_rick_and_morty_data(endpoint):
    """
    Fetches all paginated data from the Rick and Morty API for a specified endpoint.

    Args:
        endpoint (str): The API endpoint to fetch data from (e.g., "character", "location", "episode").

    Returns:
        list: A list containing all the data retrieved from the API.
    """
    base_url = "https://rickandmortyapi.com/api/"
    url = f"{base_url}{endpoint}"
    all_data = []

    try:
        while url is not None:  # API uses a "next" URL to indicate more pages
            response = requests.get(url)
            response.raise_for_status()  # Check for HTTP errors
            data = response.json()
            all_data.extend(data["results"])  # Append the results from the current page

            # Update the URL to the next page (or None if there's no next page)
            url = data["info"]["next"]
    except requests.exceptions.RequestException as e:
        print(f"An error occurred while fetching data: {e}")
        return None

    return all_data


def save_data_as_json(data, filename):
    """
    Saves data to a JSON file.

    Args:
        data (list or dict): The data to save as JSON.
        filename (str): The name of the JSON file.
    """
    try:
        os.makedirs("../../data", exist_ok=True)  # Ensure the data directory exists
        filepath = os.path.join("../../data", filename)
        with open(filepath, "w") as file:
            json.dump(data, file, indent=2)
        print(f"Data successfully saved to {filepath}")
    except IOError as e:
        print(f"An error occurred while saving the file: {e}")


def download_all_rick_and_morty_data():
    """
    Downloads all data from the Rick and Morty API (characters, locations, episodes)
    and stores the data in JSON files.
    """
    endpoints = ["character", "location", "episode"]
    for endpoint in endpoints:
        print(f"Fetching data for {endpoint}...")
        data = fetch_rick_and_morty_data(endpoint)
        if data:
            save_data_as_json(data, f"{endpoint}.json")
        else:
            print(f"Failed to fetch data for {endpoint}")


if __name__ == "__main__":
    download_all_rick_and_morty_data()
    print("Data download complete.")
