// CONFIGURATION: Replace this string with the Client ID from your Spotify Dashboard image
const CLIENT_ID = 'e2bb7a1c76bc42fc9b75fcacc1bf909e'; 

// Automatically builds your callback URL dynamically to prevent mismatch errors
const REDIRECT_URI = window.location.origin + window.location.pathname;

const loginBtn = document.getElementById('login-btn');
const searchContainer = document.getElementById('search-container');
const searchBox = document.getElementById('search-box');
const resultsDiv = document.getElementById('results');

// 1. EXTRACT ACCESS TOKEN FROM URL HASH
function getAccessToken() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    return params.get('access_token');
}

const token = getAccessToken();

// 2. TOGGLE UI STATE BASED ON AUTHENTICATION
if (token) {
    loginBtn.style.display = 'none';
    searchContainer.style.display = 'block';
    
    // Clean up the URL hash in the browser address bar for cosmetic clarity
    window.history.pushState("", document.title, window.location.pathname + window.location.search);
}

// 3. REDIRECT USER TO SPOTIFY FOR LOGIN
loginBtn.addEventListener('click', () => {
    const authUrl = `https://spotify.com` +
                    `?client_id=${encodeURIComponent(CLIENT_ID)}` +
                    `&response_type=token` +
                    `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
                    `&scope=user-read-private`;
    window.location.href = authUrl;
});

// 4. FETCH TRACK DATA FROM WEB API
searchBox.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
        const query = encodeURIComponent(e.target.value.trim());
        
        try {
            const response = await fetch(`https://spotify.com{query}&type=track&limit=10`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 401) {
                alert('Session expired. Please log in again.');
                window.location.reload();
                return;
            }

            const data = await response.json();
            displayResults(data.tracks.items);
        } catch (error) {
            console.error('Error fetching data from Spotify API:', error);
        }
    }
});

// 5. RENDER SYSTEM CARDS WITH EMBEDDED IFRAMES
function displayResults(tracks) {
    resultsDiv.innerHTML = '';

    if (tracks.length === 0) {
        resultsDiv.innerHTML = '<p style="text-align:center; color:#B3B3B3;">No tracks found.</p>';
        return;
    }

    tracks.forEach(track => {
        const artists = track.artists.map(artist => artist.name).join(', ');
        
        const card = document.createElement('div');
        card.className = 'track-card';
        card.innerHTML = `
            <div class="track-info">
                <h3>${escapeHtml(track.name)}</h3>
                <p>${escapeHtml(artists)}</p>
            </div>
            <!-- Spotify Official Web Embed Player -->
            <iframe 
                src="https://spotify.com{track.id}?utm_source=generator&theme=0" 
                width="100%" 
                height="152" 
                allowfullscreen="" 
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture" 
                loading="lazy">
            </iframe>
        `;
        resultsDiv.appendChild(card);
    });
}

// Helper utility to sanitize track details against potential script injection vulnerabilities
function escapeHtml(str) {
    return str.replace(/&/g, "&amp;")
              .replace(/</g, "&lt;")
              .replace(/>/g, "&gt;")
              .replace(/"/g, "&quot;")
              .replace(/'/g, "&#039;");
}
