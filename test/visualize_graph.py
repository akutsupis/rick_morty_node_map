import json
import networkx as nx
import matplotlib.pyplot as plt
from networkx.drawing.nx_pydot import graphviz_layout
import sys
import io

# Ensure UTF-8 Default Encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

class GraphVisualizer:
    """
    A class to load nodes and edges from JSON files and visualize the graph.
    """

    def __init__(self, nodes_file='..data/nodes.json', edges_file='..data/edges.json'):
        self.nodes_file = nodes_file
        self.edges_file = edges_file
        self.graph = nx.DiGraph()  # Directed Graph (if edges have direction)

    def load_data(self):
        """Load nodes and edges from JSON files."""
        with open(self.nodes_file, 'r') as f:
            self.nodes = json.load(f)

        with open(self.edges_file, 'r') as f:
            self.edges = json.load(f)

    def build_graph(self):
        """Build the graph using NetworkX from nodes and edges."""
        # Add nodes to the graph
        for node in self.nodes:
            self.graph.add_node(
                node['id'],
                label=node['label'],
                group=node.get('group', 'default'),
                image=node.get('image', None)
            )

        # Add edges to the graph
        for edge in self.edges:
            self.graph.add_edge(
                edge['from'],
                edge['to'],
                label=edge.get('label', 'relates_to')
            )

    def visualize_graph(self):
        """Visualize the graph using matplotlib."""
        # Assign colors to groups for visualization
        group_colors = {
            'character': 'red',
            'location': 'green',
            'episode': 'blue',
            'default': 'gray'
        }

        # Get node attributes for visualization
        node_colors = [
            group_colors[self.graph.nodes[node].get('group', 'default')]
            for node in self.graph.nodes
        ]

        # Create graph layout
        pos = graphviz_layout(self.graph, prog='dot')  # Layout for hierarchical graphs

        # Draw the graph
        plt.figure(figsize=(12, 8))
        nx.draw(
            self.graph,
            pos,
            with_labels=True,
            labels=nx.get_node_attributes(self.graph, 'label'),
            node_color=node_colors,
            node_size=500,
            font_size=10,
            font_color='white',
            edge_color='black',
            arrowsize=15
        )

        # Show edge labels
        edge_labels = nx.get_edge_attributes(self.graph, 'label')
        nx.draw_networkx_edge_labels(
            self.graph,
            pos,
            edge_labels=edge_labels,
            font_size=8
        )

        plt.title("Graph Visualization of Nodes and Edges")
        plt.show()


if __name__ == "__main__":
    # Initialize the GraphVisualizer
    visualizer = GraphVisualizer(nodes_file='..data/nodes.json', edges_file='..data/edges.json')

    # Load data from JSON files
    visualizer.load_data()

    # Build the graph from loaded nodes and edges
    visualizer.build_graph()

    # Visualize the graph
    visualizer.visualize_graph()