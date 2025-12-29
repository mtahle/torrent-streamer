# Torrent Streamer

Lightweight torrent streaming server built with Node.js and WebTorrent. Start playback while the torrent downloads (HTTP range supported).

## Features

- Web UI served from `public/`
- REST API for start/stop/select/status
- Picks the largest video file by default; supports multi-file selection
- Streams over `GET /stream` (works with VLC and most players)

## Quick start

Prereqs: Node.js 18+ and npm.

```bash
git clone https://github.com/mtahle/torrent-streamer.git
cd torrent-streamer
npm install
npm start
```

Open `http://localhost:8881`.

## Usage

### Web UI

- Open `/` in a browser, paste a magnet link, press Start.
- Copy the stream URL into a player (VLC: “Open Network Stream…”).

Note: `docs/ui-variants/` contains older HTML experiments and is not served by `server.js`.

### API

Start a torrent (replaces any currently-running torrent):

```bash
curl -X POST http://localhost:8881/start \
  -H "Content-Type: application/json" \
  -d '{"magnet":"magnet:?xt=urn:btih:..."}'
```

List files and select a specific file (useful for bundles):

```bash
curl http://localhost:8881/files
curl -X POST http://localhost:8881/select -H "Content-Type: application/json" -d '{"index":0}'
```

Stream the selected file:

- `http://localhost:8881/stream`

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/start` | Start torrent from magnet link (auto-selects a file) |
| `POST` | `/stop` | Stop current torrent |
| `POST` | `/select` | Select file by index |
| `GET` | `/status` | Progress, speeds, peers, selected index |
| `GET` | `/files` | Torrent file list |
| `GET` | `/stream` | Stream selected file (supports Range) |
| `GET` | `/healthz` | Health check |

## Configuration

- `PORT` (default `8881`)
- `HOST` (default `0.0.0.0`)
- Downloads are stored under `./data/` (gitignored)

## Deployment (PM2)

```bash
npm install -g pm2
./pm2-control.sh start
./pm2-control.sh logs
```

## Project layout

`server.js` (API + streaming), `public/` (UI), `docs/ui-variants/` (not served), `ecosystem.config.js` + `pm2-control.sh` (PM2).

## Contributing / changes

- Contributing guide: `CONTRIBUTING.md`
- Release notes: `CHANGELOG.md`

## Legal

You are responsible for complying with local laws and the terms of the content you download/stream.

## ⚙️ Configuration

### Environment Variables

- `PORT` - Server port (default: 8881)
- `HOST` - Bind address (default: 0.0.0.0)
- `NODE_ENV` - Environment mode (development/production)

### PM2 Configuration

The `ecosystem.config.js` file includes:
- Auto-restart on crashes
- Memory limit (1GB)
- Log rotation
- Multiple environments

## 🔧 Development

### Local Development
```bash
npm start
# or
node server.js
```

### Debug Mode
```bash
NODE_ENV=development npm start
```

## 📊 Monitoring

### PM2 Monitoring
```bash
pm2 monit              # Real-time monitoring
pm2 logs torrent-streamer    # View logs
pm2 info torrent-streamer    # Detailed metrics
```

### Health Check
```bash
curl http://localhost:8881/healthz
```

## 🐳 Docker Support

*Coming soon - Docker containerization for easy deployment*

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This software is for educational purposes. Users are responsible for ensuring they have proper rights to stream content. The developers are not responsible for any misuse of this software.

## 🙋‍♂️ Support

- 🐛 **Issues**: [GitHub Issues](https://github.com/mtahle/torrent-streamer/issues)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/mtahle/torrent-streamer/discussions)
- 📧 **Contact**: [mtahle@users.noreply.github.com](mailto:mtahle@users.noreply.github.com)

## 🌟 Acknowledgments

- [WebTorrent](https://webtorrent.io/) - P2P streaming technology
- [Express.js](https://expressjs.com/) - Web framework
- [PM2](https://pm2.keymetrics.io/) - Process management

---

<div align="center">
  <strong>Made with ❤️ for the streaming community</strong>
</div>
