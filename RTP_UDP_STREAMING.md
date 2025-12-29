# RTP/UDP Streaming & SAP Features

## Overview
The torrent-streamer now supports RTP and UDP multicast streaming with automatic SAP (Session Announcement Protocol) discovery.

## Requirements
- **FFmpeg** must be installed for RTP/UDP streaming
- Install: `sudo apt-get install ffmpeg`

## New Streaming Protocols

### 1. HTTP Streaming (Default)
- **Available**: Always
- **Endpoint**: `/stream`
- **Use case**: Direct browser playback, VLC, media players

### 2. DLNA Casting
- **Available**: Always
- **Endpoint**: `/api/dlna/*`
- **Use case**: Cast to Smart TVs and DLNA devices

### 3. RTP Streaming
- **Available**: Requires FFmpeg
- **Endpoint**: `/api/rtp/*`
- **Use case**: Low-latency network streaming, professional setups
- **Protocol**: Real-time Transport Protocol
- **Default Port**: 5004
- **Multicast**: Yes (239.255.1.1)

### 4. UDP Multicast Streaming
- **Available**: Requires FFmpeg  
- **Endpoint**: `/api/udp/*`
- **Use case**: Broadcast to multiple clients simultaneously
- **Protocol**: UDP with MPEG-TS container
- **Default Port**: 1234
- **Multicast**: Yes (239.255.1.1)

## SAP (Session Announcement Protocol)
Automatically announces RTP/UDP streams on the network for easy discovery by VLC and other players.

- **Multicast Address**: 224.2.127.254:9875
- **Announcement Interval**: 30 seconds
- **Protocol**: SAP with SDP (Session Description Protocol)

## API Endpoints

### Check Available Protocols
```bash
GET /api/streaming/protocols
```

**Response:**
```json
{
  "success": true,
  "protocols": {
    "http": { "available": true, "endpoint": "/stream" },
    "dlna": { "available": true, "endpoint": "/api/dlna" },
    "rtp": { "available": true, "endpoint": "/api/rtp", "requiresFFmpeg": true },
    "udp": { "available": true, "endpoint": "/api/udp", "requiresFFmpeg": true }
  },
  "ffmpegAvailable": true
}
```

### Start RTP Stream
```bash
POST /api/rtp/start
Content-Type: application/json

{
  "port": 5004,           // Optional, default: 5004
  "multicast": true,      // Optional, default: true
  "enableSAP": true       // Optional, default: true (enables SAP announcements)
}
```

**Response:**
```json
{
  "success": true,
  "streamId": "rtp-1234567890",
  "url": "rtp://239.255.1.1:5004",
  "port": 5004,
  "multicast": true,
  "multicastAddr": "239.255.1.1",
  "metadata": {
    "title": "Movie Title",
    "quality": "1080p",
    "year": 2024
  },
  "message": "RTP stream started",
  "vlcCommand": "vlc rtp://239.255.1.1:5004"
}
```

### Stop RTP Stream
```bash
POST /api/rtp/stop
Content-Type: application/json

{
  "streamId": "rtp-1234567890"
}
```

### Get RTP Stream Status
```bash
GET /api/rtp/status
```

**Response:**
```json
{
  "success": true,
  "streams": [
    {
      "id": "rtp-1234567890",
      "url": "rtp://239.255.1.1:5004",
      "port": 5004,
      "status": "streaming",
      "uptime": 12345,
      "metadata": { "title": "Movie Title" }
    }
  ],
  "activeStreams": 1,
  "sapAnnouncements": [
    {
      "sessionId": "rtp-1234567890",
      "title": "Movie Title",
      "url": "rtp://239.255.1.1:5004",
      "uptime": 12345
    }
  ]
}
```

### Start UDP Stream
```bash
POST /api/udp/start
Content-Type: application/json

{
  "port": 1234,                // Optional, default: 1234
  "multicastAddr": "239.255.1.1", // Optional, default: 239.255.1.1
  "enableSAP": true            // Optional, default: true
}
```

**Response:**
```json
{
  "success": true,
  "streamId": "udp-1234567890",
  "url": "udp://239.255.1.1:1234",
  "port": 1234,
  "multicastAddr": "239.255.1.1",
  "metadata": { "title": "Movie Title" },
  "message": "UDP stream started",
  "vlcCommand": "vlc udp://@239.255.1.1:1234"
}
```

### Stop UDP Stream
```bash
POST /api/udp/stop
Content-Type: application/json

{
  "streamId": "udp-1234567890"
}
```

### Get UDP Stream Status
```bash
GET /api/udp/status
```

## Usage Examples

### 1. Start a Torrent and Enable RTP Streaming
```bash
# Start torrent
curl -X POST http://localhost:8881/start \
  -H "Content-Type: application/json" \
  -d '{
    "magnet": "magnet:?xt=urn:btih:...",
    "title": "My Movie",
    "quality": "1080p",
    "year": 2024
  }'

# Start RTP stream with SAP announcement
curl -X POST http://localhost:8881/api/rtp/start \
  -H "Content-Type: application/json" \
  -d '{
    "enableSAP": true
  }'
```

