The script `DataStructure.py` fetches data from the **Rick and Morty API** to build a network graph that contains **nodes** (characters, episodes, and locations) and **edges** (relationships between these nodes). These are stored in a JSON format with two main keys: `nodes` and `edges`.
#### API Explanation
- The Rick and Morty API provides data about the characters, episodes, and locations from the TV show _Rick and Morty_.
- The API endpoints used in this project are:
    - `https://rickandmortyapi.com/api/character/`: Fetches data about characters.
    - `https://rickandmortyapi.com/api/episode/`: Fetches data about episodes.
    - `https://rickandmortyapi.com/api/location/`: Fetches data about locations.
- The data is paginated, with each page containing a maximum of 20 items. DataStructure.py iterates through the pages and retrieves all of the data for each endpoint.
- The format is a JSON object with the keys `info`, `results`, and `next`. 
  - The `info` endpoint has a summary of the endpoint's data. 
  - The `results` key contains an array of items 
  - The `next` key provides the URL for the next page of results.
- There are 826 characters, 126 locations, and 51 episodes in the dataset as of Dec 18, 2024.


#### Structure Breakdown
1. **Nodes**
    - Nodes represent each entity in the network.
    - Each node is tagged with its type (`character`, `episode`, `location`) and includes metadata specific to its type.

2. **Edges**
    - Edges describe the relationships between nodes.
    - Each edge consists of:
        - A `source` node.
        - A `target` node.
        - The `type` of relationship (e.g., `appeared_in`, `resident_of`).



Here is an example of a character node:
``` json
{
"id": "char-1",                        // Unique node ID prefixed with 'char-'
"type": "character",                   // Node type
"name": "Rick Sanchez",                // Character's name
"species": "Human",                    // Species of the character
"status": "Alive",                     // Status of the character (e.g., "Alive", "Dead")
"gender": "Male",                      // Gender of the character
"origin": "Earth (C-137)",             // The character's origin
"location": "Citadel of Ricks",        // Current location of the character
"image": "https://rickandmortyapi.com/api/character/avatar/1.jpeg" // URL to the character's image
}
```

Here is an episode node:
1. **Episode Node**
``` json
   {
       "id": "ep-1",                          // Unique node ID prefixed with 'ep-'
       "type": "episode",                     // Node type
       "name": "Pilot",                       // Episode title
       "air_date": "December 2, 2013",        // Original air date
       "episode": "S01E01"                    // Season and episode code
   }
```

Here is a location node:
``` json
   {
       "id": "loc-1",                        // Unique node ID prefixed with 'loc-'
       "type": "location",                   // Node type
       "name": "Earth (C-137)",              // Location name
       "dimension": "C-137 Dimension",       // Dimension where the location exists
       "location_type": "Planet"             // Type of location
   }
```

Edges represent relationships between the nodes. The possible relationships are:
1. **Character Appearing in an Episode**
``` json
   {
       "source": "char-108",                  // ID of the character (source)
       "target": "ep-3",                      // ID of the episode (target)
       "type": "appeared_in"                  // Relationship type
   }
```
1. **Character Residing in a Location**
``` json
   {
       "source": "char-110",                  // ID of the character (source)
       "target": "loc-5",                     // ID of the location (target)
       "type": "resident_of"                  // Relationship type
   }
```
