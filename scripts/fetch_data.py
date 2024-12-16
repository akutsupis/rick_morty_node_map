import os
import json
import requests

# Create a folder to store the JSON data
DATA_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data")
if not os.path.exists(DATA_FOLDER):
    os.makedirs(DATA_FOLDER)


# Fetch API data function
def fetch_api_data():
    BASE_URL = "https://rickandmortyapi.com/api"
    ENDPOINTS = ["character", "location", "episode"]
    all_data = {}

    for endpoint in ENDPOINTS:
        results = []
        url = f"{BASE_URL}/{endpoint}"
        print(f"Fetching data from {url}")

        while url:
            response = requests.get(url)
            if response.status_code != 200:
                raise Exception(f"Error fetching {endpoint}: {response.status_code}")
            data = response.json()
            results.extend(data["results"])
            url = data["info"]["next"]  # Get next page URL

        all_data[endpoint] = results
        print(f"Fetched {len(results)} records from {endpoint}")

    return all_data


# Save data to a JSON file
def save_to_json(data):
    filepath = os.path.join(DATA_FOLDER, "rick-and-morty-data.json")
    with open(filepath, "w") as f:
        json.dump(data, f, indent=2)
    print(f"Data saved to {filepath}")


if __name__ == "__main__":
    print("Starting data fetch...")
    data = fetch_api_data()
    save_to_json(data)
    print("Data fetch complete!")