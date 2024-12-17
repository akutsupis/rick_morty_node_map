// Fetch API data and initialize the graph
fetch('/data/network.json')
    .then(response => response.json())
    .then(data => {
        const nodes = data.nodes;
        const links = data.edges;

        const width = window.innerWidth - 20, height = window.innerHeight - 100;

        // Add SVG element with zoom and pan capabilities
        const svg = d3.select('#graph')
            .append('svg')
            .attr('width', width)
            .attr('height', height)
            .call(d3.zoom()
                .scaleExtent([0.5, 5]) // Allow zoom between 50% and 500%
                .on('zoom', (event) => {
                    g.attr('transform', event.transform);
                }))
            .append('g'); // Group to hold all graph elements

        const g = svg.append('g');

        // Force simulation setup
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(150))
            .force('charge', d3.forceManyBody().strength(-500))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .on('tick', ticked);

        // Draw links
        const link = g.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('stroke-width', 1.5)
            .attr('stroke', '#999')
            .attr('stroke-opacity', 0.6);

        // Draw nodes
        const node = g.append('g')
            .attr('class', 'nodes')
            .selectAll('g')
            .data(nodes)
            .enter()
            .append('g')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));

        // Add circles or photos based on settings
        const circle = node.append('circle')
            .attr('r', 10)
            .attr('fill', d => {
                if (d.type === 'character') return '#69b3a2';
                if (d.type === 'episode') return '#ff8c00';
                if (d.type === 'location') return '#6a5acd';
                return '#ccc';
            });

        const photo = node.append('image')
            .attr('xlink:href', d => d.image || '')
            .attr('width', 30)
            .attr('height', 30)
            .attr('x', -15)
            .attr('y', -15)
            .style('display', 'none'); // Initially hidden

        // Add labels
        node.append('text')
            .attr('dy', 20)
            .attr('text-anchor', 'middle')
            .style('font-size', '10px')
            .text(d => d.name);

        // Tick event
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

        // Handle settings toggles
        document.getElementById('togglePhotos').addEventListener('change', function () {
            const display = this.checked ? 'block' : 'none';
            photo.style('display', display);
            circle.style('display', this.checked ? 'none' : 'block');
        });

        document.getElementById('nodeSize').addEventListener('input', function () {
            const size = this.value;
            circle.attr('r', size / 2);
            photo.attr('width', size)
                .attr('height', size)
                .attr('x', -size / 2)
                .attr('y', -size / 2);
        });

        // Filtering nodes by type
        function toggleType(type, show) {
            node.style('display', d => (d.type === type && !show) ? 'none' : 'block');
        }

        document.getElementById('toggleCharacters').addEventListener('change', function () {
            toggleType('character', this.checked);
        });

        document.getElementById('toggleEpisodes').addEventListener('change', function () {
            toggleType('episode', this.checked);
        });

        document.getElementById('toggleLocations').addEventListener('change', function () {
            toggleType('location', this.checked);
        });
    })
    .catch(err => console.error('Error loading data:', err));