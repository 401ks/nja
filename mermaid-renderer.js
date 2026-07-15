/**
 * Mermaid Renderer - Standalone
 * 
 * Usage:
 * 
 * 1. As URL renderer:
 *    https://your-domain.com/mermaid-renderer.js?code=graph%20TD%3B%0AA%3C--%3EB
 * 
 * 2. As imported module:
 *    <script src="https://your-domain.com/mermaid-renderer.js"></script>
 *    <script>
 *        MermaidRenderer.render('graph TD; A-->B;', '#output');
 *    </script>
 * 
 * 3. As ES Module:
 *    import MermaidRenderer from 'https://your-domain.com/mermaid-renderer.js';
 *    MermaidRenderer.render('graph TD; A-->B;', '#output');
 */

(function(root, factory) {
    if (typeof module === 'object' && typeof module.exports === 'object') {
        module.exports = factory();
    } else if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root.MermaidRenderer = factory();
    }
}(typeof self !== 'undefined' ? self : this, function() {

    // ============================================================
    // 1. MERMAID CORE (Minified - v10.9.0)
    // ============================================================
    // This is a stripped-down, self-contained Mermaid renderer.
    // For full Mermaid features, use the CDN version below.
    // ============================================================

    // If you want the FULL Mermaid library, uncomment this line:
    // const MERMAID_CDN = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
    
    // For now, we use a lightweight rendering approach that handles common diagrams.
    // This is a simplified parser/renderer for common Mermaid diagrams.
    
    class MermaidRenderer {
        constructor() {
            this.version = '1.0.0';
            this.config = {
                theme: 'default',
                themeVariables: {},
                flowchart: {
                    useMaxWidth: true,
                    htmlLabels: true,
                    curve: 'basis',
                },
                sequence: {
                    useMaxWidth: true,
                    hideUnusedParticipants: false,
                }
            };
        }

        // ============================================================
        // 2. RENDER ENGINE
        // ============================================================

        /**
         * Render Mermaid code to SVG
         * @param {string} code - Mermaid diagram code
         * @param {string|HTMLElement} target - CSS selector or DOM element to render into
         * @param {Object} options - Render options
         * @returns {Promise<string>} SVG string
         */
        async render(code, target, options = {}) {
            // Merge options
            const config = { ...this.config, ...options };
            
            // Parse the diagram
            const diagram = this.parseDiagram(code);
            if (!diagram) {
                throw new Error('Failed to parse Mermaid diagram');
            }

            // Generate SVG
            const svg = this.generateSVG(diagram, config);
            
            // Render to target if provided
            if (target) {
                const container = typeof target === 'string' 
                    ? document.querySelector(target) 
                    : target;
                
                if (container) {
                    container.innerHTML = svg;
                }
            }

            return svg;
        }

        /**
         * Render and return SVG string only
         */
        async renderSVG(code, options = {}) {
            const diagram = this.parseDiagram(code);
            if (!diagram) {
                throw new Error('Failed to parse Mermaid diagram');
            }
            return this.generateSVG(diagram, { ...this.config, ...options });
        }

        /**
         * Parse Mermaid code into a structured diagram object
         */
        parseDiagram(code) {
            const lines = code.split('\n').filter(line => line.trim());
            
            // Detect diagram type
            const firstLine = lines[0] || '';
            const diagramType = this.detectDiagramType(firstLine);
            
            if (!diagramType) {
                console.warn('Unknown diagram type, defaulting to flowchart');
            }

            // Parse based on type
            switch (diagramType) {
                case 'flowchart':
                    return this.parseFlowchart(lines);
                case 'sequence':
                    return this.parseSequence(lines);
                case 'class':
                    return this.parseClass(lines);
                case 'state':
                case 'stateDiagram':
                    return this.parseState(lines);
                case 'er':
                    return this.parseER(lines);
                case 'gantt':
                    return this.parseGantt(lines);
                case 'pie':
                    return this.parsePie(lines);
                case 'git':
                    return this.parseGit(lines);
                default:
                    return this.parseFlowchart(lines);
            }
        }

        detectDiagramType(firstLine) {
            const types = [
                'flowchart', 'graph', 'sequenceDiagram', 'classDiagram',
                'stateDiagram', 'erDiagram', 'gantt', 'pie', 'gitGraph'
            ];
            
            for (const type of types) {
                if (firstLine.toLowerCase().includes(type)) {
                    return type;
                }
            }
            return 'flowchart';
        }

        // ============================================================
        // 3. FLOWCHART PARSER (Core)
        // ============================================================

        parseFlowchart(lines) {
            const nodes = [];
            const edges = [];
            const subgraphs = [];
            let currentSubgraph = null;
            let direction = 'TB';
            
            for (const line of lines) {
                const trimmed = line.trim();
                
                // Skip empty lines and comments
                if (!trimmed || trimmed.startsWith('%%')) continue;
                
                // Detect direction
                if (trimmed.match(/^direction\s+(TB|TD|BT|RL|LR)/i)) {
                    direction = trimmed.split(/\s+/)[1].toUpperCase();
                    continue;
                }
                
                // Detect subgraph
                if (trimmed.match(/^subgraph\s+/i)) {
                    const name = trimmed.replace(/^subgraph\s+/, '').trim();
                    currentSubgraph = { id: `sub_${nodes.length}`, name, nodes: [] };
                    subgraphs.push(currentSubgraph);
                    continue;
                }
                
                if (trimmed === 'end' && currentSubgraph) {
                    currentSubgraph = null;
                    continue;
                }
                
                // Parse node definitions: A[Label]
                const nodeMatch = trimmed.match(/^(\w+)(?:\[([^\]]*)\])?/);
                if (nodeMatch) {
                    const id = nodeMatch[1];
                    const label = nodeMatch[2] || id;
                    nodes.push({ id, label, type: 'node' });
                    
                    if (currentSubgraph) {
                        currentSubgraph.nodes.push(id);
                    }
                }
                
                // Parse edges: A --> B
                const edgeMatch = trimmed.match(/^(\w+)\s*(-->|---|==>|-->\s*|\|\|>|\|>|--o|o--o)\s*(\w+)/);
                if (edgeMatch) {
                    const from = edgeMatch[1];
                    const arrow = edgeMatch[2];
                    const to = edgeMatch[3];
                    
                    edges.push({
                        from,
                        to,
                        arrow: this.parseArrowType(arrow)
                    });
                    
                    // Ensure nodes exist
                    if (!nodes.find(n => n.id === from)) {
                        nodes.push({ id: from, label: from, type: 'node' });
                    }
                    if (!nodes.find(n => n.id === to)) {
                        nodes.push({ id: to, label: to, type: 'node' });
                    }
                }
            }
            
            return {
                type: 'flowchart',
                direction,
                nodes,
                edges,
                subgraphs
            };
        }

        parseArrowType(arrow) {
            const types = {
                '-->': 'arrow',
                '---': 'line',
                '==>': 'thick_arrow',
                '--o': 'circle',
                'o--o': 'double_circle',
                '||>': 'pointed',
                '|>': 'pointed'
            };
            return types[arrow] || 'arrow';
        }

        // ============================================================
        // 4. SVG GENERATOR
        // ============================================================

        generateSVG(diagram, config) {
            const { type, direction, nodes, edges, subgraphs } = diagram;
            
            // Calculate layout
            const layout = this.calculateLayout(nodes, edges, direction);
            
            // Build SVG
            const width = layout.width + 80;
            const height = layout.height + 80;
            
            let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="100%" height="100%" style="background: white; font-family: 'Segoe UI', Arial, sans-serif;">
                <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                        <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
                    </marker>
                    <marker id="arrowhead-thick" markerWidth="12" markerHeight="8" refX="12" refY="4" orient="auto">
                        <polygon points="0 0, 12 4, 0 8" fill="#333" />
                    </marker>
                    <marker id="arrowhead-circle" markerWidth="8" markerHeight="8" refX="8" refY="4" orient="auto">
                        <circle cx="4" cy="4" r="4" fill="#666" />
                    </marker>
                    <filter id="shadow">
                        <feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.1" />
                    </filter>
                </defs>`;
            
            // Draw edges first (so they're behind nodes)
            for (const edge of edges) {
                const from = layout.positions[edge.from];
                const to = layout.positions[edge.to];
                
                if (from && to) {
                    svg += this.drawEdge(from, to, edge.arrow);
                }
            }
            
            // Draw nodes
            for (const node of nodes) {
                const pos = layout.positions[node.id];
                if (pos) {
                    svg += this.drawNode(node, pos);
                }
            }
            
            svg += '</svg>';
            
            return svg;
        }

        calculateLayout(nodes, edges, direction) {
            const positions = {};
            const spacing = 120;
            const nodeWidth = 100;
            const nodeHeight = 50;
            
            // Simple grid layout
            const totalNodes = nodes.length;
            const cols = Math.ceil(Math.sqrt(totalNodes));
            const rows = Math.ceil(totalNodes / cols);
            
            let x = 0, y = 0;
            
            for (let i = 0; i < nodes.length; i++) {
                const row = Math.floor(i / cols);
                const col = i % cols;
                
                if (direction === 'TB' || direction === 'TD') {
                    x = col * spacing + spacing / 2;
                    y = row * spacing + spacing / 2;
                } else if (direction === 'LR') {
                    x = row * spacing + spacing / 2;
                    y = col * spacing + spacing / 2;
                } else {
                    x = col * spacing + spacing / 2;
                    y = row * spacing + spacing / 2;
                }
                
                positions[nodes[i].id] = { x, y };
            }
            
            return {
                positions,
                width: cols * spacing + spacing,
                height: rows * spacing + spacing
            };
        }

        drawNode(node, pos) {
            const { id, label, type } = node;
            const x = pos.x;
            const y = pos.y;
            const width = 120;
            const height = 50;
            
            let shape = '';
            let fill = '#f0f4ff';
            let stroke = '#5341cd';
            
            if (type === 'start') {
                fill = '#5341cd';
                stroke = '#5341cd';
                return `<ellipse cx="${x}" cy="${y}" rx="${width/2}" ry="${height/2}" fill="${fill}" stroke="${stroke}" stroke-width="2" filter="url(#shadow)"/>
                        <text x="${x}" y="${y + 6}" text-anchor="middle" fill="white" font-size="14" font-weight="600">${label}</text>`;
            }
            
            return `<rect x="${x - width/2}" y="${y - height/2}" width="${width}" height="${height}" rx="8" fill="${fill}" stroke="${stroke}" stroke-width="2" filter="url(#shadow)"/>
                    <text x="${x}" y="${y + 6}" text-anchor="middle" fill="#1b1c1a" font-size="13" font-weight="500">${label}</text>`;
        }

        drawEdge(from, to, type) {
            const markerMap = {
                'arrow': 'url(#arrowhead)',
                'thick_arrow': 'url(#arrowhead-thick)',
                'circle': 'url(#arrowhead-circle)'
            };
            
            const marker = markerMap[type] || 'url(#arrowhead)';
            
            return `<line x1="${from.x}" y1="${from.y}" x2="${to.x}" y2="${to.y}" 
                    stroke="#666" stroke-width="2" marker-end="${marker}" />`;
        }

        // ============================================================
        // 5. DIAGRAM TYPE PARSERS (Placeholders)
        // ============================================================

        parseSequence(lines) {
            // Simplified sequence diagram parser
            const participants = [];
            const messages = [];
            
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.startsWith('participant')) {
                    const name = trimmed.replace('participant', '').trim();
                    participants.push({ id: name, label: name });
                }
                if (trimmed.includes('->')) {
                    const parts = trimmed.split('->');
                    if (parts.length === 2) {
                        const from = parts[0].trim();
                        const to = parts[1].trim().replace(':.*', '');
                        messages.push({ from, to });
                    }
                }
            }
            
            return {
                type: 'sequence',
                participants,
                messages
            };
        }

        parseClass(lines) {
            return { type: 'class', classes: [], relations: [] };
        }

        parseState(lines) {
            return { type: 'state', states: [], transitions: [] };
        }

        parseER(lines) {
            return { type: 'er', entities: [], relations: [] };
        }

        parseGantt(lines) {
            return { type: 'gantt', tasks: [] };
        }

        parsePie(lines) {
            const data = [];
            for (const line of lines) {
                const match = line.match(/"([^"]+)"\s*:\s*(\d+)/);
                if (match) {
                    data.push({ label: match[1], value: parseInt(match[2]) });
                }
            }
            return { type: 'pie', data };
        }

        parseGit(lines) {
            return { type: 'git', commits: [] };
        }

        // ============================================================
        // 6. URL PARAMETER HANDLER
        // ============================================================

        /**
         * Parse URL parameters and render if ?code= is present
         */
        handleURLParams() {
            const urlParams = new URLSearchParams(window.location.search);
            const code = urlParams.get('code');
            const target = urlParams.get('target') || '#mermaid-output';
            
            if (code) {
                const decoded = decodeURIComponent(code);
                this.render(decoded, target).catch(err => {
                    console.error('Mermaid Render Error:', err);
                    const container = document.querySelector(target);
                    if (container) {
                        container.innerHTML = `<div style="color: red; padding: 20px; border: 1px solid red; border-radius: 8px;">
                            <strong>Error rendering diagram:</strong><br>
                            ${err.message}
                        </div>`;
                    }
                });
                return true;
            }
            return false;
        }

        // ============================================================
        // 7. FULL MERMAID CDN LOADER (Optional)
        // ============================================================

        /**
         * Load full Mermaid library from CDN for advanced features
         */
        loadFullMermaid() {
            return new Promise((resolve, reject) => {
                if (typeof mermaid !== 'undefined') {
                    resolve(mermaid);
                    return;
                }
                
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
                script.onload = () => {
                    if (typeof mermaid !== 'undefined') {
                        resolve(mermaid);
                    } else {
                        reject(new Error('Mermaid library failed to load'));
                    }
                };
                script.onerror = () => reject(new Error('Failed to load Mermaid CDN'));
                document.head.appendChild(script);
            });
        }
    }

    // ============================================================
    // 8. EXPORT & INITIALIZATION
    // ============================================================

    const instance = new MermaidRenderer();

    // Auto-initialize if in browser
    if (typeof window !== 'undefined') {
        // Auto-render from URL params
        instance.handleURLParams();

        // Expose to window
        window.MermaidRenderer = instance;
        window.MermaidRenderer.render = instance.render.bind(instance);
        window.MermaidRenderer.renderSVG = instance.renderSVG.bind(instance);
        window.MermaidRenderer.loadFullMermaid = instance.loadFullMermaid.bind(instance);
    }

    return instance;
}));
