/**
 * @file graph.js
 *
 * This file handles the fetching, processing, and rendering of a force-directed graph visualization
 * in a web-based application. It utilizes the D3.js library to create an interactive graph of
 * nodes (characters, episodes, and locations) and edges representing their relationships.
 *
 * The graph is rendered using scalable vector graphics (SVG) and supports interactive features such
 * as zooming, dragging nodes, toggling images, and filtering node types. Additionally, the layout
 * is dynamically adjusted using D3's force simulation.
 *
 * Dependencies:
 * - D3.js library for rendering and force-directed layout simulations.
 */

fetch('/data/network.json')
    .then((response) => response.json())
    .then((data) => {
        const nodes = data.nodes; // List of all nodes (characters, episodes, and locations)
        const links = data.edges; // List of edges connecting nodes

        console.log("Total nodes loaded:", nodes.length);

        const width = window.innerWidth * 0.9;  // Width of the SVG canvas
        const height = window.innerHeight * 0.7;  // Height of the SVG canvas

        // DOM elements for toggles and search
        const togglePhotos = document.getElementById('togglePhotos');  // Toggle for displaying photos
        const toggleCharacters = document.getElementById('toggleCharacters');  // Toggle for displaying character nodes
        const toggleEpisodes = document.getElementById('toggleEpisodes');  // Toggle for displaying episode nodes
        const toggleLocations = document.getElementById('toggleLocations');  // Toggle for displaying location nodes

        // Create a map for node lookup by ID
        const nodeMap = new Map(nodes.map(node => [node.id, node]));

        // Validate links to ensure their source and target nodes exist
        const validLinks = links.filter(link => nodeMap.has(link.source) && nodeMap.has(link.target));

        // Calculate node degrees and set up the size scale
        const degreeMap = {};
        validLinks.forEach((link) => {
            degreeMap[link.source] = (degreeMap[link.source] || 0) + 1;
            degreeMap[link.target] = (degreeMap[link.target] || 0) + 1;
        });
        nodes.forEach((node) => {
            node.degree = degreeMap[node.id] || 0;
        });

        // Scale for node size based on degree
        const sizeScale = d3.scaleSqrt()
            .domain([0, d3.max(nodes, (d) => d.degree)])
            .range([5, 70]);

        // Set up SVG with zoom functionality
        const svg = d3.select('#graph')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .call(
                d3.zoom()
                    .scaleExtent([0.3, 2]) // Min, Max zoom levels
                    .on('zoom', (event) => g.attr('transform', event.transform))
            )
            .append('g');

        const g = svg.append('g');

        // Add links
        const link = g.append('g')
            .selectAll('line')
            .data(validLinks)
            .enter()
            .append('line')
            .attr('stroke-width', 2)
            .attr('stroke', '#aaa');

        // Bind nodes with unique ID; handle undefined IDs (just in case)
        const node = g.selectAll('g')
            .data(nodes, d => d && d.id ? d.id : null)
            .enter()
            .append('g')
            .call(
                d3.drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended)
            );

        console.log("Nodes after initializing:", node.size());

        // Append circles for each node
        node.append("circle")
            .attr("r", (d) => sizeScale(d.degree))
            .attr("fill", (d) => {
                if (d.type === "character") return "#69b3a2";
                if (d.type === "episode") return "#ff8c00";
                if (d.type === "location") return "#6a5acd";
                return "#ccc";
            });

        // Append images for nodes (hidden by default)
        node.append("image")
            .attr("xlink:href", (d) => d.image || "")
            .attr("width", (d) => sizeScale(d.degree) * 2)
            .attr("height", (d) => sizeScale(d.degree) * 2)
            .attr("x", (d) => -sizeScale(d.degree))
            .attr("y", (d) => -sizeScale(d.degree))
            .style("display", "none");

        // Append labels below nodes
        node.append('text')
            .attr('dy', (d) => sizeScale(d.degree) + 5)
            .attr('text-anchor', 'middle')
            .text((d) => d.name);

        // Add click event listener to the node (circle or image container)
        node.on('click', function(event, d) {
            displayMetadata(event, d);
            if (highlightNodeToggle.checked) {
                rearrangeAroundNode(d);
            }
        });

        // Simulation setup for force layout, after node initialization
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(validLinks).id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .on('tick', ticked);

        /**
         * Apply filtering based on user toggles and search input.
         */
        function applyFilters() {
            const showPhotos = togglePhotos.checked;
            const showCharacters = toggleCharacters.checked;
            const showEpisodes = toggleEpisodes.checked;
            const showLocations = toggleLocations.checked;

            // Toggle between circles and photos
            node.each(function(d) {
                const group = d3.select(this);
                group.select('circle').style('display', showPhotos ? 'none' : 'block');
                group.select('image').style('display', showPhotos ? 'block' : 'none');
            });

            // Update visibility based on toggles and search
            const searchInput = document.getElementById('nodeSearch').value.toLowerCase();
            const typeFilter = document.getElementById('typeFilter').value;

            node.style('display', function(d) {
                const matchesSearch = d.name.toLowerCase().includes(searchInput);
                const typeVisible =
                    (showCharacters && d.type === 'character') ||
                    (showEpisodes && d.type === 'episode') ||
                    (showLocations && d.type === 'location');

                const matchesType = typeFilter === 'all' || d.type === typeFilter;
                return matchesSearch && typeVisible && matchesType ? 'block' : 'none';
            });

            // Update link visibility based on node visibility
            link.style('display', d => {
                const sourceVisible = d3.select(`g[id="${d.source.id}"]`).style('display') !== 'none';
                const targetVisible = d3.select(`g[id="${d.target.id}"]`).style('display') !== 'none';
                return sourceVisible && targetVisible ? 'block' : 'none';
            });
        }

        // Add event listeners for dynamic filtering
        document.getElementById('nodeSearch').addEventListener('input', applyFilters);
        document.getElementById('typeFilter').addEventListener('change', applyFilters);
        document.getElementById('resetFilters').addEventListener('click', () => {
            document.getElementById('nodeSearch').value = '';
            document.getElementById('typeFilter').value = 'all';
            applyFilters();
        });

        [togglePhotos, toggleCharacters, toggleEpisodes, toggleLocations].forEach((toggle) =>
            toggle.addEventListener('change', applyFilters)
        );

        /**
         * Update node and link positions on each tick of the simulation.
         */
        function ticked() {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        }

        // Drag behavior functions
        /**
         * Handle the start of a drag event.
         * @param {Object} event - D3 drag event object.
         * @param {Object} d - Data bound to the dragged node.
         */
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        /**
         * Handle dragging behavior.
         * @param {Object} event - D3 drag event object.
         * @param {Object} d - Data bound to the dragged node.
         */
        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        /**
         * Handle the end of a drag event.
         * @param {Object} event - D3 drag event object.
         * @param {Object} d - Data bound to the dragged node.
         */
        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        const highlightNodeToggle = document.getElementById('highlightNodeToggle'); // Checkbox for enabling node highlight
        let focusedNode = null; // Currently focused node

        /**
         * Rearrange graph nodes around the specified node.
         * @param {Object} node - Node to rearrange around.
         */
        function rearrangeAroundNode(node) {
            if (highlightNodeToggle.checked) {
                focusedNode = node;

                // Fix the clicked node in the center and adjust simulation forces
                simulation
                    .alpha(0.5)
                    .force('center', d3.forceCenter(width / 2, height / 2))
                    .force('charge', d3.forceManyBody().strength(-50))
                    .force('link', d3.forceLink(validLinks).id(d => d.id).distance(d => {
                        if (d.source.id === node.id || d.target.id === node.id) return 100;
                        return 300;
                    }))
                    .restart();

                // Adjust link and node styles based on focus
                link.style('stroke', d => (d.source.id === node.id || d.target.id === node.id) ? '#ff0000' : '#aaa')
                    .style('display', d => (d.source.id === node.id || d.target.id === node.id) ? 'block' : 'none');

                node.style('opacity', d => (d.id === node.id || validLinks.some(l => l.source === node || l.target === node)) ? 1 : 0.3);
            }
        }

        highlightNodeToggle.addEventListener('change', () => {
            if (!highlightNodeToggle.checked) {
                focusedNode = null;

                simulation
                    .alpha(0.5)
                    .force('center', d3.forceCenter(width / 2, height / 2))
                    .force('charge', d3.forceManyBody().strength(-200))
                    .force('link', d3.forceLink(validLinks).id(d => d.id).distance(150))
                    .restart();

                link.style('stroke', '#aaa').style('display', 'block');
                node.style('opacity', 1);
            }
        });

        /**
         * Display metadata for a clicked node in a tooltip.
         * @param {Object} event - D3 click event object.
         * @param {Object} d - Data bound to the clicked node.
         */
        function displayMetadata(event, d) {
            console.log("Clicked on node:", d);
            const metadataDiv = document.getElementById("tooltip");

            // Count connections for the node
            const connections = validLinks.reduce((count, link) => {
                return count + ((link.source.id === d.id || link.target.id === d.id) ? 1 : 0);
            }, 0);

            let metadataHTML = `<h3>${d.name}</h3>`;

            // Display node image if available
            if (d.image) {
                metadataHTML += `<img src="${d.image}" alt="${d.name} photo" class="tooltip-image"/>`;
            }

            // Display metadata based on node type
            if (d.type === "character") {
                metadataHTML += `
                    <p>Type: ${d.type}</p>
                    ${d.species ? `<p>Species: ${d.species}</p>` : ''}
                    ${d.status ? `<p>Status: ${d.status}</p>` : ''}
                    ${d.gender ? `<p>Gender: ${d.gender}</p>` : ''}
                    ${d.origin ? `<p>Origin: ${d.origin}</p>` : ''}
                `;
            } else if (d.type === "location") {
                metadataHTML += `
                    <p>Type: ${d.type}</p>
                    ${d.dimension ? `<p>Dimension: ${d.dimension}</p>` : ''}
                    ${d.location_type ? `<p>Location Type: ${d.location_type}</p>` : ''}
                `;
            } else if (d.type === "episode") {
                metadataHTML += `
                    <p>Type: ${d.type}</p>
                    ${d.air_date ? `<p>Air Date: ${d.air_date}</p>` : ''}
                `;
            }

            metadataHTML += `<p>Connections: ${connections}</p>`;
            metadataDiv.innerHTML = metadataHTML;
        }
    })
    .catch((err) => console.error('Error loading data:', err));