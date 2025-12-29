# 🎬 Torrent Stream Server

A powerful, feature-rich torrent streaming platform with multi-protocol support (HTTP, DLNA, RTP/UDP, AirPlay), library management, and a modern web interface.

## ✨ Features

### 🎯 Core Streaming
- **Instant Streaming**: Start watching while downloading with WebTorrent
- **HTTP Streaming**: Direct browser playback with range request support
- **DLNA/UPnP Casting**: Cast to smart TVs and media devices
- **AirPlay Support**: Stream to Apple TV and AirPlay devices
- **RTP/UDP Multicast**: Efficient network streaming with SAP announcements

### 📚 Media Management
- **Library System**: Organize your media collection
- **Watch History**: Track viewing progress with resume functionality
- **Bookmarks**: Save favorites for quick access
- **Metadata Management**: Store titles, quality, year, and more
- **Smart Filters**: Search and filter by status, bookmarks, and quality

### 🎨 User Interface
- **Modern Dashboard**: Real-time streaming statistics and device discovery
- **Responsive Design**: Works on desktop, tablet, and mobile
- **Dark/Light Themes**: Comfortable viewing in any environment
- **Tab Navigation**: Organized sections for streaming, protocols, library, and settings

### 🎯 Advanced Features
- **Subtitle Support**: Auto-detection with 11 language support (.srt, .vtt, .sub, .ass, .ssa)
- **Multi-Protocol Stats**: Real-time monitoring of HTTP, DLNA, RTP, and AirPlay streams
- **Device Discovery**: Automatic detection of DLNA and AirPlay devices
- **Session Management**: Track active streams and playback state
- **Peer Information**: Monitor torrent health and download progress

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- FFmpeg (for RTP/UDP streaming)
- PM2 (for process management)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/torrent-streamer.git
cd torrent-streamer

# Install dependencies
npm install

# Start the server
pm2 start ecosystem.config.js

# Access the web interface
open http://localhost:8881
```

### Environment Variables

Create a `.env` file:

```bash
PORT=8881
HOST=0.0.0.0
NODE_ENV=production
```

## 📖 Documentation

- [Quick Start Guide](QUICK_START.md)
- [VLC Streaming Guide](VLC_STREAMING_GUIDE.md)
- [RTP/UDP VLC Guide](RTP_UDP_VLC_GUIDE.md)
- [Subtitle Support](SUBTITLE_SUPPORT.md)
- [DLNA Features](DLNA_FEATURES.md)
- [UI Enhancements](UI_ENHANCEMENTS.md)
- [Project Summary](PROJECT_SUMMARY.md)
- [Roadmap](ROADMAP.md)

## 🎮 Usage

### Starting a Stream

1. Navigate to the **Start Stream** tab
2. Paste a magnet URI
3. Optionally add metadata (title, quality, year)
4. Click **Start Streaming**

### Casting to Devices

**DLNA:**
1. Ensure your DLNA device is on the same network
2. Click **Cast to DLNA** in Stream Controls
3. Select your device from the list

**AirPlay:**
1. Ensure your AirPlay device is discoverable
2. Click **Cast to AirPlay** in Stream Controls
3. Select your Apple TV or AirPlay device

### Managing Your Library

1. Go to the **Library** tab
2. View all your streamed content
3. Use filters to find specific items
4. Bookmark favorites or resume watching

### RTP/UDP Streaming

1. Navigate to the **RTP/UDP** tab
2. Configure multicast settings
3. Click **Start RTP Stream**
4. Use VLC or compatible player to connect

## 🏗️ Architecture

```
torrent-streamer/
├── server.js              # Main Express server
├── src/
│   ├── airplay.js         # AirPlay device management
│   ├── dlna.js            # DLNA/UPnP implementation
│   ├── rtp-streamer.js    # RTP/UDP streaming
│   ├── sap-announcer.js   # SAP announcements
│   ├── database.js        # Sequelize ORM setup
│   └── models/            # Database models
│       ├── Movie.js
│       ├── WatchHistory.js
│       ├── Bookmark.js
│       └── ActiveSession.js
├── public/
│   └── index.html         # Web UI
├── data/                  # Media and database storage
└── docs/                  # Documentation
```

## 🔌 API Endpoints

### Streaming
- `POST /start` - Start new torrent stream
- `GET /stream` - HTTP stream endpoint
- `GET /stop` - Stop active stream
- `GET /status` - Get stream status

### DLNA
- `GET /api/dlna/devices` - List DLNA devices
- `POST /api/dlna/cast` - Cast to DLNA device
- `POST /api/dlna/control` - Control DLNA playback
- `GET /api/dlna/status` - Get DLNA status

### AirPlay
- `GET /api/airplay/devices` - List AirPlay devices
- `POST /api/airplay/cast` - Cast to AirPlay device
- `POST /api/airplay/control` - Control AirPlay playback
- `GET /api/airplay/status` - Get AirPlay status

### RTP/UDP
- `POST /api/rtp/start` - Start RTP stream
- `POST /api/rtp/stop` - Stop RTP stream
- `GET /api/rtp/status` - Get RTP status

### Library
- `GET /api/library` - Get library items
- `GET /api/history` - Get watch history
- `GET /api/movies/:id` - Get movie details
- `POST /api/movies/:id/bookmark` - Toggle bookmark
- `POST /api/movies/:id/resume` - Resume playback

### Subtitles
- `GET /api/subtitles` - List available subtitles
- `GET /subtitles/:index` - Stream subtitle file

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js
- **Streaming**: WebTorrent, FFmpeg
- **Database**: SQLite with Sequelize ORM
- **Protocols**: DLNA/UPnP, AirPlay (via Bonjour), RTP/UDP, SAP
- **Frontend**: Vanilla JavaScript, CSS3
- **Process Manager**: PM2

## 🎨 Themes

The interface supports both light and dark themes with automatic system preference detection. Toggle via the settings panel.

## 🐛 Troubleshooting

### Stream won't start
- Verify the magnet URI is valid
- Check that port 8881 is not in use
- Ensure sufficient disk space in `data/` directory

### DLNA device not found
- Verify device and server are on same network
- Check firewall settings (allow UDP 1900)
- Ensure device supports DLNA/UPnP

### RTP stream issues
- Verify FFmpeg is installed: `ffmpeg -version`
- Check multicast routing is enabled
- Use VLC to test: Media → Open Network Stream → `rtp://@239.255.0.1:5004`

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## 📝 License

MIT License - see [LICENSE](LICENSE) for details

## 🙏 Acknowledgments

- WebTorrent for the torrent streaming engine
- FFmpeg for media transcoding
- The open-source community

## 📮 Support

- **Issues**: GitHub Issues
- **Discussions**: GitHub Discussions
- **Documentation**: [Full Documentation](QUICK_START.md)

---

**Note**: This software is for personal use. Ensure you have the right to download and stream any content.
