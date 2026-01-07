const express = require('express');
const cors = require('cors');
const yts = require('yt-search');
const ytDlp = require('yt-dlp-exec'); // Убедись, что npm install yt-dlp-exec выполнен

const app = express(); // 1. СНАЧАЛА СОЗДАЕМ APP
app.use(cors());       // 2. ПОТОМ НАСТРАИВАЕМ CORS

// 3. И ТОЛЬКО ПОТОМ ОПИСЫВАЕМ МАРШРУТЫ
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        const r = await yts(query);
        res.json(r.videos.slice(0, 10));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

app.get('/api/play', (req, res) => {
    const videoUrl = req.query.url;
    res.setHeader('Content-Type', 'audio/mpeg');

    const stream = ytDlp.exec(videoUrl, {
        output: '-',
        format: 'bestaudio',
        quiet: true
    }, { stdio: ['ignore', 'pipe', 'ignore'] });

    stream.stdout.pipe(res);
});

const PORT = process.env.PORT || 80;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));