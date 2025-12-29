# RTP/UDP Streaming to VLC

## What is RTP/UDP Streaming?

RTP (Real-time Transport Protocol) over UDP provides low-latency multicast streaming. Multiple devices can receive the same stream simultaneously with minimal server overhead.

**Best for**: Local network streaming to multiple VLC clients, IPTV-style broadcasting

---

## Prerequisites

Your server needs FFmpeg installed:
```bash
sudo apt update
sudo apt install ffmpeg
```

Check if installed:
```bash
ffmpeg -version
```

---

## Starting RTP/UDP Stream

### Option 1: Web UI
1. Go to `http://192.168.1.215:8881`
2. Click **"RTP/UDP Streaming"** tab
3. Click **"Start RTP Stream"** button
4. Note the multicast address (default: `239.255.0.1:5004`)

### Option 2: API
```bash
curl -X POST http://192.168.1.215:8881/api/rtp/start
```

Response:
```json
{
  "success": true,
  "address": "239.255.0.1",
  "port": 5004,
  "sdpUrl": "http://192.168.1.215:8881/stream.sdp"
}
```

---

## Watch in VLC

### Method 1: Direct RTP URL (Simplest)

1. **Open VLC**
2. **Media → Open Network Stream** (Ctrl+N)
3. **Enter**: `rtp://239.255.0.1:5004`
4. **Play**

### Method 2: Using SDP File (Recommended)

The SDP file contains all stream metadata for better compatibility.

1. **Download SDP file**: `http://192.168.1.215:8881/stream.sdp`
2. **In VLC**: Media → Open File
3. **Select the downloaded** `stream.sdp`
4. **Play**

Or directly:
1. **VLC**: Media → Open Network Stream
2. **Enter**: `http://192.168.1.215:8881/stream.sdp`
3. **Play**

### Method 3: Command Line

```bash
vlc rtp://239.255.0.1:5004
```

Or with SDP:
```bash
vlc http://192.168.1.215:8881/stream.sdp
```

---

## Multiple Viewers

The beauty of multicast is that unlimited VLC clients can watch simultaneously:

**Device 1:**
```bash
vlc rtp://239.255.0.1:5004
```

**Device 2:**
```bash
vlc rtp://239.255.0.1:5004
```

**Device 3, 4, 5... N:**
```bash
vlc rtp://239.255.0.1:5004
```

All receive the same stream with **zero extra server load!**

---

## SAP Announcement (Auto-Discovery)

SAP allows VLC to automatically discover streams on your network.

### Enable SAP:
```bash
curl -X POST http://192.168.1.215:8881/api/rtp/start \
  -H "Content-Type: application/json" \
  -d '{"enableSAP":true}'
```

### In VLC:
1. Go to **Playlist** (Ctrl+L)
2. Expand **"Local Network"**
3. Click **"Network streams (SAP)"**
4. Your stream should appear automatically!
5. Double-click to play

---

## VLC Settings for Best Performance

### For Low Latency (Live Viewing):
1. **Tools → Preferences → Input/Codecs**
2. **Network Caching**: 300-600ms
3. **Live Capture Caching**: 300ms

### For Unstable Networks:
1. **Tools → Preferences → Input/Codecs**
2. **Network Caching**: 1000-2000ms

---

## Troubleshooting

### Can't connect?

**Check multicast is enabled on your router:**
- Most home routers support multicast by default
- Enterprise networks may block it (check with network admin)

**Check firewall:**
```bash
sudo ufw allow 5004/udp
sudo ufw allow 9875/udp  # SAP port
```

**Verify stream is running:**
```bash
curl http://192.168.1.215:8881/api/rtp/status
```

### Stream not appearing in SAP?

1. Make sure SAP is enabled when starting the stream
2. Wait 30-60 seconds for SAP announcements to propagate
3. In VLC: View → Playlist → Network streams (SAP)
4. Click "Refresh" if available

### Black screen or stuttering?

1. **Increase buffer**: Tools → Preferences → Network Caching (try 1000-2000ms)
2. **Disable hardware acceleration**: Tools → Preferences → Input/Codecs → Hardware-accelerated decoding: Disable
3. **Check CPU usage**: RTP streaming with transcoding is CPU-intensive

---

## Advanced: Custom Settings

### Change Multicast Address & Port:
```bash
curl -X POST http://192.168.1.215:8881/api/rtp/start \
  -H "Content-Type: application/json" \
  -d '{
    "address": "239.255.0.2",
    "port": 6000,
    "enableSAP": true
  }'
```

### Different Codecs:
Edit `src/rtp-streamer.js` to change FFmpeg options:
```javascript
'-c:v', 'libx264',    // H.264 video
'-c:a', 'mp3',        // MP3 audio
'-b:v', '2000k',      // 2 Mbps video bitrate
'-b:a', '128k'        // 128 kbps audio bitrate
```

---

## RTP vs HTTP Streaming

| Feature | RTP/UDP | HTTP |
|---------|---------|------|
| Latency | Very Low (~300ms) | Medium (~1-3s) |
| Multiple viewers | Efficient (multicast) | One connection per viewer |
| Seeking | No | Yes |
| Reliability | May drop frames | Guaranteed delivery |
| Network | LAN only | LAN or Internet |
| Complexity | Higher | Lower |

**Use RTP/UDP when:**
- You want live, low-latency streaming
- Multiple viewers watching the same content
- Local network only
- Don't need seeking/pause

**Use HTTP when:**
- Need seeking and pause controls
- Streaming over Internet
- Single viewer
- Want guaranteed delivery

---

## Quick Reference

### Start RTP Stream:
```bash
curl -X POST http://192.168.1.215:8881/api/rtp/start
```

### Watch in VLC:
```bash
vlc rtp://239.255.0.1:5004
```

### Stop RTP Stream:
```bash
curl -X POST http://192.168.1.215:8881/api/rtp/stop
```

### Check Status:
```bash
curl http://192.168.1.215:8881/api/rtp/status
```

---

## Mobile Devices

**Android VLC:**
1. Open VLC app
2. Tap Stream tab
3. Add new stream: `rtp://239.255.0.1:5004`
4. Play

**iOS VLC:**
1. Open VLC app
2. Tap Network tab
3. Enter: `rtp://239.255.0.1:5004`
4. Play

**Note**: Some mobile networks may not support multicast. Works best on WiFi.

---

## Example Session

```bash
# 1. Start RTP stream with SAP
curl -X POST http://192.168.1.215:8881/api/rtp/start \
  -d '{"enableSAP":true}'

# 2. Watch on laptop
vlc rtp://239.255.0.1:5004

# 3. Watch on desktop
vlc rtp://239.255.0.1:5004

# 4. Watch on phone (VLC app)
# Enter: rtp://239.255.0.1:5004

# 5. Stop when done
curl -X POST http://192.168.1.215:8881/api/rtp/stop
```

All devices stream simultaneously with minimal server load! 🚀
