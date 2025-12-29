# Changelog

## [0.2.0] - 2025-12-29

### Added
#### Dashboard Enhancements
- **Embedded Video Player**: HTML5 video player with native controls (play, pause, seek, volume, fullscreen)
  - Automatically loads `/stream` when active torrent detected
  - Hidden when no stream is active
  - Clean integration with dashboard layout

- **DLNA Cast Button**: One-click casting to DLNA devices
  - Automatically detects available DLNA devices
  - Shows/hides based on stream status
  - Integrated with existing DLNA manager

- **Enhanced Stream Controls**:
  - Cast to DLNA button in Start Stream tab
  - Video player section with proper state management
  - Improved stop stream flow (stops video player + torrent)

#### Documentation
- **ROADMAP.md**: Comprehensive project roadmap including:
  - Completed features checklist
  - Current sprint tasks (Dashboard Enhancements)
  - Next sprint (AirPlay Support)
  - Future features (Media Management, Advanced Streaming, UX, Social)
  - **Hardware Remote Control** specification:
    - ESP32/Wemos D1 Mini + I2C OLED (128x64)
    - WiFi connectivity, REST API integration
    - Display: Movie title, playback status, progress bar, volume
    - Controls: Rotary encoder, navigation buttons, action buttons
    - Estimated cost: $15-30 per unit
    - 4-week development timeline
  - Infrastructure plans (DevOps, Security, Scalability)
  - Community & Documentation goals

### Fixed
- **Status Endpoint**: Added `title` field to `/status` response
- **Speed Conversion**: Download/upload speeds now properly converted to MB/s
- **Progress Bar**: Fixed percentage calculation (was multiplying by 100 twice)
- **Duplicate Movies**: Fixed inf oHash-based movie lookup to prevent duplicates
- **Database Validation**: Skip infoHash update if already set (prevents unique constraint errors)

### Changed
- **Movie Lookup**: Now searches by infoHash first, then magnetUri
- **UI Backups**: Auto-backup before modifications (`index-backup-YYYYMMDD-HHMMSS.html`)
- **Video Player**: Integrated directly in dashboard instead of separate modal

### Technical Details
- Fixed multiple syntax errors in `server.js` and `src/database.js`
- Enhanced error logging in `updateMovieStatus` to show field-level validation errors
- Improved `addMovie` function with better deduplication logic
- Added video player lifecycle management (load, play, stop, cleanup)

## [0.1.0] - 2025-12-28

### Initial Release
- Multi-protocol torrent streaming (HTTP, DLNA, RTP/UDP, SAP)
- Modern responsive UI with dark/light themes
- Real-time statistics dashboard
- DLNA device discovery and casting
- SQLite database with Sequelize ORM
- Torrent metadata extraction
- Session management
- Watch history and bookmarks

---

## Upcoming in v0.3.0
- Library tab with movie grid view
- Watch history timeline
- Bookmark management
- Search and filtering
- AirPlay device discovery
- AirPlay casting support
