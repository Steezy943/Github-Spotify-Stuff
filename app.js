// Change this line to your real, live Vercel domain followed by /api/token
const TOKEN_GATEWAY_URL = 'https://github-spotify-stuff.vercel.app/';

const searchBox = document.getElementById('search-box');
const resultsDiv = document.getElementById('results');
let sessionToken = '';

// Internal token distribution pipeline handling automated cache distribution
async function requestActiveSessionToken() {
    if (sessionToken) return sessionToken;
    
    try {
        const response = await fetch(TOKEN_GATEWAY_URL);
        const data = await response.json();
        sessionToken = data.access_token;
        return sessionToken;
    } catch (err) {
        console.error("Critical Token Request Error: ", err);
        return null;
    }
}

// Global enter key event binding maps
searchBox.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
        const queryValue = e.target.value.trim();
        resultsDiv.innerHTML = '<p class="status-msg">Searching absolute live databases...</p>';
        
        const token = await requestActiveSessionToken();
        if (!token) {
            resultsDiv.innerHTML = '<p class="status-msg" style="color:#ff4444;">Authorization failure. Verify backend setup variables.</p>';
            return;
        }

        try {
            // Queries tracks natively via client credential token authorization blocks
            const response = await fetch(`https://spotify.com{encodeURIComponent(queryValue)}&type=track&limit=12`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.status === 401) {
                // Wipe cache memory tracking references if an internal authorization structure times out
                sessionToken = '';
                resultsDiv.innerHTML = '<p class="status-msg">Token rotation refresh execution... retry search command.</p>';
                return;
            }

            const payload = await response.json();
            renderActiveTrackCards(payload.tracks.items);
        } catch (error) {
            console.error("API Call Exception: ", error);
            resultsDiv.innerHTML = '<p class="status-msg" style="color:#ff4444;">Search exception error. Please try again.</p>';
        }
    }
});

// Presentation rendering factory processing multi-artist tracking loops
function renderActiveTrackCards(trackList) {
    resultsDiv.innerHTML = '';
    
    if (!trackList || trackList.length === 0) {
        resultsDiv.innerHTML = '<p class="status-msg">No matching creator assets could be localized on standard catalogs.</p>';
        return;
    }

    trackList.forEach(track => {
        const compiledArtists = track.artists.map(creator => creator.name).join(', ');
        const cardElement = document.createElement('div');
        cardElement.className = 'track-card';
        
        cardElement.innerHTML = `
            <div class="track-details">
                <h3>${sanitizeInput(track.name)}</h3>
                <p>Creator: ${sanitizeInput(compiledArtists)}</p>
            </div>
            <!-- Spotify Universal Content Direct Widget Embed -->
            <iframe 
                src="https://spotify.com{track.id}?utm_source=generator&theme=0" 
                width="100%" 
                height="152" 
                allowfullscreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy">
            </iframe>
        `;
        resultsDiv.appendChild(cardElement);
    });
}

// XSS Sanitization Filter
function sanitizeInput(inputString) {
    return inputString.replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#039;");
}
