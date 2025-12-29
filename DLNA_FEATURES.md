# DLNA Streaming & Metadata Features

## Overview
The torrent-streamer now supports DLNA casting and includes metadata in HTTP stream responses.

## New Features

### 1. Metadata in HTTP Streams
All `/stream` requests now include movie metadata in response headers:
- `Content-Disposition`: filename with movie title
- `X-Movie-Title`: Movie title
- `X-Movie-Quality`: Quality (e.g., 1080p, 720p)
- `X-Movie-Year`: Release year

### 2. DLNA Casting Support
Cast your torrents to DLNA-enabled devices (Smart TVs, media players, etc.)

## API Endpoints

### Get Available DLNA Devices
```
GET /api/dlna/devices
```
Returns a list of discovered DLNA devices on your network.

**Response:**
```json
{
  "success": true,
  "devices": [
    {
      "id": "device-id",
      "name": "Smart TV",
      "host": "192.168.1.100"
    }
  ],
  "count": 1
}
```

### Cast to DLNA Device
```
POST /api/dlna/cast
Content-Type: application/json

{
  "deviceId": "device-id"
}
```
Casts the current active stream to the specified DLNA device.

**Response:**
```json
{
  "success": true,
  "device": "Smart TV",
  "castingState": {
    "deviceId": "device-id",
    "deviceName": "Smart TV",
    "status": "loading",
    "position": 0,
    "duration": 0
  }
}
```

### Control DLNA Playback
```
POST /api/dlna/control
Content-Type: application/json

{
  "action": "play|pause|stop|seek",
  "position": 120  // only for seek action (in seconds)
}
```

**Actions:**
- `play`: Resume playback
- `pause`: Pause playback
- `stop`: Stop playback
- `seek`: Seek to position (requires `position` field)

### Get DLNA Casting Status
```
GET /api/dlna/status
```
Returns the current casting status.

**Response:**
```json
{
  "success": true,
  "deviceId": "device-id",
  "deviceName": "Smart TV",
  "status": "playing",
  "position": 120,
  "duration": 7200,
  "hasActiveCast": true,
  "devicesAvailable": 2
}
```

## Usage Example

1. **Start a torrent stream:**
```bash
curl -X POST http://localhost:8881/start \
  -H "Content-Type: application/json" \
  -d '{
    "magnet": "magnet:?xt=urn:btih:...",
    "title": "My Movie",
    "quality": "1080p",
    "year": 2024
  }'
```

2. **Check available DLNA devices:**
```bash
curl http://localhost:8881/api/dlna/devices
```

3. **Cast to a device:**
```bash
curl -X POST http://localhost:8881/api/dlna/cast \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "your-device-id"}'
```

4. **Control playback:**
```bash
# Pause
curl -X POST http://localhost:8881/api/dlna/control \
  -H "Content-Type: application/json" \
  -d '{"action": "pause"}'

# Resume
curl -X POST http://localhost:8881/api/dlna/control \
  -H "Content-Type: application/json" \
  -d '{"action": "play"}'

# Seek to 2 minutes
curl -X POST http://localhost:8881/api/dlna/control \
  -H "Content-Type: application/json" \
  -d '{"action": "seek", "position": 120}'
```

## Technical Details

### Files Modified
- `server.js`: Added DLNA endpoints, metadata tracking, and updated /stream endpoint
- `src/dlna.js`: New DLNA manager module
- `package.json`: Added `dlnacasts2` dependency

### Active State Changes
The `active` object now includes a `metadata` field:
```javascript
{
  torrent: ...,
  file: ...,
  fileIndex: ...,
  movieId: ...,
  sessionId: ...,
  metadata: {
    title: "Movie Title",
    quality: "1080p",
    year: 2024
  }
}
```

### DLNA Manager
The DLNA manager automatically:
- Discovers DLNA devices on the network via SSDP
- Maintains device list
- Handles casting with proper metadata
- Manages playback state

## Notes
- DLNA device discovery starts automatically when the server starts
- Devices must be on the same network
- Stream URL is automatically constructed based on the request host
- Metadata is passed to DLNA devices for proper display
