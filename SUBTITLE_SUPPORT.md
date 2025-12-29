# Subtitle Support for DLNA Streaming

## Overview

DLNA supports subtitles via the **DIDL-Lite** metadata format. Subtitles can be provided as:
1. External subtitle files (SRT, VTT, SUB)
2. Embedded subtitles (in MKV containers)
3. Separate subtitle tracks referenced in metadata

## Implementation Plan

### 1. Auto-detect Subtitles in Torrent

When a torrent is added, scan for:
- `.srt` files (SubRip)
- `.vtt` files (WebVTT)
- `.sub` files (MicroDVD)
- `.ass`/`.ssa` files (Advanced SubStation Alpha)

Match by filename similarity:
```
Movie.mp4 → Movie.srt, Movie.en.srt, Movie.eng.srt
```

### 2. Serve Subtitle Files

Add endpoint to serve subtitle files:
```
GET /subtitles/:index
```

### 3. DLNA Metadata Enhancement

Update DLNA casting to include subtitle URL in DIDL-Lite:
```xml
<res protocolInfo="http-get:*:text/srt:*">
  http://192.168.1.215:8881/subtitles/0
</res>
```

### 4. Convert Subtitles (if needed)

Some DLNA devices only support SRT format. Auto-convert:
- VTT → SRT
- ASS/SSA → SRT (basic conversion)

## Current Limitations

**DLNA Device Support Varies:**
- Some devices auto-load external subtitles
- Others require manual subtitle file selection
- Many Smart TVs support it, but not all

**Best Approach:**
1. Detect subtitle files in torrent
2. Serve them via HTTP
3. Include in DLNA metadata
4. Let device decide how to handle

## Implementation

### Phase 1: Detection & Serving ✅
- Scan torrent for subtitle files
- Add `/subtitles/:index` endpoint
- Store subtitle info in database

### Phase 2: DLNA Integration
- Update DLNA cast metadata
- Include subtitle URLs
- Test with actual devices

### Phase 3: Auto-conversion
- Install `ffmpeg` subtitle filters
- Convert unsupported formats to SRT
- Cache converted files

### Phase 4: UI
- Show available subtitles
- Select subtitle language
- Enable/disable subtitle streaming

## Alternative: Burn-in Subtitles

For devices that don't support external subtitles:
- Use FFmpeg to burn subtitles into video stream
- Creates new transcoded stream with hardcoded subtitles
- Higher CPU usage but works everywhere

```bash
ffmpeg -i video.mp4 -vf subtitles=subtitle.srt output.mp4
```

## Next Steps

1. ✅ Create subtitle detection module
2. ✅ Add subtitle serving endpoint  
3. ✅ Update DLNA metadata
4. Test with your devices
5. Add UI for subtitle selection
