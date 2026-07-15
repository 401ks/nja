/**
 * Mermaid Renderer - Accurate Flowchart Parser
 * 
 * Usage:
 * 1. URL: https://your-domain.com/mermaid-renderer.js?code=graph%20TD%3BA--%3EB
 * 2. Script: <script src="..."></script> then MermaidRenderer.render(code, '#target')
 * 3. Module: import MermaidRenderer from '...';
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

    class MermaidRenderer {
        constructor() {
            this.version = '2.0.0';
            this.nodeCounter = 0;
            this.edgeLabels = {};
        }

        // ============================================================
        // MAIN RENDER METHOD
        // ============================================================

        async render(code, target, options = {}) {
            const diagram = this.parse(code);
            const svg = this.generateSVG(diagram);
            
            if (target) {
                const container = typeof target === 'string' 
                    ? document.querySelector(target) 
                    : target;
                if (container) container.innerHTML = svg;
            }
            return svg;
        }

        async renderSVG(code) {
            const diagram = this.parse(code);
            return this.generateSVG(diagram);
        }

        // ============================================================
        // PARSER — Handles your exact syntax
        // ============================================================

        parse(code) {
            const lines = code.split('\n').filter(l => l.trim() && !l.trim().startsWith('%%'));
            const nodes = [];
            const edges = [];
            const edgeLabels = {};
            let direction = 'TD';

            for (const line of lines) {
                const trimmed = line.trim();

                // Detect direction
                const dirMatch = trimmed.match(/^flowchart\s+(TD|TB|BT|RL|LR)/i);
                if (dirMatch) {
                    direction = dirMatch[1].toUpperCase();
                    continue;
                }
                if (trimmed.match(/^graph\s+(TD|TB|BT|RL|LR)/i)) {
                    const m = trimmed.match(/^graph\s+(TD|TB|BT|RL|LR)/i);
                    direction = m[1].toUpperCase();
                    continue;
                }

                // Parse: A[Label] or A(Label) or A{Label} or A((Label))
                const nodeMatch = trimmed.match(/^(\w+)\s*(?:\[([^\]]*)\]|\(([^)]*)\)|\{([^}]*)\}|\(\(([^)]*)\)\))/);
                if (nodeMatch) {
                    const id = nodeMatch[1];
                    const label = nodeMatch[2] || nodeMatch[3] || nodeMatch[4] || nodeMatch[5] || id;
                    let shape = 'rect';
                    if (nodeMatch[2] !== undefined) shape = 'rect';
                    else if (nodeMatch[3] !== undefined) shape = 'roundrect';
                    else if (nodeMatch[4] !== undefined) shape = 'diamond';
                    else if (nodeMatch[5] !== undefined) shape = 'circle';
                    
                    nodes.push({ id, label, shape });
                    continue;
                }

                // Parse edge: A -->|label| B
                const edgeMatch = trimmed.match(/^(\w+)\s*(-->|---|==>|--o|o--o|\|\|>|\|>)\s*(?:\|([^|]*)\|)?\s*(\w+)/);
                if (edgeMatch) {
                    const from = edgeMatch[1];
                    const arrow = edgeMatch[2];
                    const label = edgeMatch[3] || '';
                    const to = edgeMatch[4];
                    
                    edges.push({ from, to, arrow, label });
                    if (label) edgeLabels[`${from}-${to}`] = label;
                    
                    // Add nodes if missing
                    if (!nodes.find(n => n.id === from)) nodes.push({ id: from, label: from, shape: 'rect' });
                    if (!nodes.find(n => n.id === to)) nodes.push({ id: to, label: to, shape: 'rect' });
                    continue;
                }

                // Fallback: simple node definition without shape
                const simpleNode = trimmed.match(/^(\w+)\s*$/);
                if (simpleNode) {
                    const id = simpleNode[1];
                    if (!nodes.find(n => n.id === id)) {
                        nodes.push({ id, label: id, shape: 'rect' });
                    }
                }
            }

            return { nodes, edges, edgeLabels, direction };
        }

        // ============================================================
        // SVG GENERATOR — Accurate shapes & layout
        // ============================================================

        generateSVG(diagram) {
            const { nodes, edges, direction } = diagram;
            
            // Calculate layout (grid-based with edge awareness)
            const layout = this.calculateLayout(nodes, edges, direction);
            
            const padding = 60;
            const width = layout.width + padding * 2;
            const height = layout.height + padding * 2;

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
                        <feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.08" />
                    </filter>
                </defs>`;

            // Draw edges
            for (const edge of edges) {
                const from = layout.positions[edge.from];
                const to = layout.positions[edge.to];
                if (from && to) {
                    svg += this.drawEdge(from, to, edge.arrow, edge.label || diagram.edgeLabels?.[`${edge.from}-${edge.to}`] || '');
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

        // ============================================================
        // LAYOUT ENGINE
        // ============================================================

        calculateLayout(nodes, edges, direction) {
            const positions = {};
            const nodeSize = { w: 140, h: 50 };
            const spacing = { x: 180, y: 100 };
            
            // Build adjacency for better layout
            const adjacency = {};
            for (const node of nodes) adjacency[node.id] = [];
            for (const edge of edges) {
                if (adjacency[edge.from]) adjacency[edge.from].push(edge.to);
            }

            // Simple topological layering (BFS from roots)
            const roots = nodes.filter(n => !edges.some(e => e.to === n.id));
            const layers = [];
            const visited = new Set();
            let currentLayer = roots.length ? roots.map(n => n.id) : [nodes[0]?.id];
            
            while (currentLayer.length) {
                layers.push(currentLayer);
                const nextLayer = [];
                for (const id of currentLayer) {
                    visited.add(id);
                    for (const child of (adjacency[id] || [])) {
                        if (!visited.has(child) && !nextLayer.includes(child)) {
                            nextLayer.push(child);
                        }
                    }
                }
                currentLayer = nextLayer;
            }

            // Assign positions based on layers
            const isHorizontal = direction === 'LR' || direction === 'RL';
            const maxPerLayer = Math.max(...layers.map(l => l.length), 1);

            for (let layerIdx = 0; layerIdx < layers.length; layerIdx++) {
                const layer = layers[layerIdx];
                const count = layer.length;
                const startY = -(count - 1) * spacing.y / 2;
                
                for (let i = 0; i < count; i++) {
                    const id = layer[i];
                    const x = isHorizontal ? layerIdx * spacing.x : 0;
                    const y = isHorizontal ? startY + i * spacing.y : layerIdx * spacing.y;
                    
                    // Center horizontally if vertical
                    const finalX = isHorizontal ? x : (i - (count - 1) / 2) * spacing.x;
                    const finalY = isHorizontal ? y : y;
                    
                    positions[id] = { x: finalX, y: finalY };
                }
            }

            // Calculate bounds
            let minX = 0, maxX = 0, minY = 0, maxY = 0;
            for (const id in positions) {
                const p = positions[id];
                if (p.x < minX) minX = p.x;
                if (p.x > maxX) maxX = p.x;
                if (p.y < minY) minY = p.y;
                if (p.y > maxY) maxY = p.y;
            }

            const width = maxX - minX + nodeSize.w + spacing.x;
            const height = maxY - minY + nodeSize.h + spacing.y;

            // Shift to positive space
            for (const id in positions) {
                positions[id].x += -minX + nodeSize.w / 2 + spacing.x / 2;
                positions[id].y += -minY + nodeSize.h / 2 + spacing.y / 2;
            }

            return { positions, width, height };
        }

        // ============================================================
        // DRAWING FUNCTIONS
        // ============================================================

        drawNode(node, pos) {
            const { id, label, shape } = node;
            const x = pos.x;
            const y = pos.y;
            const w = 140;
            const h = 50;
            
            let shapeSvg = '';
            let fill = '#f8f9fa';
            let stroke = '#5341cd';
            let textColor = '#1b1c1a';

            if (shape === 'rect') {
                // Square/rectangle node
                shapeSvg = `<rect x="${x - w/2}" y="${y - h/2}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="2" filter="url(#shadow)"/>`;
            } else if (shape === 'roundrect') {
                // Rounded rectangle (like "Go shopping")
                shapeSvg = `<rect x="${x - w/2}" y="${y - h/2}" width="${w}" height="${h}" rx="25" fill="${fill}" stroke="${stroke}" stroke-width="2" filter="url(#shadow)"/>`;
            } else if (shape === 'diamond') {
                // Diamond (decision)
                const points = `${x},${y - h/2} ${x + w/2},${y} ${x},${y + h/2} ${x - w/2},${y}`;
                shapeSvg = `<polygon points="${points}" fill="${fill}" stroke="${stroke}" stroke-width="2" filter="url(#shadow)"/>`;
            } else if (shape === 'circle') {
                // Circle
                shapeSvg = `<circle cx="${x}" cy="${y}" r="${Math.min(w, h) / 2}" fill="${fill}" stroke="${stroke}" stroke-width="2" filter="url(#shadow)"/>`;
            } else {
                shapeSvg = `<rect x="${x - w/2}" y="${y - h/2}" width="${w}" height="${h}" rx="4" fill="${fill}" stroke="${stroke}" stroke-width="2" filter="url(#shadow)"/>`;
            }

            return `${shapeSvg}
                <text x="${x}" y="${y + 5}" text-anchor="middle" fill="${textColor}" font-size="13" font-weight="500" font-family="'Segoe UI', Arial, sans-serif">${label}</text>`;
        }

        drawEdge(from, to, arrowType, label) {
            const dx = to.x - from.x;
            const dy = to.y - from.y;
            const dist = Math.sqrt(dx*dx + dy*dy);
            if (dist < 1) return '';
            
            // Shorten arrow to avoid overlapping node borders
            const shorten = 30;
            const ratio = shorten / dist;
            const x1 = from.x + dx * ratio;
            const y1 = from.y + dy * ratio;
            const x2 = to.x - dx * ratio;
            const y2 = to.y - dy * ratio;

            const markerMap = {
                '-->': 'url(#arrowhead)',
                '==>': 'url(#arrowhead-thick)',
                '--o': 'url(#arrowhead-circle)',
                '---': '',
                'o--o': 'url(#arrowhead-circle)',
                '||>': 'url(#arrowhead)',
                '|>': 'url(#arrowhead)'
            };
            const marker = markerMap[arrowType] || 'url(#arrowhead)';

            let edge = `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#666" stroke-width="2" marker-end="${marker}" />`;

            // Add label
            if (label) {
                const midX = (x1 + x2) / 2;
                const midY = (y1 + y2) / 2;
                // Offset label slightly above the line
                const angle = Math.atan2(dy, dx);
                const offsetX = -Math.sin(angle) * 16;
                const offsetY = Math.cos(angle) * 16;
                edge += `<text x="${midX + offsetX}" y="${midY + offsetY - 6}" text-anchor="middle" fill="#666" font-size="11" font-weight="500" font-family="'Segoe UI', Arial, sans-serif">${label}</text>`;
            }

            return edge;
        }

        // ============================================================
        // URL PARAMETER HANDLER
        // ============================================================

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
    }

    // ============================================================
    // EXPORT
    // ============================================================

    const instance = new MermaidRenderer();

    if (typeof window !== 'undefined') {
        instance.handleURLParams();
        window.MermaidRenderer = instance;
        window.MermaidRenderer.render = instance.render.bind(instance);
        window.MermaidRenderer.renderSVG = instance.renderSVG.bind(instance);
    }

    return instance;
}));
