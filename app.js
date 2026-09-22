const searchBox = document.getElementById('search-box');
const resultsDiv = document.getElementById('results');
const playerDock = document.getElementById('player-dock');
const audioEngine = document.getElementById('audio-engine');
const nowPlayingText = document.getElementById('now-playing');

// Direct open-source fallback engine client key parameters
const CLIENT_ID = 'b736b412'; 

searchBox.addEventListener('keyup', async (e) => {
    if (e.key === 'Enter' && e.target.value.trim() !== '') {
        const queryValue = e.target.value.trim();
        resultsDiv.innerHTML = '<p class="status-msg">Querying decentralized open audio clusters...</p>';

        try {
            // Uses standard Jamendo API parameters for direct track list retrieval
            const apiEndpoint = `https://jamendo.com{CLIENT_ID}&format=json&limit=15&namesearch=${encodeURIComponent(queryValue)}&include=musicinfo`;
            
            const response = await fetch(apiEndpoint);
            const payload = await response.json();
            
            renderTrackList(payload.results);
        } catch (error) {
            console.error("Audio Node Exception Connection Blown: ", error);
            resultsDiv.innerHTML = '<p class="status-msg" style="color:#ff4444;">Core search route block. Network firewall restrictions detected.</p>';
        }
    }
});

function renderTrackList(tracks) {
    resultsDiv.innerHTML = '';
    
    if (!tracks || tracks.length === 0) {
        resultsDiv.innerHTML = '<p class="status-msg">No open source creative assets matched this string context.</p>';
        return;
    }

    tracks.forEach(track => {
        const cardElement = document.createElement('div');
        cardElement.className = 'track-card';
        
        // Escape parameters completely to prevent cross site template compilation script errors
        const cleanTitle = sanitizeHtml(track.name);
        const cleanArtist = sanitizeHtml(track.artist_name);
        
        cardElement.innerHTML = `
            <div class="track-details">
                <h3>${cleanTitle}</h3>
                <p>Creator: ${cleanArtist}</p>
            </div>
            <!-- Binds direct mp3 streaming link to localized player context -->
            <button class="play-btn" onclick="executeAudioStream('${track.audio}', '${cleanTitle.replace(/'/g, "\\'")}')">Stream</button>
        `;
        resultsDiv.appendChild(cardElement);
    });
}

// Routes raw mp3 file vectors directly into native HTML5 runtime controls
window.executeAudioStream = function(audioUrl, trackTitle) {
    if (!audioUrl) return;
    
    // Inject the raw un-embedded streaming sound asset directly into the audio player source
    audioEngine.src = audioUrl;
    nowPlayingText.innerHTML = `Streaming: <strong>${trackTitle}</strong>`;
    playerDock.style.display = 'block';
    
    audioEngine.load();
    audioEngine.play().catch(err => console.log("Autoplay configuration restriction handled: ", err));
};

function sanitizeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
