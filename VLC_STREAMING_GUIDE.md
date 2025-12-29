# How to Stream in VLC from Different Device

## Quick Start

### Option 1: Direct Network Stream (Recommended)
1. **Get Your Server IP Address**:
   ```bash
   hostname -I | awk '{print $1}'
   ```
   Example: `192.168.1.100`

2. **Open VLC on Your Device** (Phone, Tablet, Another Computer)

3. **Open Network Stream**:
   - **Desktop VLC**: Media → Open Network Stream (Ctrl+N)
   - **VLC Android/iOS**: Click on "Stream" or "Network" tab
   
4. **Enter Stream URL**:
   ```
   http://SERVER_IP:8881/stream
   ```
   Example: `http://192.168.1.215:8881/stream`

5. **Click Play!**

---

## Platform-Specific Instructions

### Windows VLC
1. Open VLC Media Player
2. Press `Ctrl+N` or go to **Media** → **Open Network Stream**
3. Enter: `http://192.168.1.215:8881/stream` (replace with your server IP)
4. Click **Play**

### Mac VLC
1. Open VLC
2. Press `⌘+N` or go to **File** → **Open Network**
3. Enter the stream URL
4. Click **Open**

### Android VLC
1. Open VLC app
2. Tap the **☰** menu
3. Select **Stream**
4. Tap **+** (Add new stream)
5. Enter: `http://192.168.1.215:8881/stream`
6. Tap **Play**

### iOS VLC
1. Open VLC app
2. Tap **Network** tab
3. Enter the stream URL in the text field
4. Tap the stream to play

### Linux VLC
```bash
vlc http://192.168.1.215:8881/stream
```

---

## Troubleshooting

### Can't Connect?
1. **Check both devices are on the same network**:
   ```bash
   # On server
   hostname -I
   
   # On client device, ping the server
   ping 192.168.1.100
   ```

2. **Check firewall** (on Ubuntu server):
   ```bash
   sudo ufw allow 8881/tcp
   sudo ufw status
   ```

3. **Verify stream is running**:
   ```bash
   curl http://localhost:8881/status
   ```

### Buffering Issues?
- VLC Settings → All → Input/Codecs:
  - Network Caching: 1000-3000ms
  - File Caching: 300ms

### Stream Stuttering?
1. In VLC: Tools → Preferences → Input/Codecs
2. Hardware-accelerated decoding: Automatic
3. Skip H.264 loop filter: All

---

## Advanced: Stream via DLNA

If your device supports DLNA (Smart TVs, Game Consoles):

1. **Go to DLNA Devices tab** in the web UI: `http://192.168.1.215:8881`
2. **Click "Scan for Devices"**
3. **Select your device** from the list
4. **Click "Cast"**

Your device should automatically start playing!

---

## URL Formats

### HTTP Stream (Default)
```
http://192.168.1.215:8881/stream
```

### With Range Support (for seeking)
VLC automatically handles byte-range requests

### Multiple Files
```
http://192.168.1.215:8881/files
```
Lists all available files in the torrent, then:
```
http://192.168.1.215:8881/stream?index=2
```

---

## Network Requirements

- **Same Network**: Both server and client must be on the same WiFi/LAN
- **Port**: 8881 must be accessible
- **Bandwidth**: Minimum 5 Mbps for 720p, 10+ Mbps for 1080p

---

## Mobile Hotspot

To stream using mobile hotspot:

1. **Enable hotspot** on your phone
2. **Connect server** to the hotspot WiFi
3. **Find server IP**:
   ```bash
   hostname -I
   ```
4. **Connect from other devices** to the same hotspot
5. **Use the stream URL** as normal

---

## Examples

### Stream to Multiple VLC Instances
```bash
# Device 1
vlc http://192.168.1.215:8881/stream

# Device 2  
vlc http://192.168.1.215:8881/stream

# Device 3
vlc http://192.168.1.215:8881/stream
```

All can watch simultaneously!

### Stream with Subtitles
If your torrent includes subtitles:
1. Download subtitle file separately
2. In VLC: Subtitle → Add Subtitle File
3. Select the .srt file

---

## Quality Settings

The stream quality depends on the source torrent file. To check:

```bash
curl http://192.168.1.215:8881/status
```

Look for the `quality` field (480p, 720p, 1080p, etc.)

---

## Tips

- **Bookmark the URL** on your phone/tablet for quick access
- **Use a static IP** for your server (router settings) so the URL doesn't change
- **Lower VLC buffer** (300-1000ms) for lower latency
- **Increase buffer** (3000-10000ms) for unstable WiFi

---

## Quick Reference Card

```
┌─────────────────────────────────────┐
│  VLC Network Stream Quick Card      │
├─────────────────────────────────────┤
│                                     │
│  1. Open VLC                        │
│  2. Ctrl+N (Cmd+N on Mac)           │
│  3. http://192.168.1.X:8881/stream  │
│  4. Play!                           │
│                                     │
│  Get server IP:                     │
│    hostname -I                      │
│                                     │
└─────────────────────────────────────┘
```

Print this or keep it handy!
