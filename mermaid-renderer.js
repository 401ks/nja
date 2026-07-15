/**
 * Mermaid Renderer - with Pencil Sketch Mode & Saveable SVG
 * 
 * Usage:
 * 1. URL: http://localhost:3000/mermaid-renderer.js?code=graph%20TD%3BA--%3EB&style=pencil
 * 2. Script: <script src="..."></script> then MermaidRenderer.render(code, '#target', { style: 'pencil' })
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
            this.version = '4.2.0';
            this.ready = false;
            this.mermaid = null;
            this.loading = false;
        }

        // ============================================================
        // LOAD MERMAID
        // ============================================================

        loadMermaid() {
            return new Promise((resolve, reject) => {
                if (this.ready && this.mermaid) {
                    resolve(this.mermaid);
                    return;
                }

                if (typeof mermaid !== 'undefined') {
                    this.mermaid = mermaid;
                    this.ready = true;
                    this.mermaid.initialize({
                        theme: 'default',
                        themeVariables: {
                            background: '#ffffff',
                            primaryColor: '#5341cd',
                            primaryTextColor: '#1b1c1a',
                            primaryBorderColor: '#5341cd',
                            lineColor: '#666666',
                            secondaryColor: '#f0f4ff',
                            tertiaryColor: '#f8f9fa',
                            fontFamily: 'Comic Sans MS, "Chalkboard SE", "Segoe UI", cursive, sans-serif'
                        }
                    });
                    resolve(mermaid);
                    return;
                }

                if (this.loading) {
                    const check = () => {
                        if (this.ready) {
                            resolve(this.mermaid);
                        } else {
                            setTimeout(check, 100);
                        }
                    };
                    check();
                    return;
                }

                this.loading = true;
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/mermaid@10/dist/mermaid.min.js';
                script.async = true;
                
                script.onload = () => {
                    if (typeof mermaid !== 'undefined') {
                        this.mermaid = mermaid;
                        this.ready = true;
                        this.mermaid.initialize({
                            theme: 'default',
                            themeVariables: {
                                background: '#ffffff',
                                primaryColor: '#5341cd',
                                primaryTextColor: '#1b1c1a',
                                primaryBorderColor: '#5341cd',
                                lineColor: '#666666',
                                secondaryColor: '#f0f4ff',
                                tertiaryColor: '#f8f9fa',
                                fontFamily: 'Comic Sans MS, "Chalkboard SE", "Segoe UI", cursive, sans-serif'
                            }
                        });
                        this.loading = false;
                        resolve(mermaid);
                    } else {
                        this.loading = false;
                        reject(new Error('Mermaid library failed to load'));
                    }
                };
                
                script.onerror = () => {
                    this.loading = false;
                    reject(new Error('Failed to load Mermaid from CDN'));
                };
                
                document.head.appendChild(script);
            });
        }

        // ============================================================
        // PENCIL SKETCH STYLES (Fixed - No Layout Drift)
        // ============================================================

        applyPencilStyle(svg) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(svg, 'image/svg+xml');
            const svgEl = doc.querySelector('svg');
            
            if (!svgEl) return svg;

            // 1. Add pencil sketch CSS - NO ROTATION
            const style = doc.createElement('style');
            style.textContent = `
                /* Hand-drawn / Pencil style - No rotation to prevent layout drift */
                .pencil-sketch line,
                .pencil-sketch polyline,
                .pencil-sketch polygon,
                .pencil-sketch rect,
                .pencil-sketch circle,
                .pencil-sketch ellipse,
                .pencil-sketch path {
                    stroke-linecap: round;
                    stroke-linejoin: round;
                }
                
                /* Hand-drawn text */
                .pencil-sketch text {
                    font-family: 'Comic Sans MS', 'Chalkboard SE', 'Segoe UI', cursive, sans-serif !important;
                    letter-spacing: 0.3px;
                }
                
                /* Subtle pencil stroke effect */
                .pencil-sketch .node-rect,
                .pencil-sketch .node-circle,
                .pencil-sketch .node-polygon {
                    filter: url(#pencilSketch);
                }
                
                /* Slight wobble on paths only - no position shift */
                .pencil-sketch path {
                    filter: url(#pencilSketch);
                }
            `;
            svgEl.appendChild(style);

            // 2. Add pencil sketch filter (creates hand-drawn look without moving nodes)
            const defs = svgEl.querySelector('defs') || doc.createElement('defs');
            if (!svgEl.querySelector('defs')) {
                svgEl.prepend(defs);
            }
            
            // Main pencil sketch filter - subtle displacement
            const pencilFilter = doc.createElement('filter');
            pencilFilter.id = 'pencilSketch';
            pencilFilter.innerHTML = `
                <feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.2" xChannelSelector="R" yChannelSelector="G" />
                <feGaussianBlur stdDeviation="0.3" />
                <feMerge>
                    <feMergeNode />
                    <feMergeNode in="SourceGraphic" />
                </feMerge>
            `;
            defs.appendChild(pencilFilter);

            // 3. Shadow filter for depth
            const shadowFilter = doc.createElement('filter');
            shadowFilter.id = 'pencilShadow';
            shadowFilter.innerHTML = `
                <feDropShadow dx="1" dy="1.5" stdDeviation="1.5" flood-opacity="0.12" />
            `;
            defs.appendChild(shadowFilter);

            // 4. Apply pencil class to all shapes (NO rotation)
            const allShapes = svgEl.querySelectorAll('rect, circle, ellipse, polygon, polyline, path, line');
            allShapes.forEach(el => {
                el.classList.add('pencil-sketch');
            });

            // 5. Apply to text
            const texts = svgEl.querySelectorAll('text');
            texts.forEach(el => {
                el.classList.add('pencil-sketch');
            });

            // 6. Add pencil sketch filter to shapes (but keep them in place)
            const largeShapes = svgEl.querySelectorAll('rect[node-id], polygon[node-id], circle[node-id]');
            largeShapes.forEach(el => {
                el.setAttribute('filter', 'url(#pencilSketch)');
            });

            // 7. Add shadow to nodes
            const nodeGroups = svgEl.querySelectorAll('.node-rect, .node-circle, .node-polygon');
            nodeGroups.forEach(el => {
                el.setAttribute('filter', 'url(#pencilShadow)');
            });

            return svgEl.outerHTML;
        }

        // ============================================================
        // RENDER METHODS
        // ============================================================

        async render(code, target, options = {}) {
            await this.loadMermaid();
            
            const id = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
            const container = document.createElement('div');
            container.id = id;
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '-9999px';
            container.style.width = '1000px';
            container.style.height = '800px';
            document.body.appendChild(container);
            
            try {
                if (options.theme || options.themeVariables) {
                    this.mermaid.initialize({
                        theme: options.theme || 'default',
                        themeVariables: {
                            ...this.mermaid.themeVariables,
                            ...(options.themeVariables || {})
                        }
                    });
                }
                
                const { svg } = await this.mermaid.render(id, code);
                
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
                
                let finalSvg = svg;
                
                if (options.style === 'pencil') {
                    finalSvg = this.applyPencilStyle(svg);
                }
                
                // Insert SVG into target
                if (target) {
                    const targetEl = typeof target === 'string' 
                        ? document.querySelector(target) 
                        : target;
                    
                    if (targetEl) {
                        targetEl.innerHTML = finalSvg;
                    } else {
                        console.warn('Target element not found:', target);
                        return finalSvg;
                    }
                }
                
                return finalSvg;
            } catch (error) {
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
                throw error;
            }
        }

        async renderSVG(code, options = {}) {
            await this.loadMermaid();
            
            const id = 'mermaid-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4);
            const container = document.createElement('div');
            container.id = id;
            container.style.position = 'absolute';
            container.style.left = '-9999px';
            container.style.top = '-9999px';
            document.body.appendChild(container);
            
            try {
                if (options.theme || options.themeVariables) {
                    this.mermaid.initialize({
                        theme: options.theme || 'default',
                        themeVariables: {
                            ...this.mermaid.themeVariables,
                            ...(options.themeVariables || {})
                        }
                    });
                }
                
                const { svg } = await this.mermaid.render(id, code);
                
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
                
                if (options.style === 'pencil') {
                    return this.applyPencilStyle(svg);
                }
                
                return svg;
            } catch (error) {
                if (container.parentNode) {
                    container.parentNode.removeChild(container);
                }
                throw error;
            }
        }

        // ============================================================
        // URL PARAMETER HANDLER
        // ============================================================

        async handleURLParams() {
            const params = new URLSearchParams(window.location.search);
            const code = params.get('code');
            
            if (!code) return false;
            
            const target = params.get('target') || '#mermaid-output';
            const theme = params.get('theme') || 'default';
            const style = params.get('style') || 'clean';
            const decoded = decodeURIComponent(code);
            
            try {
                await this.loadMermaid();
                
                let targetEl = document.querySelector(target);
                if (!targetEl) {
                    targetEl = document.createElement('div');
                    targetEl.id = target.replace('#', '');
                    document.body.appendChild(targetEl);
                }
                
                await this.render(decoded, targetEl, { theme, style });
                return true;
            } catch (err) {
                console.error('Mermaid Render Error:', err);
                const targetEl = document.querySelector(target);
                if (targetEl) {
                    targetEl.innerHTML = `<div style="color: #ba1a1a; padding: 20px; border: 1px solid #ba1a1a; border-radius: 8px; background: #ffdad6; font-family: sans-serif;">
                        <strong>Error rendering diagram:</strong><br>
                        ${err.message}
                    </div>`;
                }
                return false;
            }
        }
    }

    // ============================================================
    // EXPORT
    // ============================================================

    const instance = new MermaidRenderer();

    if (typeof window !== 'undefined') {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                instance.handleURLParams().catch(console.error);
            });
        } else {
            instance.handleURLParams().catch(console.error);
        }

        window.MermaidRenderer = instance;
        window.MermaidRenderer.render = instance.render.bind(instance);
        window.MermaidRenderer.renderSVG = instance.renderSVG.bind(instance);
        window.MermaidRenderer.loadMermaid = instance.loadMermaid.bind(instance);
        window.MermaidRenderer.applyPencilStyle = instance.applyPencilStyle.bind(instance);
    }

    return instance;
}));