### 2. Play Stream in VLC

**Option A: Direct URL**
```bash
vlc rtp://239.255.1.1:5004
```

**Option B: SAP Discovery (Automatic)**
- Open VLC
- Go to **View** → **Playlist** → **Network Streams (SAP)**
- Your stream should appear automatically with the movie title
- Double-click to play

### 3. Start UDP Multicast Stream
```bash
curl -X POST http://localhost:8881/api/udp/start \
  -H "Content-Type: application/json" \
  -d '{
    "port": 1234,
    "multicastAddr": "239.255.1.1"
  }'

# Play in VLC
vlc udp://@239.255.1.1:1234
```

### 4. Check All Streaming Protocols
```bash
curl http://localhost:8881/api/streaming/protocols
```

### 5. Get Active Streams Status
```bash
# Check RTP streams
curl http://localhost:8881/api/rtp/status

# Check UDP streams
curl http://localhost:8881/api/udp/status

# Check DLNA devices
curl http://localhost:8881/api/dlna/devices
```

## Technical Details

### Files Added/Modified
- `src/rtp-streamer.js`: RTP/UDP streaming manager using FFmpeg
- `src/sap-announcer.js`: SAP announcement service
- `server.js`: Added RTP/UDP endpoints and initialization

### FFmpeg Streaming Pipeline
1. Read torrent file data via `file.createReadStream()`
2. Pipe to FFmpeg stdin
3. Transcode to H.264/AAC (fast preset, low latency)
4. Output to RTP or UDP multicast
5. Handle backpressure and stream lifecycle

### SAP Announcement Format
- **Version**: SAP v1
- **Transport**: UDP multicast (224.2.127.254:9875)
- **Payload**: SDP (Session Description Protocol)
- **TTL**: 16 hops
- **Interval**: 30 seconds

### RTP Stream Configuration
- **Video Codec**: H.264 (libx264)
- **Audio Codec**: AAC
- **Preset**: ultrafast
- **Tune**: zerolatency
- **Format**: RTP/AVP
- **Multicast TTL**: 16

### UDP Stream Configuration
- **Video Codec**: H.264 (libx264)
- **Audio Codec**: AAC
- **Preset**: ultrafast
- **Tune**: zerolatency
- **Container**: MPEG-TS
- **Transport**: UDP multicast

## Firewall Configuration

### Allow Multicast Traffic
```bash
# Allow RTP (5004)
sudo ufw allow 5004/udp

# Allow UDP (1234)
sudo ufw allow 1234/udp

# Allow SAP (9875)
sudo ufw allow 9875/udp
```

### Enable Multicast on Interface
```bash
# Check multicast routes
netstat -g

# Add multicast route (if needed)
sudo route add -net 224.0.0.0 netmask 240.0.0.0 dev eth0
```

## Troubleshooting

### FFmpeg Not Found
**Error**: `FFmpeg not installed`

**Solution**:
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

### Stream Not Visible in VLC SAP
1. Ensure SAP is enabled: `enableSAP: true`
2. Check VLC settings: **View** → **Playlist** → **Network Streams**
3. Verify multicast route: `netstat -g`
4. Check firewall allows port 9875/udp

### No Video/Audio in Stream
1. Check FFmpeg logs in PM2: `pm2 logs torrent-streamer`
2. Verify torrent has downloaded enough data
3. Try increasing buffer: wait for ~5% download progress
4. Check codec compatibility in VLC: **Tools** → **Codec Information**

### High CPU Usage
- FFmpeg transcoding is CPU-intensive
- Use `preset: ultrafast` (already default)
- Consider limiting concurrent streams
- Monitor with: `pm2 monit`

## Performance Notes

- **CPU Usage**: RTP/UDP streaming requires real-time transcoding (high CPU)
- **Network**: Multicast requires proper network configuration
- **Latency**: RTP has lower latency than HTTP streaming
- **Scalability**: UDP multicast allows unlimited clients without server overhead
- **Reliability**: UDP has no retransmission; packet loss may occur

## Best Practices

1. **Use HTTP for single clients** - Lower CPU usage
2. **Use DLNA for TV casting** - No transcoding needed
3. **Use RTP for low-latency** - Professional streaming setups
4. **Use UDP for multiple clients** - Efficient broadcasting
5. **Enable SAP for discovery** - Automatic client configuration
6. **Monitor FFmpeg processes** - Check for zombie processes
7. **Limit concurrent streams** - Prevent CPU overload

## Integration with Existing Features

All streaming protocols work alongside:
- ✅ Movie metadata (title, quality, year)
- ✅ Database tracking
- ✅ Active sessions
- ✅ Dashboard UI
- ✅ RESTful API
- ✅ PM2 process management

