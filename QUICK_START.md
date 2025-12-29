# 🎬 Torrent Streamer - Quick Start Guide

Your personal home media streaming server is ready!

## 🌐 Access Your Server

**Web Dashboard**: `http://192.168.1.215:8881`

Open this URL on any device on your network to:
- Start streaming torrents
- Monitor active streams
- Cast to DLNA devices
- View library and history

---

## 🚀 Start a Stream

### Option 1: Web UI
1. Go to `http://192.168.1.215:8881`
2. Click **"Start Stream"** tab
3. Paste a magnet link
4. Click **"Start Streaming"**
5. Watch in the embedded player or cast to another device!

### Option 2: Command Line
```bash
curl -X POST http://192.168.1.215:8881/start \
  -H "Content-Type: application/json" \
  -d '{"magnet":"YOUR_MAGNET_LINK","title":"Movie Title","quality":"1080p"}'
```

---

## 📺 Watch on Other Devices

### VLC Player (Recommended)
**Any device with VLC can stream from your server!**

1. **Open VLC** on your phone/tablet/computer
2. **Network Stream**:
   - Desktop: Press `Ctrl+N` (Windows) or `⌘+N` (Mac)
   - Mobile: Go to Stream → Add new stream
3. **Enter URL**: `http://192.168.1.215:8881/stream`
4. **Play!**

### DLNA/Smart TV
1. Go to **DLNA Devices** tab
2. Click **"Scan for Devices"**
3. Select your TV/device
4. Click **"Cast"**

---

## 📱 Mobile Quick Reference

```
┌─────────────────────────────────────┐
│  VLC Mobile App Setup               │
├─────────────────────────────────────┤
│  1. Open VLC app                    │
│  2. Tap Stream/Network tab          │
│  3. Add new stream                  │
│  4. Paste: http://192.168.1.215:8881/stream │
│  5. Play!                           │
└─────────────────────────────────────┘
```

**Bookmark this URL** on your phone's home screen for instant access!

---

## 🎮 Features

### ✅ Currently Available
- **Multi-Device Streaming**: VLC, DLNA, Web Browser
- **Embedded Video Player**: Watch directly in the browser
- **DLNA Casting**: Stream to Smart TVs and media players
- **Real-time Stats**: Monitor download speed, peers, progress
- **Database**: Track watch history and bookmarks
- **Dark/Light Theme**: Toggle in settings

### 🚧 Coming Soon
- Movie library browser
- Watch history with resume
- AirPlay support
- Hardware remote control (ESP32 + OLED)

---

## 🛠️ Management

### Check Status
```bash
pm2 status
pm2 logs torrent-streamer
```

### Restart Server
```bash
pm2 restart torrent-streamer
```

### Stop Server
```bash
pm2 stop torrent-streamer
```

### View Active Stream
```bash
curl http://localhost:8881/status | jq
```

---

## 🔥 Example Torrents to Test

### Cosmos Laundromat (Open Movie)
```
magnet:?xt=urn:btih:c9e15763f722f23e98a29decdfae341b98d53056&dn=Cosmos+Laundromat&tr=udp%3A%2F%2Fexplodie.org%3A6969
```

### Big Buck Bunny (Open Movie)
```
magnet:?xt=urn:btih:dd8255ecdc7ca55fb0bbf81323d87062db1f6d1c&dn=Big+Buck+Bunny&tr=udp%3A%2F%2Fexplodie.org%3A6969
```

---

## 🌍 Network Setup

### Same Network Requirement
All devices must be on the same WiFi/LAN to access the server.

### Using Mobile Hotspot
1. Enable hotspot on your phone
2. Connect server to the hotspot
3. Get new IP: `hostname -I`
4. Connect other devices to the same hotspot
5. Use the new IP in the stream URL

### Port Forwarding (Advanced)
To access from outside your network:
1. Set static IP for your server in router settings
2. Forward port 8881 to server IP
3. Use your public IP: `curl ifconfig.me`
4. Access: `http://YOUR_PUBLIC_IP:8881`

⚠️ **Security Warning**: Only expose if you understand the risks!

---

## 📚 Documentation

- **VLC Streaming Guide**: `/home/ubuntu/torrent-streamer/VLC_STREAMING_GUIDE.md`
- **Roadmap**: `/home/ubuntu/torrent-streamer/ROADMAP.md`
- **Changelog**: `/home/ubuntu/torrent-streamer/CHANGELOG.md`
- **Full Project Summary**: `/home/ubuntu/torrent-streamer/PROJECT_SUMMARY.md`

---

## 💡 Tips & Tricks

1. **Bookmark the dashboard** on all your devices
2. **Use VLC for best compatibility** across all platforms
3. **Lower buffer in VLC** (300-1000ms) for less latency
4. **Close other tabs/apps** when streaming for smoother playback
5. **Check peers count** - more peers = faster download
6. **Wait for ~10-20% progress** before starting playback for smooth experience

---

## 🆘 Troubleshooting

### Can't connect from another device?
```bash
# Check server is running
pm2 status

# Check both devices are on same network
hostname -I

# Test stream locally
curl http://localhost:8881/status
```

### Stream buffering/stuttering?
- Wait for more pieces to download (check progress %)
- Increase VLC buffer: Tools → Preferences → Network Caching
- Check your WiFi signal strength
- Close other bandwidth-heavy apps

### Navigation not working?
- Hard refresh the page: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Clear browser cache
- Try a different browser

---

## 🎯 Quick Commands Cheat Sheet

```bash
# Start a stream
curl -X POST http://localhost:8881/start \
  -H "Content-Type: application/json" \
  -d '{"magnet":"MAGNET_LINK"}'

# Check status
curl http://localhost:8881/status | jq

# Stop stream
curl -X POST http://localhost:8881/stop

# Get DLNA devices
curl http://localhost:8881/api/dlna/devices | jq

# View logs
pm2 logs torrent-streamer --lines 50

# Server IP
hostname -I
```

---

**Enjoy your personal streaming server! 🍿**

For issues or questions, check the logs: `pm2 logs torrent-streamer`
