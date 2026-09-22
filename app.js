// CONFIGURATION: Set your authenticated Spotify Client ID
const CLIENT_ID = 'e2bb7a1c76bc42fc9b75fcacc1bf909e'; 

// Dynamically locks into your active GitHub Pages URL structure
const REDIRECT_URI = window.location.origin + window.location.pathname;

const searchBox = document.getElementById('search-box');
const resultsDiv = document.getElementById('results');

// 1. EXTRACT PASS TOKENS DIRECTLY FROM URL HASH
function getImplicitAccessToken() {
    const hashParams = new URLSearchParams(window.location.hash.substring(1));
    return hashParams.get('access_token');
}

const activeToken = getImplicitAccessToken();

// 2. FORCE AUTOMATED CLIENT REDIRECT IF TOKEN DOES NOT EXIST
if (!activeToken) {
    resultsDiv.innerHTML = '<p class="status-msg">Redirecting to Spotify account verification...</p>';
    
    // Scopes needed to access default music tracking parameters
    const authEndpoint = `https://spotify.com` +
                         `?client_id=${encodeURIComponent(CLIENT_ID)}` +
                         `&response_type=token` +
                         `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
                         `&scope=user-read-private%20user-read-email`;
                         
    // Instantly sends the user to authenticate without relying on blocked domains
    window.location.href = authEndpoint;
} else {
    // If the token exists, clean up URL hash clutter instantly for structural privacy
    window.history.pushState("", document.title, window.location.pathname + window.location.search);
}

// 3. LISTEN FOR SEARCH ARGUMENTS
searchBox.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
        const userQuery = e.target.value.trim();
        resultsDiv.innerHTML = '<p class="status-msg">Searching absolute live databases...</p>';

        try {
            const response = await fetch(`https://spotify.com{encodeURIComponent(userQuery)}&type=track&limit=12`, {
                headers: { 'Authorization': `Bearer ${activeToken}` }
            });

            if (response.status === 401) {
                // If the temporary session token expires, clear the page hash and reload the login portal
                window.location.hash = '';
                window.location.reload();
                return;
            }

            const payload = await response.json();
            renderActiveTrackCards(payload.tracks.items);
        } catch (error) {
            console.error("Search API Failure: ", error);
            resultsDiv.innerHTML = '<p class="status-msg" style="color:#ff4444;">Connection failed. Check network status.</p>';
        }
    }
});

// 4. GENERATE CONTENT PRESENTATION CARDS
function renderActiveTrackCards(trackList) {
    resultsDiv.innerHTML = '';
    
    if (!trackList || trackList.length === 0) {
        resultsDiv.innerHTML = '<p class="status-msg">No matching creator assets could be localized.</p>';
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
            <!-- Embedded content layer utilizes native widget structures -->
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

function sanitizeInput(inputString) {
    return inputString.replace(/&/g, "&amp;")
                      .replace(/</g, "&lt;")
                      .replace(/>/g, "&gt;")
                      .replace(/"/g, "&quot;")
                      .replace(/'/g, "&#039;");
}
