const express = require('express');
const cors = require('cors');
const yts = require('yt-search');
// Замени блок с spawn на этот:
const ytDlp = require('yt-dlp-exec');

app.get('/api/play', (req, res) => {
    const videoUrl = req.query.url;
    res.setHeader('Content-Type', 'audio/mpeg');

    // Это само скачает бинарник под нужную систему (Linux/Win) и запустит поток
    const stream = ytDlp.exec(videoUrl, {
        output: '-',
        format: 'bestaudio',
        quiet: true
    }, { stdio: ['ignore', 'pipe', 'ignore'] });

    stream.stdout.pipe(res);
});
const path = require('path');

const app = express();
app.use(cors());

// 1. Поиск остается прежним
app.get('/api/search', async (req, res) => {
    try {
        const query = req.query.q;
        const r = await yts(query);
        const videos = r.videos.slice(0, 10);
        res.json(videos.map(v => ({
            id: v.videoId,
            title: v.title,
            artist: v.author.name,
            cover: v.thumbnail,
            url: v.url,
            duration: v.timestamp
        })));
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// 2. Новый метод проигрывания через yt-dlp
app.get('/api/play', (req, res) => {
    const videoUrl = req.query.url;
    if (!videoUrl) return res.status(400).send('No URL provided');

    res.setHeader('Content-Type', 'audio/mpeg');

    // Запускаем yt-dlp.exe (убедись, что файл лежит в папке сервера)
    const ytDlpPath = path.join(__dirname, 'yt-dlp.exe');
    
    const process = spawn(ytDlpPath, [
        videoUrl,
        '-f', 'bestaudio',      // Ищем лучшее аудио
        '-o', '-',               // Выводим в поток (stdout)
        '--quiet',               // Не выводить лишний мусор в лог
        '--no-playlist'          // Только один трек
    ]);

    // Перенаправляем поток данных из yt-dlp прямо в браузер
    process.stdout.pipe(res);

    process.stderr.on('data', (data) => {
        console.error(`yt-dlp error: ${data}`);
    });

    process.on('close', (code) => {
        if (code !== 0) console.log(`yt-dlp process exited with code ${code}`);
    });
});

app.listen(3001, () => console.log('Backend running on http://localhost:3001'));