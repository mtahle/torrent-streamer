# Torrent Streamer Roadmap

## Completed Features ✅
- Multi-protocol torrent streaming (HTTP, DLNA, RTP/UDP, SAP)
- Modern responsive UI with dark/light themes
- Real-time statistics dashboard
- DLNA device discovery and casting
- SQLite database with ORM (Movies, Sessions, History, Bookmarks)
- Duplicate torrent detection
- Metadata headers (title, quality, year)

## Current Sprint - Dashboard Enhancements 🚧

### 1. Video Player Integration
- [x] Embedded HTML5 video player in dashboard
- [ ] Playback controls (play/pause/stop)
- [ ] Video player sync with DLNA casting
- [ ] Picture-in-picture support

### 2. Stream Controls
- [ ] One-click DLNA cast from dashboard
- [ ] Playback position tracking
- [ ] Resume from last position
- [ ] Volume control sync across devices

### 3. Library & History
- [ ] Movie library grid view with filters
- [ ] Watch history timeline
- [ ] Bookmark management
- [ ] Search and sort functionality
- [ ] Movie metadata editing
- [ ] Poster/thumbnail support

## Next Sprint - AirPlay Support 📱
- [ ] AirPlay device discovery (Bonjour)
- [ ] AirPlay casting implementation
- [ ] Unified playback controller (HTTP/DLNA/AirPlay)
- [ ] Multi-device casting

## Future Features 🔮

### Media Management
- [ ] Automatic metadata fetching (TMDB/OMDB API)
- [ ] Subtitle support (WebVTT, SRT)
- [ ] Multiple audio track selection
- [ ] Playlist creation
- [ ] Collections and categories

### Advanced Streaming
- [ ] Adaptive bitrate streaming (HLS/DASH)
- [ ] Hardware transcoding (VAAPI/NVENC)
- [ ] Multiple quality profiles
- [ ] Bandwidth throttling

### User Experience
- [ ] Progressive Web App (PWA)
- [ ] Mobile-responsive UI improvements
- [ ] Keyboard shortcuts
- [ ] Gesture controls for mobile
- [ ] Multi-language support

### Social Features
- [ ] Watch together (sync playback)
- [ ] Ratings and reviews
- [ ] Recommendations engine
- [ ] User profiles and preferences

## Hardware Remote Control 🎮

### MVP Specification
**Hardware**: ESP32 or Wemos D1 Mini + I2C OLED (128x64)
**Connectivity**: WiFi → REST API communication
**Power**: USB-C or Li-Po battery with charging circuit

### Features
#### Display (OLED 128x64)
- Current movie title (scrolling if long)
- Playback status (▶ ⏸ ⏹)
- Progress bar with time (mm:ss / mm:ss)
- Volume level indicator
- Network status icon
- Battery level (if battery powered)

#### Controls
- **Rotary Encoder**: Volume/Seek control with push button
- **4 Navigation Buttons**: Up/Down/Left/Right
- **3 Action Buttons**: Play/Pause, Stop, Cast
- **Optional**: IR receiver for universal remote compatibility

#### Functionality
- Stream selection from library
- Playback control (play/pause/stop/seek)
- Volume adjustment
- Device selection (DLNA/AirPlay)
- Real-time feedback on OLED
- Low-latency response (<100ms)
- Auto-sleep mode to save power

### Implementation Phases
1. **Phase 1**: Basic REST API client + OLED display
   - Connect to server
   - Display current stream info
   - Basic navigation

2. **Phase 2**: Playback controls
   - Play/Pause/Stop buttons
   - Volume control with rotary encoder
   - Seek functionality

3. **Phase 3**: Advanced features
   - Library browsing on device
   - Device/protocol selection
   - Battery management
   - OTA firmware updates

### API Endpoints Needed
```
GET  /api/remote/status          - Get current playback status
POST /api/remote/control         - Send control commands
GET  /api/remote/library         - Get simplified library list
POST /api/remote/select          - Select movie to play
GET  /api/remote/devices         - Get available cast devices
```

### Estimated Cost
- ESP32 Dev Board: $5-10
- I2C OLED Display: $3-5
- Rotary Encoder: $2-3
- Push Buttons: $2-5
- Enclosure (3D printed): $2-5
- **Total**: ~$15-30 per unit

### Development Timeline
- Week 1: Hardware assembly + basic firmware
- Week 2: API integration + display rendering
- Week 3: Control implementation + testing
- Week 4: Enclosure design + final polish

## Infrastructure

### DevOps
- [ ] Docker containerization
- [ ] Docker Compose for easy deployment
- [ ] CI/CD pipeline
- [ ] Automated testing
- [ ] Performance monitoring

### Security
- [ ] User authentication
- [ ] API rate limiting
- [ ] HTTPS support
- [ ] Content encryption for casting
- [ ] Access control lists

### Scalability
- [ ] Distributed torrenting
- [ ] Load balancing
- [ ] CDN integration
- [ ] Database optimization
- [ ] Caching layer (Redis)

## Community & Documentation
- [ ] Comprehensive API documentation
- [ ] Installation guides
- [ ] Video tutorials
- [ ] Contributing guidelines
- [ ] Plugin system for extensions

---

**Last Updated**: 2025-12-29
**Version**: 0.2.0-alpha
