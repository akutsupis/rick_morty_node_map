// Fetch API data and create a D3 graph
fetch('/data')
    .then(response => response.json())
    .then(data => {
        const nodes = [];
        const links = [];

        // Create nodes for characters
        data.character.forEach(character => {
            nodes.push({
                id: `char-${character.id}`,
                name: character.name,
                group: 'character'
            });
        });

        // Create nodes for episodes and links
        data.episode.forEach(episode => {
            nodes.push({
                id: `ep-${episode.id}`,
                name: episode.name,
                group: 'episode'
            });

            episode.characters.forEach(characterURL => {
                const charID = `char-${characterURL.split('/').slice(-1)}`;
                links.push({
                    source: `ep-${episode.id}`,
                    target: charID
                });
            });
        });

        // Setup SVG canvas
        const width = 1000, height = 600;
        const svg = d3.select('#graph')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Force simulation
        const simulation = d3.forceSimulation(nodes)
            .force('link', d3.forceLink(links).id(d => d.id).distance(100))
            .force('charge', d3.forceManyBody().strength(-300))
            .force('center', d3.forceCenter(width / 2, height / 2))
            .on('tick', ticked);

        // Draw links
        const link = svg.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(links)
            .enter()
            .append('line')
            .attr('stroke-width', 1.5);

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

        node.append('circle')
            .attr('r', 10)
            .attr('fill', d => d.group === 'character' ? '#69b3a2' : '#ff8c00');

        node.append('text')
            .attr('dy', -15)
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
    })
    .catch(err => console.error('Error loading data:', err));