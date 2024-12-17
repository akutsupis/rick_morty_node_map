// Fetch API data and initialize the graph
fetch('/data/network.json')
    .then((response) => response.json())
    .then((data) => {
        const nodes = data.nodes;
        const links = data.edges;

        const width = window.innerWidth * 0.9; // Adjust to fit the screen
        const height = window.innerHeight * 0.7;

        // Toggles for adjusting graph display
        const togglePhotos = document.getElementById('togglePhotos');
        const toggleCharacters = document.getElementById('toggleCharacters');
        const toggleEpisodes = document.getElementById('toggleEpisodes');
        const toggleLocations = document.getElementById('toggleLocations');

        // Calculate degree (number of edges connected) for each node
        const degreeMap = {};
        links.forEach((link) => {
            degreeMap[link.source] = (degreeMap[link.source] || 0) + 1;
            degreeMap[link.target] = (degreeMap[link.target] || 0) + 1;
        });
        nodes.forEach((node) => {
            node.degree = degreeMap[node.id] || 0;
        });

        // Define a size scale for node bubbles
        const sizeScale = d3
            .scaleSqrt()
            .domain([0, d3.max(nodes, (d) => d.degree)])
            .range([5, 70]);

        const svg = d3
            .select('#graph')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .call(
                d3.zoom()
                    .scaleExtent([0.5, 3]) // Zoom limits
                    .on('zoom', (event) => g.attr('transform', event.transform))
            )
            .append('g');

        // Simulation setup for force layout
        const simulation = d3
            .forceSimulation(nodes)
            .force(
                'link',
                d3.forceLink(links).id((d) => d.id).distance(150)
            )
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .on('tick', ticked);

        const g = svg.append('g');

        // Add links
        const link = g
            .append('g')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('stroke-width', 2)
            .attr('stroke', '#aaa');

        // Add nodes
        const node = g
            .selectAll('g')
            .data(nodes)
            .enter()
            .append('g')
            .call(
                d3
                    .drag()
                    .on('start', dragstarted)
                    .on('drag', dragged)
                    .on('end', dragended)
            );

        // Apply filters based on the active toggles
        function applyFilters() {
            // Update visibility of nodes based on toggles
            node.style('display', (d) => {
                if (
                    (d.type === 'character' && !toggleCharacters.checked) ||
                    (d.type === 'episode' && !toggleEpisodes.checked) ||
                    (d.type === 'location' && !toggleLocations.checked)
                ) {
                    return 'none'; // Hide nodes of this type
                }
                return 'block'; // Show nodes of this type
            });

            // Update nodes to show photos or circles based on the "Show Photos" toggle
            node.select('circle').style('display', togglePhotos.checked ? 'none' : 'block'); // Hide circles if photos are enabled
            node.select('image').style('display', togglePhotos.checked ? 'block' : 'none'); // Show photos if enabled
        }

        // Add event listeners for all toggles
        [togglePhotos, toggleCharacters, toggleEpisodes, toggleLocations].forEach((toggle) =>
            toggle.addEventListener('change', applyFilters)
        );

        // Append circles for each node
        node.append("circle")
            .attr("r", (d) => sizeScale(d.degree)) // Scale radius based on degree
            .attr("fill", (d) => {
                if (d.type === "character") return "#69b3a2";
                if (d.type === "episode") return "#ff8c00";
                if (d.type === "location") return "#6a5acd";
                return "#ccc";
            })
            .on("click", displayMetadata); // Bind click to display metadata

       // Append images for nodes (hidden by default)
        node.append("image")
            .attr("xlink:href", (d) => d.image || "") // Assign the image URL if available
            .attr("width", (d) => sizeScale(d.degree) * 2) // Image width doubled to match the circle's diameter
            .attr("height", (d) => sizeScale(d.degree) * 2) // Image height doubled to match the circle's diameter
            .attr("x", (d) => -sizeScale(d.degree)) // Shift horizontally to center
            .attr("y", (d) => -sizeScale(d.degree)) // Shift vertically to center
            .style("display", "none"); // Start with images hidden, controlled by togglePhotos

        // Append labels below nodes
        node.append('text')
            .attr('dy', (d) => sizeScale(d.degree) + 5)
            .attr('text-anchor', 'middle')
            .text((d) => d.name);

        // Tick handler for simulation
        function ticked() {
            link
                .attr('x1', (d) => d.source.x)
                .attr('y1', (d) => d.source.y)
                .attr('x2', (d) => d.target.x)
                .attr('y2', (d) => d.target.y);

            node.attr(
                'transform',
                (d) => `translate(${d.x},${d.y})`
            );
        }

        // Drag behavior functions
        function dragstarted(event, d) {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(event, d) {
            d.fx = event.x;
            d.fy = event.y;
        }

        function dragended(event, d) {
            if (!event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        // Display metadata for the selected node
        function displayMetadata(event, d) {
            const metadataDiv = document.getElementById("tooltip");

            const connections = links.reduce((count, link) => {
                return count + ((link.source.id === d.id || link.target.id === d.id) ? 1 : 0);
            }, 0);

            let metadataHTML = `<h3>${d.name}</h3>`;

            if (d.image) {
                metadataHTML += `<img src="${d.image}" alt="${d.name} photo" class="tooltip-image"/>`;
            }

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

        // Add search functionality
        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', function () {
            const query = this.value.toLowerCase();
            const matchingNode = nodes.find(node => node.name.toLowerCase().includes(query));

            if (matchingNode) {
                // Calculate zoom transform to center the node
                const transform = d3.zoomIdentity
                    .translate(width / 2 - matchingNode.x * 2, height / 2 - matchingNode.y * 2)
                    .scale(2);

                svg.transition()
                    .duration(750)
                    .call(d3.zoom().transform, transform);

                // Highlight the matching node
                g.selectAll('circle')
                    .attr('stroke', d => (d.id === matchingNode.id ? '#ff0000' : null))
                    .attr('stroke-width', d => (d.id === matchingNode.id ? 3 : null));
            }
        });

    })
    .catch((err) => console.error('Error loading data:', err));