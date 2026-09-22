// Serverless middleware script protecting Client Credentials
export default async function handler(req, res) {
    // Allows your GitHub Pages project domain to explicitly request data pass-downs
    res.setHeader('Access-Control-Allow-Origin', 'https://github.io');
    res.setHeader('Access-Control-Allow-Methods', 'GET');

    const client_id = process.env.SPOTIFY_CLIENT_ID;
    const client_secret = process.env.SPOTIFY_CLIENT_SECRET;

    if (!client_id || !client_secret) {
        return res.status(500).json({ error: 'System error: Missing API variables' });
    }

    try {
        const response = await fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + Buffer.from(client_id + ':' + client_secret).toString('base64'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: 'grant_type=client_credentials'
        });

        const data = await response.json();
        res.status(200).json({ access_token: data.access_token });
    } catch (error) {
        res.status(500).json({ error: 'Authentication gateway communication failed' });
    }
}
