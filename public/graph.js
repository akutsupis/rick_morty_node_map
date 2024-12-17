// Fetch API data and initialize the graph
fetch('/data/network.json')
    .then((response) => response.json())
    .then((data) => {
        const nodes = data.nodes;
        const links = data.edges;

        console.log("Total nodes loaded:", nodes.length);

        const rickSanchezNodes = nodes.filter(node => node.name === "Rick Sanchez");
        console.log("Total Rick Sanchez nodes found:", rickSanchezNodes.length);
        console.log("Rick Sanchez nodes:", rickSanchezNodes);

        const width = window.innerWidth * 0.9;
        const height = window.innerHeight * 0.7;

        const togglePhotos = document.getElementById('togglePhotos');
        const toggleCharacters = document.getElementById('toggleCharacters');
        const toggleEpisodes = document.getElementById('toggleEpisodes');
        const toggleLocations = document.getElementById('toggleLocations');

        // Create a map for node lookup by ID
        const nodeMap = new Map(nodes.map(node => [node.id, node]));

        // Validate links
        const validLinks = links.filter(link => nodeMap.has(link.source) && nodeMap.has(link.target));

        const degreeMap = {};
        validLinks.forEach((link) => {
            degreeMap[link.source] = (degreeMap[link.source] || 0) + 1;
            degreeMap[link.target] = (degreeMap[link.target] || 0) + 1;
        });
        nodes.forEach((node) => {
            node.degree = degreeMap[node.id] || 0;
        });

        const sizeScale = d3.scaleSqrt()
            .domain([0, d3.max(nodes, (d) => d.degree)])
            .range([5, 70]);

        const svg = d3.select('#graph')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .call(
                d3.zoom()
                    .scaleExtent([0.5, 5])
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

        // Bind nodes with unique ID
        const node = g.selectAll('g')
            .data(nodes, d => d && d.id ? d.id : null) // Use unique ID for binding, handle undefined
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
            })
            .on("click", displayMetadata);

        // Append images for nodes (hidden by default)
        node.append("image")
            .attr("xlink:href", (d) => d.image || "")
            .attr("width", (d) => sizeScale(d.degree) * 2)
            .attr("height", (d) => sizeScale(d.degree) * 2)
            .attr("x", (d) => -sizeScale(d.degree))
            .attr("y", (d) => -sizeScale(d.degree))
            .style("display", "none")
            .on("click", displayMetadata);

        // Append labels below nodes
        node.append('text')
            .attr('dy', (d) => sizeScale(d.degree) + 5)
            .attr('text-anchor', 'middle')
            .text((d) => d.name);

        // Simulation setup for force layout, after node initialization
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(validLinks).id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-200))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .on('tick', ticked);

        function applyFilters() {
            const showPhotos = togglePhotos.checked; // Fetch the state of 'Show Photos' toggle
            const showCharacters = toggleCharacters.checked;
            const showEpisodes = toggleEpisodes.checked;
            const showLocations = toggleLocations.checked;

            // Toggle between circles and photos
            node.each(function (d) {
                const group = d3.select(this);
                group.select('circle').style('display', showPhotos ? 'none' : 'block'); // Hide circles if photos are enabled
                group.select('image').style('display', showPhotos ? 'block' : 'none'); // Show images if photos are enabled
            });


            // Update node visibility based on type and toggles
            node.style('display', d => {
                const typeVisible =
                    (showCharacters && d.type === 'character') ||
                    (showEpisodes && d.type === 'episode') ||
                    (showLocations && d.type === 'location');
                return typeVisible ? 'block' : 'none';
            });

            // Update link visibility based on node visibility
            link.style('display', d => {
                const sourceVisible = d3.select(nodeMap.get(d.source.id)).style('display') !== 'none';
                const targetVisible = d3.select(nodeMap.get(d.target.id)).style('display') !== 'none';
                return sourceVisible && targetVisible ? 'block' : 'none';
            });

            const searchInput = document.getElementById('nodeSearch').value.toLowerCase();
            const typeFilter = document.getElementById('typeFilter').value;

            node.style('display', d => {
                const matchesSearch = d.name.toLowerCase().includes(searchInput);
                const matchesType = typeFilter === 'all' || d.type === typeFilter;

                // If both filters match, show the node
                return matchesSearch && matchesType ? 'block' : 'none';
            });

            // Adjust link visibility to include only connections between visible nodes
            link.style('display', d =>
                nodeMap.get(d.source.id).style.display !== 'none' &&
                nodeMap.get(d.target.id).style.display !== 'none' ? 'block' : 'none'
            );
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

        // Tick handler for simulation
        function ticked() {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
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


        const highlightNodeToggle = document.getElementById('highlightNodeToggle'); // Checkbox
        let focusedNode = null; // To keep track of the currently selected node

        function rearrangeAroundNode(node) {
            if (highlightNodeToggle.checked) {
                focusedNode = node;

                // Fix the clicked node in the center
                simulation
                    .alpha(0.5) // Increase alpha for smoother transition
                    .force('center', d3.forceCenter(width / 2, height / 2))
                    .force('charge', d3.forceManyBody().strength(-50)) // Weaken charge to focus on layout
                    .force('link', d3.forceLink(validLinks).id(d => d.id).distance(d => {
                        if (d.source.id === node.id || d.target.id === node.id) return 100; // Closer for direct connections
                        return 300; // Looser for unrelated nodes
                    }))
                    .restart();

                // Highlight the selected node and its direct connections
                link.style('stroke', d => (d.source.id === node.id || d.target.id === node.id) ? '#ff0000' : '#aaa')
                    .style('display', d => (d.source.id === node.id || d.target.id === node.id) ? 'block' : 'none');

                node.style('opacity', d => (d.id === node.id || validLinks.some(l => l.source === node || l.target === node)) ? 1 : 0.3);
            }
        }

        node.select('circle')
            .on('click', (_, d) => {
                if (highlightNodeToggle.checked) {
                    rearrangeAroundNode(d);
                }
            });

        highlightNodeToggle.addEventListener('change', () => {
            if (!highlightNodeToggle.checked) {
                // Reset the graph layout and styles
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

        function displayMetadata(event, d) {
            console.log("Clicked on node:", d);
            const metadataDiv = document.getElementById("tooltip");

            const connections = validLinks.reduce((count, link) => {
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
    })
    .catch((err) => console.error('Error loading data:', err));
