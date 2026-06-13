// naijaassets-universal-search.js
// Universal Site Search with Local Index, Deep Linking & Inline Controls
// Drop into any NaijaAssets Student Portal page via <script src="naijaassets-universal-search.js"></script>

(function() {
    'use strict';

    // ==========================================
    // CONFIGURATION
    // ==========================================
    const CONFIG = {
        // Pages to index (discovered automatically + these base paths)
        basePaths: [
            '/dashboard/',
            '/dashboard/classes/',
            '/dashboard/recordings/',
            '/dashboard/payments/',
            '/dashboard/settings/',
            '/dashboard/resources/',
            '/login/',
            '/signup/'
        ],
        // Storage keys
        STORAGE_KEY: 'naijaassets_site_index',
        STORAGE_VERSION_KEY: 'naijaassets_index_version',
        INDEX_VERSION: 3, // Increment to force re-index
        // Search debounce
        DEBOUNCE_MS: 200,
        // Max results to show
        MAX_RESULTS: 8,
        // How long to cache index (ms) - 24 hours
        CACHE_TTL: 24 * 60 * 60 * 1000
    };

    // ==========================================
    // SITE INDEX DATA STRUCTURE
    // ==========================================
    // {
    //   version: 3,
    //   lastIndexed: timestamp,
    //   pages: [
    //     {
    //       url: '/dashboard/settings/',
    //       title: 'Settings | NaijaAssets Student Portal',
    //       sections: [
    //         {
    //           id: 'subscription-section',
    //           heading: 'Subscription & Access',
    //           content: '...',
    //           settings: [
    //             { key: 'notif_class_email', type: 'toggle', label: 'Class Reminders (Email)', current: true }
    //           ]
    //         }
    //       ],
    //       fullText: '...'
    //     }
    //   ],
    //   settings: [
    //     { key: 'notif_class_email', type: 'toggle', label: 'Class Reminders (Email)', page: '/dashboard/settings/', section: 'notif-section' }
    //   ]
    // }

    // ==========================================
    // STATE
    // ==========================================
    let siteIndex = null;
    let isIndexing = false;
    let searchDebounce = null;

    // ==========================================
    // OVERLAY UI CREATION
    // ==========================================
    function createOverlay() {
        // Remove existing if any
        const existing = document.getElementById('naija-universal-search-overlay');
        if (existing) existing.remove();

        const overlay = document.createElement('div');
        overlay.id = 'naija-universal-search-overlay';
        overlay.innerHTML = `
            <div class="nus-backdrop"></div>
            <div class="nus-container">
                <div class="nus-search-header">
                    <svg class="nus-search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <input type="text" class="nus-input" placeholder="Search anything... pages, settings, subjects, recordings..." autocomplete="off">
                    <div class="nus-shortcut">Ctrl+K</div>
                    <button class="nus-close-btn">✕</button>
                </div>
                <div class="nus-results">
                    <div class="nus-empty-state">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        </svg>
                        <p>Start typing to search across all pages</p>
                        <p class="nus-hint">Search pages, settings, subjects, and more</p>
                    </div>
                </div>
                <div class="nus-footer">
                    <span class="nus-footer-item"><kbd>↑↓</kbd> Navigate</span>
                    <span class="nus-footer-item"><kbd>Enter</kbd> Open</span>
                    <span class="nus-footer-item"><kbd>Esc</kbd> Close</span>
                    <span class="nus-footer-item nus-index-status" id="nus-index-status">Index ready</span>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        // Styles
        const style = document.createElement('style');
        style.textContent = `
            #naija-universal-search-overlay {
                position: fixed; inset: 0; z-index: 10000;
                display: none; align-items: flex-start; justify-content: center;
                padding-top: 80px;
            }
            #naija-universal-search-overlay.active { display: flex; }
            .nus-backdrop {
                position: absolute; inset: 0;
                background: rgba(0,0,0,0.5); backdrop-filter: blur(8px);
                -webkit-backdrop-filter: blur(8px);
                animation: nus-fade-in 0.15s ease;
            }
            .nus-container {
                position: relative; width: 100%; max-width: 620px;
                background: #fff; border-radius: 16px;
                box-shadow: 0 25px 60px rgba(0,0,0,0.25);
                overflow: hidden; display: flex; flex-direction: column;
                max-height: 70vh; animation: nus-slide-up 0.2s ease;
            }
            .nus-search-header {
                display: flex; align-items: center; gap: 12px;
                padding: 16px 20px; border-bottom: 1px solid #e5e7eb;
            }
            .nus-search-icon { color: #9ca3af; flex-shrink: 0; }
            .nus-input {
                flex: 1; border: none; outline: none; font-size: 16px;
                font-family: 'Manrope', sans-serif; background: transparent;
                color: #191c1e;
            }
            .nus-input::placeholder { color: #9ca3af; }
            .nus-shortcut {
                font-size: 11px; color: #9ca3af; background: #f3f4f6;
                padding: 3px 8px; border-radius: 6px; font-family: 'Geist', sans-serif;
                font-weight: 600; border: 1px solid #e5e7eb;
            }
            .nus-close-btn {
                width: 32px; height: 32px; border-radius: 8px; border: none;
                background: #f3f4f6; cursor: pointer; font-size: 16px;
                color: #6b7280; display: flex; align-items: center;
                justify-content: center; transition: all 0.15s;
            }
            .nus-close-btn:hover { background: #e5e7eb; color: #374151; }
            .nus-results {
                flex: 1; overflow-y: auto; padding: 8px;
                max-height: 50vh;
            }
            .nus-results::-webkit-scrollbar { width: 5px; }
            .nus-results::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
            .nus-empty-state {
                text-align: center; padding: 40px 20px; color: #9ca3af;
                font-family: 'Manrope', sans-serif;
            }
            .nus-empty-state svg { margin: 0 auto 12px; }
            .nus-empty-state p { margin: 0; font-size: 15px; }
            .nus-hint { font-size: 12px !important; margin-top: 4px !important; }
            .nus-result-item {
                display: flex; align-items: flex-start; gap: 12px;
                padding: 12px 14px; border-radius: 10px; cursor: pointer;
                transition: background 0.1s; font-family: 'Manrope', sans-serif;
            }
            .nus-result-item:hover, .nus-result-item.active { background: #f9fafb; }
            .nus-result-item.active { background: #eff6ff; }
            .nus-result-icon {
                width: 36px; height: 36px; border-radius: 10px;
                display: flex; align-items: center; justify-content: center;
                flex-shrink: 0; font-size: 16px;
            }
            .nus-result-icon.page { background: #dbeafe; color: #1d4ed8; }
            .nus-result-icon.section { background: #fce7f3; color: #be185d; }
            .nus-result-icon.setting { background: #d1fae5; color: #065f46; }
            .nus-result-icon.recording { background: #fef3c7; color: #92400e; }
            .nus-result-icon.subject { background: #ede9fe; color: #6d28d9; }
            .nus-result-content { flex: 1; min-width: 0; }
            .nus-result-title {
                font-size: 14px; font-weight: 600; color: #191c1e;
                margin-bottom: 2px; font-family: 'Hanken Grotesk', sans-serif;
            }
            .nus-result-subtitle {
                font-size: 12px; color: #6b7280;
            }
            .nus-result-badge {
                font-size: 10px; font-weight: 600; padding: 2px 8px;
                border-radius: 12px; flex-shrink: 0;
                font-family: 'Geist', sans-serif;
            }
            .nus-result-badge.page-badge { background: #dbeafe; color: #1d4ed8; }
            .nus-result-badge.setting-badge { background: #d1fae5; color: #065f46; }
            .nus-setting-toggle {
                width: 44px; height: 24px; border-radius: 24px;
                background: #e0e3e5; position: relative; cursor: pointer;
                flex-shrink: 0; transition: background 0.2s;
            }
            .nus-setting-toggle.on { background: #0051d5; }
            .nus-setting-toggle::after {
                content: ''; position: absolute; top: 3px; left: 3px;
                width: 18px; height: 18px; border-radius: 50%;
                background: white; transition: transform 0.2s;
                box-shadow: 0 1px 3px rgba(0,0,0,0.2);
            }
            .nus-setting-toggle.on::after { transform: translateX(20px); }
            .nus-footer {
                display: flex; gap: 12px; padding: 10px 20px;
                border-top: 1px solid #e5e7eb; flex-wrap: wrap;
                font-family: 'Geist', sans-serif;
            }
            .nus-footer-item { font-size: 11px; color: #9ca3af; }
            .nus-footer-item kbd {
                background: #f3f4f6; padding: 1px 5px; border-radius: 4px;
                border: 1px solid #e5e7eb; font-family: 'Geist', sans-serif;
                font-size: 10px; font-weight: 600;
            }
            .nus-index-status { margin-left: auto; }
            .nus-index-status.indexing { color: #f59e0b; }
            .nus-index-status.ready { color: #10b981; }
            .nus-index-status.error { color: #ef4444; }
            @keyframes nus-fade-in { from { opacity: 0; } to { opacity: 1; } }
            @keyframes nus-slide-up { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @media (max-width: 640px) {
                #naija-universal-search-overlay { padding-top: 20px; }
                .nus-container { max-width: 95%; max-height: 85vh; border-radius: 12px; }
                .nus-shortcut { display: none; }
            }
        `;
        document.head.appendChild(style);

        return overlay;
    }

    // ==========================================
    // DOM REFERENCES (lazy)
    // ==========================================
    function getElements() {
        return {
            overlay: document.getElementById('naija-universal-search-overlay'),
            backdrop: document.querySelector('.nus-backdrop'),
            input: document.querySelector('.nus-input'),
            closeBtn: document.querySelector('.nus-close-btn'),
            results: document.querySelector('.nus-results'),
            indexStatus: document.getElementById('nus-index-status'),
            shortcut: document.querySelector('.nus-shortcut')
        };
    }

    // ==========================================
    // OPEN / CLOSE
    // ==========================================
    function openSearch() {
        const els = getElements();
        if (!els.overlay) {
            createOverlay();
            return setTimeout(openSearch, 50);
        }
        els.overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
        setTimeout(() => els.input?.focus(), 100);
        
        // Copy text from main searchbar if present
        const mainSearch = document.querySelector('#recordingsSearch, #searchInput');
        if (mainSearch && mainSearch.value.trim() && els.input) {
            els.input.value = mainSearch.value;
            performSearch(mainSearch.value);
        }
    }

    function closeSearch() {
        const els = getElements();
        if (els.overlay) {
            els.overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
        if (els.input) els.input.value = '';
        if (els.results) {
            els.results.innerHTML = `
                <div class="nus-empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <p>Start typing to search across all pages</p>
                    <p class="nus-hint">Search pages, settings, subjects, and more</p>
                </div>
            `;
        }
    }

    // ==========================================
    // SITE CRAWLER / INDEXER
    // ==========================================
    async function crawlPage(url) {
        try {
            const response = await fetch(url, { 
                headers: { 'X-NaijaAssets-Indexer': '1' }
            });
            if (!response.ok) return null;
            
            const html = await response.text();
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Extract page title
            const title = doc.title || url;
            
            // Extract all sections with data-section-name or ids
            const sections = [];
            const settings = [];
            
            // Find settings sections
            doc.querySelectorAll('section[data-section-name], section[id]').forEach(section => {
                const sectionId = section.id || section.getAttribute('data-section-name');
                const heading = section.querySelector('h2, h3, h4')?.textContent?.trim() || sectionId;
                const content = section.textContent?.trim().substring(0, 2000) || '';
                
                // Extract settings controls
                const sectionSettings = [];
                section.querySelectorAll('[data-key], .toggle-input, input[type="checkbox"]').forEach(el => {
                    const key = el.dataset.key || el.id || el.name;
                    const label = el.closest('label')?.textContent?.trim() || 
                                  el.closest('div')?.querySelector('p')?.textContent?.trim() || key;
                    const type = el.classList.contains('toggle-input') || el.type === 'checkbox' ? 'toggle' : 'input';
                    const current = el.checked !== undefined ? el.checked : el.value;
                    
                    if (key) {
                        sectionSettings.push({ key, type, label, current });
                        settings.push({
                            key, type, label, current,
                            page: url,
                            section: sectionId,
                            sectionName: heading
                        });
                    }
                });
                
                sections.push({
                    id: sectionId,
                    heading,
                    content,
                    settings: sectionSettings
                });
            });
            
            // Also extract subject checkboxes and other interactive elements
            doc.querySelectorAll('.subject-checkbox, .filter-chip, .subject-card').forEach(el => {
                const label = el.textContent?.trim() || el.value || '';
                if (label && label.length < 100) {
                    sections.push({
                        id: el.id || el.dataset.subject || el.dataset.filter || '',
                        heading: label,
                        content: label,
                        settings: []
                    });
                }
            });
            
            // Full text for search
            const fullText = doc.body?.textContent?.replace(/\s+/g, ' ').trim() || '';
            
            return { url, title, sections, settings, fullText };
        } catch (err) {
            console.warn(`[NaijaSearch] Failed to crawl ${url}:`, err.message);
            return null;
        }
    }

    async function discoverPages() {
        const pages = new Set(CONFIG.basePaths);
        
        // Try to discover more pages from current page links
        document.querySelectorAll('a[href^="/"]').forEach(link => {
            const href = link.getAttribute('href');
            if (href && !href.startsWith('//') && !href.startsWith('http')) {
                // Clean the URL (remove hash and query)
                const cleanUrl = href.split('#')[0].split('?')[0];
                if (cleanUrl.startsWith('/dashboard/') || cleanUrl.startsWith('/login') || cleanUrl.startsWith('/signup')) {
                    pages.add(cleanUrl);
                }
            }
        });
        
        return Array.from(pages);
    }

    async function buildIndex(force = false) {
        // Check if we have a valid cached index
        const cached = localStorage.getItem(CONFIG.STORAGE_KEY);
        const cachedVersion = localStorage.getItem(CONFIG.STORAGE_VERSION_KEY);
        
        if (!force && cached && cachedVersion == CONFIG.INDEX_VERSION) {
            try {
                const parsed = JSON.parse(cached);
                const age = Date.now() - parsed.lastIndexed;
                if (age < CONFIG.CACHE_TTL) {
                    siteIndex = parsed;
                    updateIndexStatus('ready');
                    return parsed;
                }
            } catch (e) { /* Corrupted, rebuild */ }
        }
        
        if (isIndexing) return siteIndex;
        isIndexing = true;
        updateIndexStatus('indexing');
        
        try {
            const pages = await discoverPages();
            const indexedPages = [];
            const allSettings = [];
            
            // Index pages in parallel (with concurrency limit of 3)
            const concurrency = 3;
            for (let i = 0; i < pages.length; i += concurrency) {
                const batch = pages.slice(i, i + concurrency);
                const results = await Promise.all(batch.map(url => crawlPage(url)));
                results.forEach(result => {
                    if (result) {
                        indexedPages.push(result);
                        allSettings.push(...result.settings);
                    }
                });
            }
            
            siteIndex = {
                version: CONFIG.INDEX_VERSION,
                lastIndexed: Date.now(),
                pages: indexedPages,
                settings: allSettings
            };
            
            // Cache to localStorage
            try {
                localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(siteIndex));
                localStorage.setItem(CONFIG.STORAGE_VERSION_KEY, CONFIG.INDEX_VERSION);
            } catch (e) {
                // localStorage might be full, try to clear old data
                console.warn('[NaijaSearch] localStorage full, clearing old index');
                localStorage.removeItem(CONFIG.STORAGE_KEY);
                try {
                    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(siteIndex));
                } catch (e2) {
                    console.warn('[NaijaSearch] Cannot cache index');
                }
            }
            
            updateIndexStatus('ready');
            return siteIndex;
        } catch (err) {
            console.error('[NaijaSearch] Indexing failed:', err);
            updateIndexStatus('error');
            return siteIndex;
        } finally {
            isIndexing = false;
        }
    }

    function updateIndexStatus(status) {
        const el = document.getElementById('nus-index-status');
        if (!el) return;
        el.classList.remove('indexing', 'ready', 'error');
        el.classList.add(status);
        el.textContent = status === 'indexing' ? 'Indexing...' : 
                         status === 'ready' ? 'Index ready' : 
                         'Index error';
    }

    // ==========================================
    // SEARCH ENGINE
    // ==========================================
    function performSearch(query) {
        const els = getElements();
        if (!els.results || !siteIndex) return;

        if (!query || query.trim().length < 1) {
            els.results.innerHTML = `
                <div class="nus-empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                    </svg>
                    <p>Start typing to search across all pages</p>
                    <p class="nus-hint">Search pages, settings, subjects, and more</p>
                </div>
            `;
            return;
        }

        const q = query.toLowerCase().trim();
        const results = [];
        
        // 1. Search pages by title/fullText
        for (const page of siteIndex.pages) {
            const titleScore = fuzzyMatch(page.title.toLowerCase(), q);
            const textScore = fuzzyMatch(page.fullText.substring(0, 5000).toLowerCase(), q);
            const maxScore = Math.max(titleScore, textScore);
            
            if (maxScore > 0) {
                // Find relevant snippet
                const snippet = findSnippet(page.fullText, q);
                
                results.push({
                    type: 'page',
                    score: maxScore + (titleScore > 0 ? 0.5 : 0),
                    title: page.title,
                    subtitle: snippet || page.url,
                    url: page.url,
                    icon: 'fa-file-lines'
                });
            }
            
            // 2. Search sections within pages
            for (const section of page.sections) {
                const sectionScore = fuzzyMatch(section.heading.toLowerCase(), q) * 1.5 +
                                     fuzzyMatch(section.content.toLowerCase(), q);
                
                if (sectionScore > 0.3) {
                    results.push({
                        type: 'section',
                        score: sectionScore,
                        title: section.heading,
                        subtitle: `in ${page.title}`,
                        url: `${page.url}#${section.id}`,
                        pageUrl: page.url,
                        sectionId: section.id,
                        icon: 'fa-hashtag'
                    });
                }
                
                // 3. Search settings
                for (const setting of section.settings) {
                    const settingScore = fuzzyMatch(setting.label.toLowerCase(), q) * 2;
                    if (settingScore > 0.3) {
                        results.push({
                            type: 'setting',
                            score: settingScore + 0.2,
                            title: setting.label,
                            subtitle: `${setting.type === 'toggle' ? (setting.current ? 'ON' : 'OFF') : setting.current} · ${page.title}`,
                            url: `${page.url}#${section.id}`,
                            setting: setting,
                            pageUrl: page.url,
                            sectionId: section.id,
                            icon: 'fa-gear'
                        });
                    }
                }
            }
        }
        
        // 4. Also search settings globally
        for (const setting of siteIndex.settings) {
            const settingScore = fuzzyMatch(setting.label.toLowerCase(), q) * 2;
            if (settingScore > 0.5) {
                // Check if already added
                if (!results.find(r => r.setting?.key === setting.key)) {
                    results.push({
                        type: 'setting',
                        score: settingScore,
                        title: setting.label,
                        subtitle: `${setting.type === 'toggle' ? (setting.current ? 'ON' : 'OFF') : setting.current} · ${setting.sectionName}`,
                        url: `${setting.page}#${setting.section}`,
                        setting: setting,
                        pageUrl: setting.page,
                        sectionId: setting.section,
                        icon: 'fa-gear'
                    });
                }
            }
        }
        
        // Sort by score (descending) and limit
        results.sort((a, b) => b.score - a.score);
        const topResults = results.slice(0, CONFIG.MAX_RESULTS);
        
        // Render
        if (topResults.length === 0) {
            els.results.innerHTML = `
                <div class="nus-empty-state">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                        <line x1="8" y1="11" x2="14" y2="11"/>
                    </svg>
                    <p>No results for "<strong>${escapeHTML(query)}</strong>"</p>
                    <p class="nus-hint">Try a different search term</p>
                </div>
            `;
            return;
        }
        
        els.results.innerHTML = topResults.map((result, index) => {
            const typeClass = result.type === 'page' ? 'page' : 
                             result.type === 'section' ? 'section' : 
                             result.type === 'setting' ? 'setting' : 'recording';
            const badgeClass = result.type === 'page' ? 'page-badge' : 'setting-badge';
            const iconMap = {
                'page': 'fa-solid fa-file-lines',
                'section': 'fa-solid fa-hashtag',
                'setting': 'fa-solid fa-gear',
                'recording': 'fa-solid fa-video',
                'subject': 'fa-solid fa-book'
            };
            
            let actionHtml = '';
            if (result.type === 'setting' && result.setting?.type === 'toggle') {
                actionHtml = `<div class="nus-setting-toggle ${result.setting.current ? 'on' : ''}" 
                                   data-setting-key="${result.setting.key}" 
                                   data-setting-type="${result.setting.type}"
                                   onclick="event.stopPropagation(); window.NaijaUniversalSearch.toggleSetting('${result.setting.key}', this)"></div>`;
            } else {
                actionHtml = `<span class="nus-result-badge ${badgeClass}">${result.type.toUpperCase()}</span>`;
            }
            
            return `
                <div class="nus-result-item" data-index="${index}" data-url="${result.url}" data-type="${result.type}" data-setting-key="${result.setting?.key || ''}">
                    <div class="nus-result-icon ${typeClass}">
                        <i class="${iconMap[result.type] || 'fa-solid fa-link'}"></i>
                    </div>
                    <div class="nus-result-content">
                        <div class="nus-result-title">${highlightMatch(result.title, query)}</div>
                        <div class="nus-result-subtitle">${escapeHTML(result.subtitle)}</div>
                    </div>
                    ${actionHtml}
                </div>
            `;
        }).join('');
        
        // Add click handlers
        els.results.querySelectorAll('.nus-result-item').forEach(item => {
            item.addEventListener('click', () => {
                const url = item.dataset.url;
                const type = item.dataset.type;
                const settingKey = item.dataset.settingKey;
                
                if (type === 'setting' && settingKey) {
                    // Toggle setting inline, then navigate
                    toggleSettingFromSearch(settingKey);
                }
                
                if (url) {
                    navigateToUrl(url);
                }
                closeSearch();
            });
        });
        
        // Set first item as active for keyboard nav
        if (topResults.length > 0) {
            els.results.querySelector('.nus-result-item')?.classList.add('active');
        }
    }

    function findSnippet(text, query) {
        const q = query.toLowerCase();
        const idx = text.toLowerCase().indexOf(q);
        if (idx === -1) {
            // Return first 80 chars
            return text.substring(0, 80).trim() + '...';
        }
        const start = Math.max(0, idx - 40);
        const end = Math.min(text.length, idx + q.length + 60);
        let snippet = text.substring(start, end).trim();
        if (start > 0) snippet = '...' + snippet;
        if (end < text.length) snippet += '...';
        return snippet;
    }

    function fuzzyMatch(text, query) {
        if (!query) return 0;
        if (text.includes(query)) return 1;
        
        // Simple fuzzy: count matching characters in sequence
        let score = 0;
        let queryIdx = 0;
        let consecutive = 0;
        
        for (let i = 0; i < text.length && queryIdx < query.length; i++) {
            if (text[i] === query[queryIdx]) {
                queryIdx++;
                consecutive++;
                score += consecutive * 0.1;
            } else {
                consecutive = 0;
            }
        }
        
        return queryIdx === query.length ? Math.min(1, score) : 0;
    }

    function highlightMatch(text, query) {
        if (!query) return escapeHTML(text);
        const regex = new RegExp(`(${escapeRegex(query)})`, 'gi');
        return escapeHTML(text).replace(regex, '<mark style="background:#fef08a;color:#191c1e;padding:0 2px;border-radius:2px;">$1</mark>');
    }

    // ==========================================
    // NAVIGATION & DEEP LINKING
    // ==========================================
    function navigateToUrl(url) {
        if (url.startsWith('#')) {
            // Same page anchor
            const el = document.querySelector(url);
            if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                // Highlight the section
                el.style.transition = 'box-shadow 0.3s';
                el.style.boxShadow = '0 0 0 4px rgba(0, 81, 213, 0.3)';
                setTimeout(() => { el.style.boxShadow = ''; }, 2000);
            }
        } else if (url.startsWith('/')) {
            // Internal page
            window.location.href = url;
        }
    }

    function toggleSettingFromSearch(key) {
        // Try to find and toggle the setting on current page
        const currentEl = document.querySelector(`[data-key="${key}"]`);
        if (currentEl && currentEl.type === 'checkbox') {
            currentEl.checked = !currentEl.checked;
            currentEl.dispatchEvent(new Event('change', { bubbles: true }));
            
            // Update the index
            if (siteIndex) {
                for (const setting of siteIndex.settings) {
                    if (setting.key === key) {
                        setting.current = !setting.current;
                    }
                }
                for (const page of siteIndex.pages) {
                    for (const section of page.sections) {
                        for (const setting of section.settings) {
                            if (setting.key === key) {
                                setting.current = !setting.current;
                            }
                        }
                    }
                }
                // Save updated index
                try {
                    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(siteIndex));
                } catch (e) {}
            }
            
            showToast(`Toggled: ${key}`);
        }
    }

    // ==========================================
    // KEYBOARD NAVIGATION
    // ==========================================
    let activeIndex = -1;

    function handleKeyboard(e) {
        const els = getElements();
        if (!els.overlay?.classList.contains('active')) return;
        
        const items = els.results?.querySelectorAll('.nus-result-item');
        if (!items || items.length === 0) return;
        
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            activeIndex = Math.min(activeIndex + 1, items.length - 1);
            updateActiveItem(items);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            activeIndex = Math.max(activeIndex - 1, 0);
            updateActiveItem(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            const activeItem = items[activeIndex];
            if (activeItem) {
                activeItem.click();
            }
        } else if (e.key === 'Escape') {
            closeSearch();
        }
    }

    function updateActiveItem(items) {
        items.forEach((item, i) => {
            item.classList.toggle('active', i === activeIndex);
            if (i === activeIndex) {
                item.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    // ==========================================
    // SETTING TOGGLE FROM SEARCH RESULTS
    // ==========================================
    window.NaijaUniversalSearch = {
        toggleSetting: function(key, toggleEl) {
            toggleSettingFromSearch(key);
            if (toggleEl) {
                toggleEl.classList.toggle('on');
            }
        },
        open: openSearch,
        close: closeSearch,
        rebuildIndex: () => buildIndex(true),
        getIndex: () => siteIndex
    };

    // ==========================================
    // TOAST NOTIFICATION
    // ==========================================
    function showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%);
            background: #191c1e; color: white; padding: 10px 20px; border-radius: 12px;
            font-family: 'Geist', sans-serif; font-size: 13px; font-weight: 600;
            z-index: 10001; animation: nus-slide-up 0.3s ease;
            box-shadow: 0 8px 24px rgba(0,0,0,0.2);
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transition = 'opacity 0.3s';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // ==========================================
    // UTILITIES
    // ==========================================
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function escapeRegex(str) {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // ==========================================
    // EVENT LISTENERS & INIT
    // ==========================================
    function init() {
        createOverlay();
        
        const els = getElements();
        
        // Open/Close handlers
        if (els.backdrop) els.backdrop.addEventListener('click', closeSearch);
        if (els.closeBtn) els.closeBtn.addEventListener('click', closeSearch);
        
        // Search input
        if (els.input) {
            els.input.addEventListener('input', (e) => {
                clearTimeout(searchDebounce);
                activeIndex = -1;
                searchDebounce = setTimeout(() => {
                    performSearch(e.target.value);
                }, CONFIG.DEBOUNCE_MS);
            });
        }
        
        // Keyboard shortcut: Ctrl+K
        document.addEventListener('keydown', (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                openSearch();
            }
            handleKeyboard(e);
        });
        
        // Latch onto existing searchbars
        document.querySelectorAll('#recordingsSearch, #searchInput, input[type="search"]').forEach(input => {
            input.addEventListener('focus', (e) => {
                e.preventDefault();
                input.blur();
                openSearch();
            });
            input.addEventListener('click', (e) => {
                e.preventDefault();
                openSearch();
            });
            input.setAttribute('readonly', 'readonly');
            input.style.cursor = 'pointer';
            if (!input.placeholder.includes('Ctrl+K')) {
                input.placeholder = 'Press Ctrl+K to search...';
            }
        });
        
        // Click search icons
        document.querySelectorAll('.fa-magnifying-glass').forEach(icon => {
            const parent = icon.closest('div, button');
            if (parent) {
                parent.style.cursor = 'pointer';
                parent.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openSearch();
                });
            }
        });
        
        // Build index in background
        buildIndex();
        
        // Re-index when navigating to new pages (after page load)
        window.addEventListener('load', () => {
            setTimeout(() => buildIndex(), 2000);
        });
        
        console.log('[NaijaUniversalSearch] ✅ Ready — Press Ctrl+K to search everything');
    }

    // Start when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
