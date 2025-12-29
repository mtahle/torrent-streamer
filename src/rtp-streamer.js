import { spawn } from 'child_process';
import { EventEmitter } from 'events';
import os from 'os';

class RTPStreamer extends EventEmitter {
  constructor() {
    super();
    this.streams = new Map(); // streamId -> stream object
    this.ffmpegPath = 'ffmpeg';
    this.defaultRtpPort = 5004;
    this.defaultMulticastAddr = '239.255.1.1';
    this.defaultUdpPort = 1234;
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

  async startRTPStream(file, metadata = {}, options = {}) {
    const streamId = `rtp-${Date.now()}`;
    const port = options.port || this.defaultRtpPort;
    const multicast = options.multicast !== false;
    const multicastAddr = options.multicastAddr || this.defaultMulticastAddr;
    
    // Determine output URL
    const outputUrl = multicast 
      ? `rtp://${multicastAddr}:${port}`
      : `rtp://0.0.0.0:${port}`;

    console.log(`📡 Starting RTP stream: ${outputUrl}`);

    return new Promise((resolve, reject) => {
      // Create read stream from torrent file
      const inputStream = file.createReadStream();

      // FFmpeg arguments for RTP streaming
      const ffmpegArgs = [
        '-i', 'pipe:0',                    // Input from stdin
        '-c:v', 'libx264',                 // Video codec
        '-preset', 'ultrafast',            // Fast encoding
        '-tune', 'zerolatency',            // Low latency
        '-c:a', 'aac',                     // Audio codec
        '-b:a', '128k',                    // Audio bitrate
        '-f', 'rtp',                       // Output format
        outputUrl
      ];

      if (multicast) {
        ffmpegArgs.splice(ffmpegArgs.length - 1, 0, '-ttl', '16'); // Multicast TTL
      }

      const ffmpeg = spawn(this.ffmpegPath, ffmpegArgs);

      const stream = {
        id: streamId,
        process: ffmpeg,
        inputStream,
        file,
        port,
        multicast,
        multicastAddr,
        url: outputUrl,
        metadata,
        startTime: Date.now(),
        status: 'starting'
      };

      // Pipe torrent file data to FFmpeg
      inputStream.pipe(ffmpeg.stdin);

      ffmpeg.stdout.on('data', (data) => {
        // FFmpeg outputs to stderr, not stdout typically
      });

      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('muxing overhead') || output.includes('frame=')) {
          if (stream.status === 'starting') {
            stream.status = 'streaming';
            console.log(`✅ RTP stream started: ${outputUrl}`);
            this.emit('stream-started', streamId);
          }
        }
      });

      ffmpeg.on('error', (error) => {
        console.error(`❌ FFmpeg error:`, error.message);
        stream.status = 'error';
        this.emit('stream-error', streamId, error);
        reject(error);
      });

      ffmpeg.on('close', (code) => {
        console.log(`⏹️  RTP stream stopped: ${outputUrl} (exit code: ${code})`);
        stream.status = 'stopped';
        this.streams.delete(streamId);
        this.emit('stream-stopped', streamId);
      });

      this.streams.set(streamId, stream);

      // Resolve after a short delay to allow FFmpeg to initialize
      setTimeout(() => {
        resolve({
          streamId,
          url: outputUrl,
          port,
          multicast,
          multicastAddr: multicast ? multicastAddr : null,
          metadata
        });
      }, 1000);
    });
  }

  async startUDPStream(file, metadata = {}, options = {}) {
    const streamId = `udp-${Date.now()}`;
    const port = options.port || this.defaultUdpPort;
    const multicastAddr = options.multicastAddr || this.defaultMulticastAddr;
    const outputUrl = `udp://${multicastAddr}:${port}`;

    console.log(`📡 Starting UDP stream: ${outputUrl}`);

    return new Promise((resolve, reject) => {
      const inputStream = file.createReadStream();

      const ffmpegArgs = [
        '-i', 'pipe:0',
        '-c:v', 'libx264',
        '-preset', 'ultrafast',
        '-tune', 'zerolatency',
        '-c:a', 'aac',
        '-b:a', '128k',
        '-f', 'mpegts',                    // MPEG-TS for UDP
        outputUrl
      ];

      const ffmpeg = spawn(this.ffmpegPath, ffmpegArgs);

      const stream = {
        id: streamId,
        process: ffmpeg,
        inputStream,
        file,
        port,
        multicastAddr,
        url: outputUrl,
        metadata,
        startTime: Date.now(),
        status: 'starting'
      };

      inputStream.pipe(ffmpeg.stdin);

      ffmpeg.stderr.on('data', (data) => {
        const output = data.toString();
        if (output.includes('muxing overhead') || output.includes('frame=')) {
          if (stream.status === 'starting') {
            stream.status = 'streaming';
            console.log(`✅ UDP stream started: ${outputUrl}`);
            this.emit('stream-started', streamId);
          }
        }
      });

      ffmpeg.on('error', (error) => {
        console.error(`❌ FFmpeg error:`, error.message);
        stream.status = 'error';
        this.emit('stream-error', streamId, error);
        reject(error);
      });

      ffmpeg.on('close', (code) => {
        console.log(`⏹️  UDP stream stopped: ${outputUrl} (exit code: ${code})`);
        stream.status = 'stopped';
        this.streams.delete(streamId);
        this.emit('stream-stopped', streamId);
      });

      this.streams.set(streamId, stream);

      setTimeout(() => {
        resolve({
          streamId,
          url: outputUrl,
          port,
          multicastAddr,
          metadata
        });
      }, 1000);
    });
  }

  stopStream(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream) {
      throw new Error(`Stream ${streamId} not found`);
    }

    console.log(`⏹️  Stopping stream: ${streamId}`);
    
    // Gracefully stop FFmpeg
    if (stream.process && !stream.process.killed) {
      stream.process.stdin.end();
      stream.process.kill('SIGTERM');
      
      // Force kill after 5 seconds if not stopped
      setTimeout(() => {
        if (stream.process && !stream.process.killed) {
          stream.process.kill('SIGKILL');
        }
      }, 5000);
    }

    // Cleanup input stream
    if (stream.inputStream) {
      stream.inputStream.destroy();
    }

    this.streams.delete(streamId);
    return true;
  }

  stopAllStreams() {
    for (const streamId of this.streams.keys()) {
      try {
        this.stopStream(streamId);
      } catch (error) {
        console.error(`Error stopping stream ${streamId}:`, error.message);
      }
    }
  }

  getStreamStatus(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream) {
      return null;
    }

    return {
      id: stream.id,
      url: stream.url,
      port: stream.port,
      multicast: stream.multicast || false,
      multicastAddr: stream.multicastAddr || null,
      status: stream.status,
      uptime: Date.now() - stream.startTime,
      metadata: stream.metadata
    };
  }

  getAllStreams() {
    return Array.from(this.streams.values()).map(stream => ({
      id: stream.id,
      url: stream.url,
      port: stream.port,
      status: stream.status,
      uptime: Date.now() - stream.startTime,
      metadata: stream.metadata
    }));
  }

  async checkFFmpeg() {
    return new Promise((resolve) => {
      const ffmpeg = spawn(this.ffmpegPath, ['-version']);
      ffmpeg.on('error', () => resolve(false));
      ffmpeg.on('close', (code) => resolve(code === 0));
    });
  }
}

export const rtpStreamer = new RTPStreamer();
