# 🎬 Torrent Streamer

A lightweight, fast torrent streaming server built with Node.js and WebTorrent. Stream movies and videos directly from magnet links without waiting for the full download.

![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)
![License](https://img.shields.io/badge/License-MIT-blue.svg)
![PM2](https://img.shields.io/badge/PM2-Ready-orange.svg)

## ✨ Features

- 🚀 **Instant Streaming** - Start watching while downloading
- 🌐 **Web Interface** - Simple, clean UI for easy management
- 📱 **HTTP Range Support** - Compatible with VLC, browsers, and mobile players
- 🔄 **Multi-file Torrents** - Choose specific files from torrent bundles
- ⚡ **Real-time Progress** - Live download stats and peer information
- 🛡️ **Production Ready** - PM2 integration with auto-restart
- 📊 **RESTful API** - Full programmatic control

## 🎥 Demo

1. Paste a magnet link
2. Click "Start" 
3. Copy the stream URL to VLC or your favorite video player
4. Enjoy instant streaming!

## 🚀 Quick Start

### Prerequisites

- **Node.js 18+** (ES Modules support required)
- **npm** or **yarn**

### Installation

```bash
# Clone the repository
git clone https://github.com/mtahle/torrent-streamer.git
cd torrent-streamer

# Install dependencies
npm install

# Start the server
npm start
```

The server will be available at `http://localhost:8881`

### Production Deployment (PM2)

For 24/7 operation with auto-restart:

```bash
# Install PM2 globally (if not already installed)
npm install -g pm2

# Start with PM2
./pm2-control.sh start

# Enable auto-start on boot
pm2 startup
pm2 save
```

## 📖 Usage

### Web Interface

1. Open `http://localhost:8881` in your browser
2. Paste a magnet link in the input field
3. Click **Start** to begin streaming
4. Copy the **Stream URL** and open it in:
   - **VLC**: `Media → Open Network Stream`
   - **Browser**: Paste URL directly
   - **Mobile Players**: Any player supporting HTTP streams

### API Usage

#### Start Streaming
```bash
curl -X POST http://localhost:8881/start \
  -H "Content-Type: application/json" \
  -d '{"magnet":"magnet:?xt=urn:btih:..."}'
```

#### Get Status
```bash
curl http://localhost:8881/status
```

#### Stream Video
```bash
# Direct streaming URL
http://localhost:8881/stream
```

## 🔌 API Reference

### Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/start` | Start torrent from magnet link |
| `POST` | `/stop` | Stop current torrent |
| `POST` | `/select` | Select specific file by index |
| `GET` | `/status` | Get download progress and stats |
| `GET` | `/files` | List all files in current torrent |
| `GET` | `/stream` | Stream selected video file |
| `GET` | `/healthz` | Health check endpoint |

### API Examples

#### Start Torrent
```json
POST /start
{
  "magnet": "magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny"
}

Response:
{
  "ok": true,
  "infoHash": "dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c",
  "name": "Big Buck Bunny.mp4",
  "size": 276134947,
  "stream_url": "/stream",
  "files_url": "/files"
}
```

#### Get Status
```json
GET /status

Response:
{
  "running": true,
  "name": "Big Buck Bunny.mp4",
  "infoHash": "dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c",
  "progress": 45.32,
  "downloadSpeed": 1048576,
  "uploadSpeed": 131072,
  "peers": 12,
  "selectedIndex": 0
}
```

#### List Files
```json
GET /files

Response:
{
  "files": [
    {
      "index": 0,
      "name": "Big Buck Bunny.mp4",
      "size": 276134947
    },
    {
      "index": 1,
      "name": "subtitle.srt",
      "size": 84921
    }
  ],
  "selectedIndex": 0
}
```

## 🛠️ Management Scripts

The included `pm2-control.sh` script provides easy management:

```bash
./pm2-control.sh status    # Show process status
./pm2-control.sh logs      # View application logs
./pm2-control.sh restart   # Restart the application
./pm2-control.sh stop      # Stop the application
./pm2-control.sh monitor   # Open PM2 monitoring dashboard
./pm2-control.sh info      # Detailed process information
```

## 🏗️ Project Structure

```
torrent-streamer/
├── server.js              # Main application server
├── package.json           # Dependencies and scripts
├── ecosystem.config.js    # PM2 configuration
├── pm2-control.sh         # Management script
├── public/
│   └── index.html         # Web interface
├── data/                  # Downloaded torrent files (gitignored)
├── logs/                  # Application logs (gitignored)
└── README.md              # This file
```

## ⚙️ Configuration

### Environment Variables

- `PORT` - Server port (default: 8881)
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

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

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