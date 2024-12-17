// Fetch API data and create a D3 graph
fetch('/data/network.json') // Adjusted to load network.json
    .then(response => response.json())
    .then(data => {
        const nodes = data.nodes;
        const links = data.edges;

        // Setup SVG canvas
        const width = 1000, height = 600;
        const svg = d3.select('#graph')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Force simulation setup
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .on('tick', ticked);

        // Draw links (edges)
        const link = svg.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('stroke-width', 1.5)
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6);

        // Draw nodes
        const node = svg.append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(nodes)
            .enter()
            .append('g')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Add circles to represent nodes
        node.append('circle')
            .attr('r', 10)
            .attr('fill', d => {
                // Colors for different types of nodes
                if (d.type === 'character') return '#69b3a2'; // Green for characters
                if (d.type === 'episode') return '#ff8c00';   // Orange for episodes
                if (d.type === 'location') return '#6a5acd'; // Purple for locations
                return '#ccc'; // Default color
            })
            .on('click', d => {
                updateSidebar(d); // Update sidebar on click
                highlightConnectedEdges(d); // Highlight connections on click
            })
            .on('mouseover', d => {
                // Tooltip on hover
                d3.select('#tooltip')
                    .style('opacity', 1)
                    .html(`<strong>${d.name}</strong><br>Type: ${d.type}`)
                    .style('left', (d3.event.pageX + 10) + 'px')
                    .style('top', (d3.event.pageY + 10) + 'px');
            })
            .on('mouseout', () => {
                d3.select('#tooltip')
                    .style('opacity', 0);
            });

        // Add labels to nodes
        node.append('text')
            .attr('dy', 15)
            .attr('dx', -10)
            .text(d => d.name)
            .style('font-size', 10)
            .style('text-anchor', 'start');

        // Tick event: Update position of nodes and links
        function ticked() {
            link
                .attr('x1', d => d.source.x)
                .attr('y1', d => d.source.y)
                .attr('x2', d => d.target.x)
                .attr('y2', d => d.target.y);

            node.attr('transform', d => `translate(${d.x},${d.y})`);
        }

        // Dragging behavior
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

        // Highlight connections for the selected node
        function highlightConnectedEdges(node) {
            // Highlight edges
            link
                .attr('stroke', d =>
                    d.source.id === node.id || d.target.id === node.id ? 'red' : '#999'
                )
                .attr('stroke-opacity', d =>
                    d.source.id === node.id || d.target.id === node.id ? 1 : 0.6
                );

            // Highlight connected nodes
            svg.selectAll('circle')
                .attr('stroke', d =>
                    links.some(e => e.source.id === d.id && e.target.id === node.id) ? 'red' : 'none'
                );
        }

        // Update sidebar details
        function updateSidebar(node) {
            const sidebar = d3.select('#details');
            sidebar.html(''); // Clear current content

            // Render node-specific information
            if (node.type === 'character') {
                sidebar.html(`
                    <h2>${node.name}</h2>
                    <img src="${node.image}" alt="${node.name}" width="100">
                    <p><strong>Type:</strong> ${node.type}</p>
                    <p><strong>Species:</strong> ${node.species}</p>
                    <p><strong>Status:</strong> ${node.status}</p>
                    <p><strong>Gender:</strong> ${node.gender}</p>
                    <p><strong>Origin:</strong> ${node.origin}</p>
                `);
            } else if (node.type === 'episode') {
                sidebar.html(`
                    <h2>${node.name}</h2>
                    <p><strong>Type:</strong> ${node.type}</p>
                    <p><strong>Air Date:</strong> ${node.air_date}</p>
                `);
            } else if (node.type === 'location') {
                sidebar.html(`
                    <h2>${node.name}</h2>
                    <p><strong>Type:</strong> ${node.type}</p>
                    <p><strong>Dimension:</strong> ${node.dimension}</p>
                `);
            }
        }
    })
    .catch(err => console.error('Error loading data:', err));