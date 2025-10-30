# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-30

### Added
- Initial release of Torrent Streamer
- WebTorrent-based P2P streaming
- RESTful API for torrent management
- Web interface for easy usage
- HTTP range request support for video players
- Multi-file torrent support with file selection
- Real-time download progress and stats
- PM2 production deployment support
- Auto-restart and error handling
- Comprehensive API documentation
- Management scripts for easy operation

### Features
- Start/stop torrents via API or web interface
- Stream videos while downloading
- Compatible with VLC, browsers, and mobile players
- File selection for multi-file torrents
- Real-time peer and speed information
- Health check endpoints
- Production-ready with PM2 integration

### API Endpoints
- `POST /start` - Start torrent streaming
- `POST /stop` - Stop current torrent
- `POST /select` - Select specific file
- `GET /status` - Download progress and stats
- `GET /files` - List torrent files
- `GET /stream` - Stream video content
- `GET /healthz` - Health check

### Documentation
- Complete README with examples
- API reference documentation
- Installation and deployment guides
- Contributing guidelines
- MIT License

## [Unreleased]

### Planned
- Docker containerization
- Configuration file support
- Download queue management
- User authentication (optional)
- Subtitle support
- Mobile-responsive interface improvements