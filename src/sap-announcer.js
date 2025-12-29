import dgram from 'dgram';
import os from 'os';
import crypto from 'crypto';

class SAPAnnouncer {
  constructor() {
    this.socket = null;
    this.announcements = new Map(); // sessionId -> announcement config
    this.intervals = new Map(); // sessionId -> interval timer
    this.multicastAddr = '224.2.127.254';
    this.port = 9875;
    this.ttl = 16;
    this.announceInterval = 30000; // 30 seconds
  }

  getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
    return '127.0.0.1';
  }

  initialize() {
    if (this.socket) {
      return;
    }

    try {
      this.socket = dgram.createSocket({ type: 'udp4', reuseAddr: true });
      this.socket.bind(() => {
        this.socket.setMulticastTTL(this.ttl);
        console.log('📢 SAP Announcer initialized');
      });

      this.socket.on('error', (err) => {
        console.error('SAP socket error:', err.message);
      });
    } catch (error) {
      console.error('Failed to initialize SAP announcer:', error.message);
    }
  }

  generateSDP(streamInfo) {
    const localIP = this.getLocalIP();
    const sessionId = crypto.randomBytes(8).toString('hex');
    const timestamp = Math.floor(Date.now() / 1000);

    // Parse stream URL to get connection info
    const url = new URL(streamInfo.url);
    const protocol = url.protocol.replace(':', '');
    const address = url.hostname;
    const port = url.port;

    // Determine media type
    const mediaType = protocol === 'rtp' ? 'RTP/AVP' : 'udp';

    // Build SDP
    const sdp = [
      `v=0`,
      `o=- ${sessionId} ${timestamp} IN IP4 ${localIP}`,
      `s=${streamInfo.title || 'Torrent Stream'}`,
      `i=${streamInfo.description || 'Streaming via torrent-streamer'}`,
      `u=http://${localIP}:8881`,
      `c=IN IP4 ${address}/${this.ttl}`,
      `t=0 0`,
      `a=tool:torrent-streamer`,
      `a=type:broadcast`,
      `m=video ${port} ${mediaType} 96`,
      `a=rtpmap:96 H264/90000`
    ];

    if (streamInfo.quality) {
      sdp.push(`a=framerate:${streamInfo.quality.includes('1080') ? '30' : '24'}`);
    }

    return sdp.join('\r\n') + '\r\n';
  }

  announce(streamInfo) {
    if (!this.socket) {
      this.initialize();
    }

    const sessionId = streamInfo.streamId || `session-${Date.now()}`;
    
    // Stop existing announcement if any
    this.stopAnnouncement(sessionId);

    const sdp = this.generateSDP(streamInfo);
    
    // SAP packet format:
    // Version/Type (1 byte) | Auth Length (1 byte) | Message ID Hash (2 bytes) | Origin (4-16 bytes) | MIME type | Payload
    const localIP = this.getLocalIP();
    const ipParts = localIP.split('.').map(p => parseInt(p));
    
    // SAP header
    const version = 0x20; // Version 1, IPv4, announce
    const authLen = 0x00; // No authentication
    const msgIdHash = crypto.randomBytes(2);
    const originIP = Buffer.from(ipParts);
    
    // MIME type
    const mimeType = Buffer.from('application/sdp\0', 'utf8');
    
    // SDP payload
    const sdpBuffer = Buffer.from(sdp, 'utf8');
    
    // Construct SAP packet
    const sapPacket = Buffer.concat([
      Buffer.from([version, authLen]),
      msgIdHash,
      originIP,
      mimeType,
      sdpBuffer
    ]);

    // Store announcement config
    this.announcements.set(sessionId, {
      streamInfo,
      sdp,
      sapPacket,
      startTime: Date.now()
    });

    // Send initial announcement
    this.sendAnnouncement(sapPacket, sessionId);

    // Set up periodic announcements
    const interval = setInterval(() => {
      this.sendAnnouncement(sapPacket, sessionId);
    }, this.announceInterval);

    this.intervals.set(sessionId, interval);

    console.log(`📢 SAP announcement started for ${streamInfo.title || streamInfo.url}`);
    
    return sessionId;
  }

  sendAnnouncement(sapPacket, sessionId) {
    if (!this.socket) {
      return;
    }

    this.socket.send(sapPacket, 0, sapPacket.length, this.port, this.multicastAddr, (err) => {
      if (err) {
        console.error(`Error sending SAP announcement for ${sessionId}:`, err.message);
      }
    });
  }

  stopAnnouncement(sessionId) {
    // Clear interval
    const interval = this.intervals.get(sessionId);
    if (interval) {
      clearInterval(interval);
      this.intervals.delete(sessionId);
    }

    // Send deletion announcement (SAP version with deletion bit set)
    const announcement = this.announcements.get(sessionId);
    if (announcement && this.socket) {
      const localIP = this.getLocalIP();
      const ipParts = localIP.split('.').map(p => parseInt(p));
      
      const version = 0x24; // Version 1, IPv4, deletion
      const authLen = 0x00;
      const msgIdHash = crypto.randomBytes(2);
      const originIP = Buffer.from(ipParts);
      const mimeType = Buffer.from('application/sdp\0', 'utf8');
      const sdpBuffer = Buffer.from(announcement.sdp, 'utf8');
      
      const deletionPacket = Buffer.concat([
        Buffer.from([version, authLen]),
        msgIdHash,
        originIP,
        mimeType,
        sdpBuffer
      ]);

      this.sendAnnouncement(deletionPacket, sessionId);
    }

    this.announcements.delete(sessionId);
    console.log(`📢 SAP announcement stopped for ${sessionId}`);
  }

  stopAll() {
    for (const sessionId of this.announcements.keys()) {
      this.stopAnnouncement(sessionId);
    }
  }

  getActiveAnnouncements() {
    return Array.from(this.announcements.entries()).map(([sessionId, ann]) => ({
      sessionId,
      title: ann.streamInfo.title,
      url: ann.streamInfo.url,
      uptime: Date.now() - ann.startTime
    }));
  }

  destroy() {
    this.stopAll();
    if (this.socket) {
      this.socket.close();
      this.socket = null;
      console.log('📢 SAP Announcer destroyed');
    }
  }
}

export const sapAnnouncer = new SAPAnnouncer();
