// naijaassets-search.js - MVP Search Overlay
(function() {
    'use strict';
    
    const API_BASE_URL = 'https://rexapi.naijaassets.com';
    
    // ==========================================
    // CREATE SEARCH OVERLAY UI
    // ==========================================
    const overlayHTML = `
        <div id="naija-search-overlay" style="display:none; position:fixed; inset:0; z-index:9999; background:rgba(0,0,0,0.6); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px);">
            <div style="position:absolute; inset:0;" id="naija-search-backdrop"></div>
            <div style="position:relative; max-width:640px; margin:80px auto 0; background:#fff; border-radius:20px; box-shadow:0 25px 60px rgba(0,0,0,0.3); overflow:hidden; max-height:80vh; display:flex; flex-direction:column;">
                <!-- Search Header -->
                <div style="display:flex; align-items:center; gap:12px; padding:16px 20px; border-bottom:1px solid #e5e7eb;">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input id="naija-search-input" type="text" placeholder="Search recordings, subjects, teachers..." style="flex:1; border:none; outline:none; font-size:16px; font-family:'Manrope',sans-serif; background:transparent; color:#191c1e;" autocomplete="off">
                    <button id="naija-search-close" style="width:32px; height:32px; border-radius:50%; border:none; background:#f3f4f6; cursor:pointer; display:flex; align-items:center; justify-content:center; color:#6b7280; font-size:18px; transition:all 0.2s;">✕</button>
                </div>
                <!-- Results Area -->
                <div id="naija-search-results" style="overflow-y:auto; flex:1; padding:8px;">
                    <div style="text-align:center; padding:40px 20px; color:#9ca3af;">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                        <p style="margin:0; font-size:15px; font-family:'Manrope',sans-serif;">Start typing to search recordings</p>
                    </div>
                </div>
                <!-- Footer -->
                <div id="naija-search-footer" style="padding:10px 20px; border-top:1px solid #e5e7eb; text-align:center; font-size:11px; color:#9ca3af; font-family:'Manrope',sans-serif; display:none;"></div>
            </div>
        </div>
    `;

    document.body.insertAdjacentHTML('beforeend', overlayHTML);

    // ==========================================
    // DOM ELEMENTS
    // ==========================================
    const overlay = document.getElementById('naija-search-overlay');
    const backdrop = document.getElementById('naija-search-backdrop');
    const input = document.getElementById('naija-search-input');
    const closeBtn = document.getElementById('naija-search-close');
    const resultsDiv = document.getElementById('naija-search-results');
    const footerDiv = document.getElementById('naija-search-footer');

    // ==========================================
    // STATE
    // ==========================================
    let debounceTimer = null;
    let cachedRecordings = [];
    let isAuthenticated = false;
    let accessToken = null;
    let currentTier = 'public';

    // ==========================================
    // DETECT AUTH FROM SUPABASE
    // ==========================================
    async function detectAuth() {
        try {
            // Try to get Supabase session if available globally
            if (typeof supabase !== 'undefined' && supabase.auth) {
                const { data: { session } } = await supabase.auth.getSession();
                if (session) {
                    isAuthenticated = true;
                    accessToken = session.access_token;
                }
            }
            // Also check if there's a token in the script's data attribute or global var
            if (window.__NAIJAASSETS_TOKEN) {
                isAuthenticated = true;
                accessToken = window.__NAIJAASSETS_TOKEN;
            }
        } catch (e) {
            console.log('[NaijaSearch] Not authenticated, using public tier');
        }
    }

    // ==========================================
    // API CALL
    // ==========================================
    async function searchAPI(query) {
        if (!query || query.trim().length < 2) {
            return { recordings: [], tier: 'public', total: 0 };
        }

        const url = new URL(`${API_BASE_URL}/api/recordings`);
        url.searchParams.append('search', query.trim());

        const headers = { 'Content-Type': 'application/json' };
        if (isAuthenticated && accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`;
        }

        try {
            const response = await fetch(url.toString(), { method: 'GET', headers });
            if (!response.ok) throw new Error(`API ${response.status}`);
            return await response.json();
        } catch (err) {
            console.error('[NaijaSearch] API error:', err);
            // Fallback to client-side filtering if API fails
            if (cachedRecordings.length > 0) {
                return fallbackSearch(query);
            }
            return { recordings: [], tier: 'public', total: 0, error: err.message };
        }
    }

    // ==========================================
    // FALLBACK: CLIENT-SIDE SEARCH
    // ==========================================
    function fallbackSearch(query) {
        const q = query.toLowerCase();
        const filtered = cachedRecordings.filter(rec => {
            const searchable = `${rec.title || ''} ${rec.description || ''} ${rec.teacher || ''} ${rec.subject || ''} ${rec.tags || ''}`.toLowerCase();
            return searchable.includes(q);
        });
        return { recordings: filtered.slice(0, 20), tier: currentTier, total: filtered.length };
    }

    // ==========================================
    // RENDER RESULTS
    // ==========================================
    function renderResults(data, query) {
        const recordings = data.recordings || [];
        const tier = data.tier || 'public';
        currentTier = tier;

        if (recordings.length === 0) {
            resultsDiv.innerHTML = `
                <div style="text-align:center; padding:40px 20px;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
                    <p style="margin:0 0 4px; font-size:15px; font-family:'Manrope',sans-serif; color:#374151;">No results for "<strong>${escapeHTML(query)}</strong>"</p>
                    <p style="margin:0; font-size:13px; color:#9ca3af; font-family:'Manrope',sans-serif;">Try a different search term</p>
                </div>
            `;
            footerDiv.style.display = 'none';
            return;
        }

        // Update footer
        footerDiv.style.display = 'block';
        footerDiv.innerHTML = `${data.total || recordings.length} recording${recordings.length !== 1 ? 's' : ''} found • Tier: ${tier.toUpperCase()}`;

        // Build result cards
        resultsDiv.innerHTML = recordings.map((rec, index) => {
            const canWatch = rec.video_url !== null;
            const thumbnail = rec.thumbnail_url 
                ? rec.thumbnail_url 
                : `https://img.youtube.com/vi/default/mqdefault.jpg`;
            const gradeColor = getGradeColor(rec.grade);
            const subjectIcon = getSubjectIcon(rec.subject);

            return `
                <div class="naija-result-card" style="display:flex; gap:14px; padding:14px; border-radius:14px; cursor:pointer; transition:background 0.15s; margin-bottom:4px;"
                     onmouseover="this.style.background='#f9fafb'" 
                     onmouseout="this.style.background='transparent'"
                     data-index="${index}"
                     data-video-url="${canWatch ? rec.video_url : ''}"
                     data-is-premium="${rec.is_premium || 0}"
                     data-title="${escapeHTML(rec.title)}">
                    
                    <!-- Thumbnail -->
                    <div style="position:relative; width:140px; min-width:140px; height:85px; border-radius:10px; overflow:hidden; background:#f3f4f6; flex-shrink:0;">
                        <img src="${thumbnail}" alt="" style="width:100%; height:100%; object-fit:cover; ${!canWatch ? 'filter:grayscale(0.3); opacity:0.7;' : ''}" loading="lazy" onerror="this.style.display='none'">
                        ${!canWatch ? `
                            <div style="position:absolute; inset:0; background:rgba(0,0,0,0.35); display:flex; align-items:center; justify-content:center;">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </div>
                        ` : ''}
                        <div style="position:absolute; bottom:6px; right:6px; background:rgba(0,0,0,0.75); color:white; font-size:10px; padding:2px 7px; border-radius:5px; font-family:'Geist',sans-serif; font-weight:600;">
                            ${rec.duration || '--:--'}
                        </div>
                        ${rec.is_premium ? `
                            <div style="position:absolute; top:6px; left:6px; background:#f59e0b; color:white; font-size:9px; padding:2px 7px; border-radius:4px; font-family:'Geist',sans-serif; font-weight:700; letter-spacing:0.05em;">
                                PREMIUM
                            </div>
                        ` : ''}
                    </div>

                    <!-- Info -->
                    <div style="flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center;">
                        <h4 style="margin:0 0 4px; font-size:14px; font-weight:600; color:#191c1e; font-family:'Hanken Grotesk',sans-serif; line-height:1.3; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">
                            ${escapeHTML(rec.title)}
                        </h4>
                        <div style="display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-bottom:4px;">
                            <span style="font-size:12px; color:#6b7280; font-family:'Manrope',sans-serif;">
                                ${subjectIcon} ${escapeHTML(rec.subject || 'General')}
                            </span>
                            <span style="font-size:11px; padding:2px 8px; border-radius:12px; background:${gradeColor.bg}; color:${gradeColor.text}; font-weight:600; font-family:'Geist',sans-serif;">
                                ${escapeHTML(rec.grade || 'N/A')}
                            </span>
                        </div>
                        <div style="display:flex; align-items:center; gap:12px; font-size:11px; color:#9ca3af; font-family:'Manrope',sans-serif;">
                            ${rec.teacher ? `<span>👤 ${escapeHTML(rec.teacher)}</span>` : ''}
                            ${rec.view_count ? `<span>👁 ${rec.view_count.toLocaleString()}</span>` : ''}
                            ${rec.created_at ? `<span>📅 ${formatDate(rec.created_at)}</span>` : ''}
                        </div>
                    </div>

                    <!-- Action -->
                    <div style="display:flex; align-items:center; flex-shrink:0;">
                        ${canWatch ? `
                            <a href="${rec.video_url}" target="_blank" style="width:36px; height:36px; border-radius:50%; background:#0051d5; color:white; display:flex; align-items:center; justify-content:center; text-decoration:none; flex-shrink:0;" 
                               onclick="event.stopPropagation();" title="Watch now">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                            </a>
                        ` : `
                            <button style="width:36px; height:36px; border-radius:50%; background:#f3f4f6; color:#9ca3af; border:none; cursor:pointer; display:flex; align-items:center; justify-content:center; flex-shrink:0;"
                                    onclick="event.stopPropagation();" title="Locked">
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                            </button>
                        `}
                    </div>
                </div>
            `;
        }).join('');

        // Add click handlers to result cards
        resultsDiv.querySelectorAll('.naija-result-card').forEach(card => {
            card.addEventListener('click', function() {
                const videoUrl = this.getAttribute('data-video-url');
                const isPremium = this.getAttribute('data-is-premium') === '1';
                const title = this.getAttribute('data-title');

                if (videoUrl) {
                    window.open(videoUrl, '_blank');
                } else {
                    // Show locked content message
                    alert(`🔒 "${title}" is locked.\n\n${isPremium ? 'This is premium content.' : ''} Please upgrade your subscription to watch.`);
                }
            });
        });

        // Scroll results to top
        resultsDiv.scrollTop = 0;
    }

    // ==========================================
    // OPEN / CLOSE OVERLAY
    // ==========================================
    function openOverlay() {
        overlay.style.display = 'block';
        document.body.style.overflow = 'hidden';
        setTimeout(() => {
            input.focus();
            // If there's already text in the main searchbar, copy it
            const mainSearch = document.getElementById('recordingsSearch');
            if (mainSearch && mainSearch.value.trim()) {
                input.value = mainSearch.value;
                triggerSearch(mainSearch.value);
            }
        }, 50);
    }

    function closeOverlay() {
        overlay.style.display = 'none';
        document.body.style.overflow = '';
        input.value = '';
        // Reset results
        resultsDiv.innerHTML = `
            <div style="text-align:center; padding:40px 20px; color:#9ca3af;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                <p style="margin:0; font-size:15px; font-family:'Manrope',sans-serif;">Start typing to search recordings</p>
            </div>
        `;
        footerDiv.style.display = 'none';
    }

    function triggerSearch(query) {
        clearTimeout(debounceTimer);
        
        if (!query || query.trim().length < 2) {
            resultsDiv.innerHTML = `
                <div style="text-align:center; padding:40px 20px; color:#9ca3af;">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="margin:0 auto 12px;"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <p style="margin:0; font-size:15px; font-family:'Manrope',sans-serif;">Type at least 2 characters to search</p>
                </div>
            `;
            footerDiv.style.display = 'none';
            return;
        }

        // Show loading
        resultsDiv.innerHTML = `
            <div style="text-align:center; padding:30px 20px;">
                <div style="width:32px; height:32px; border:3px solid #e5e7eb; border-top:3px solid #0051d5; border-radius:50%; margin:0 auto 12px; animation:naija-spin 0.6s linear infinite;"></div>
                <p style="margin:0; font-size:14px; color:#9ca3af; font-family:'Manrope',sans-serif;">Searching...</p>
            </div>
        `;
        footerDiv.style.display = 'none';

        debounceTimer = setTimeout(async () => {
            const data = await searchAPI(query);
            
            // Cache results for fallback
            if (data.recordings && data.recordings.length > 0) {
                cachedRecordings = data.recordings;
            }
            
            renderResults(data, query);
        }, 300);
    }

    // ==========================================
    // KEYBOARD SHORTCUT
    // ==========================================
    document.addEventListener('keydown', function(e) {
        // Cmd+K or Ctrl+K to open
        if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
            e.preventDefault();
            openOverlay();
        }
        // Escape to close
        if (e.key === 'Escape' && overlay.style.display === 'block') {
            closeOverlay();
        }
    });

    // ==========================================
    // EVENT LISTENERS
    // ==========================================
    backdrop.addEventListener('click', closeOverlay);
    closeBtn.addEventListener('click', closeOverlay);

    input.addEventListener('input', function(e) {
        triggerSearch(e.target.value);
    });

    // Latch onto the existing searchbar on the page
    function latchToSearchbar() {
        const mainSearch = document.getElementById('recordingsSearch');
        if (mainSearch) {
            // When user focuses the main searchbar, open our overlay instead
            mainSearch.addEventListener('focus', function(e) {
                e.preventDefault();
                mainSearch.blur();
                openOverlay();
            });
            mainSearch.addEventListener('click', function(e) {
                e.preventDefault();
                openOverlay();
            });
            // Make the main searchbar read-only so it acts as a trigger
            mainSearch.setAttribute('readonly', 'readonly');
            mainSearch.style.cursor = 'pointer';
            mainSearch.setAttribute('placeholder', 'Press Ctrl+K or click to search...');
        }

        // Also latch onto any search icon clicks
        const searchIcons = document.querySelectorAll('.fa-magnifying-glass');
        searchIcons.forEach(icon => {
            const parent = icon.closest('div');
            if (parent) {
                parent.style.cursor = 'pointer';
                parent.addEventListener('click', openOverlay);
            }
        });
    }

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================
    function escapeHTML(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    function formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            const now = new Date();
            const diff = now - date;
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            
            if (days === 0) return 'Today';
            if (days === 1) return 'Yesterday';
            if (days < 7) return `${days} days ago`;
            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    }

    function getGradeColor(grade) {
        if (!grade) return { bg: '#f3f4f6', text: '#6b7280' };
        if (grade.startsWith('JSS')) return { bg: '#dbeafe', text: '#1d4ed8' };
        if (grade.startsWith('SSS')) return { bg: '#fce7f3', text: '#be185d' };
        return { bg: '#f3f4f6', text: '#6b7280' };
    }

    function getSubjectIcon(subject) {
        if (!subject) return '📚';
        const s = subject.toLowerCase();
        if (s.includes('math')) return '🔢';
        if (s.includes('physic')) return '⚛️';
        if (s.includes('chem')) return '🧪';
        if (s.includes('bio')) return '🧬';
        if (s.includes('english')) return '📖';
        if (s.includes('economic')) return '📊';
        if (s.includes('science')) return '🔬';
        return '📚';
    }

    // ==========================================
    // INJECT SPINNER ANIMATION
    // ==========================================
    const styleSheet = document.createElement('style');
    styleSheet.textContent = `
        @keyframes naija-spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        #naija-search-overlay {
            animation: naija-fade-in 0.2s ease;
        }
        @keyframes naija-fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        #naija-search-results::-webkit-scrollbar {
            width: 6px;
        }
        #naija-search-results::-webkit-scrollbar-track {
            background: transparent;
        }
        #naija-search-results::-webkit-scrollbar-thumb {
            background: #d1d5db;
            border-radius: 3px;
        }
    `;
    document.head.appendChild(styleSheet);

    // ==========================================
    // INITIALIZE
    // ==========================================
    async function init() {
        await detectAuth();
        latchToSearchbar();
        console.log('[NaijaSearch] ✅ Ready — Press Ctrl+K or click searchbar to search recordings');
    }

    // Run when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // Expose for external use
    window.NaijaSearch = {
        open: openOverlay,
        close: closeOverlay,
        search: triggerSearch,
        setToken: function(token) {
            isAuthenticated = true;
            accessToken = token;
        }
    };
})();
