import dlnacasts2 from 'dlnacasts2';

class DLNAManager {
  constructor() {
    this.scanner = null;
    this.devices = new Map(); // deviceId -> device object
    this.currentCast = null; // currently casting player
    this.castingState = {
      deviceId: null,
      deviceName: null,
      status: 'idle', // idle, loading, playing, paused, stopped
      position: 0,
      duration: 0
    };
  }

  initialize() {
    console.log('🔍 Initializing DLNA scanner...');
    this.scanner = dlnacasts2();
    
    this.scanner.on('update', (device) => {
      console.log(`📺 DLNA device discovered: ${device.name}`);
      this.devices.set(device.id || device.name, device);
    });

    return this;
  }

  getDevices() {
    return Array.from(this.devices.values()).map(device => ({
      id: device.id || device.name,
      name: device.name,
      host: device.host
    }));
  }

  async cast(deviceId, streamUrl, metadata = {}) {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    try {
      // Stop current cast if any
      if (this.currentCast) {
        await this.stop();
      }

      console.log(`📡 Casting to ${device.name}: ${streamUrl}`);
      
      const player = device.play(streamUrl, {
        title: metadata.title || 'Torrent Stream',
        type: metadata.contentType || 'video/mp4',
        subtitles: metadata.subtitles || []
      });

      this.currentCast = player;
      this.castingState = {
        deviceId: device.id,
        deviceName: device.name,
        status: 'loading',
        position: 0,
        duration: 0,
        metadata: metadata
      };

      // Set up event listeners
      player.on('playing', () => {
        console.log(`▶️  Playback started on ${device.name}`);
        this.castingState.status = 'playing';
      });

      player.on('paused', () => {
        console.log(`⏸️  Playback paused on ${device.name}`);
        this.castingState.status = 'paused';
      });

      player.on('stopped', () => {
        console.log(`⏹️  Playback stopped on ${device.name}`);
        this.castingState.status = 'stopped';
        this.currentCast = null;
      });

      player.on('error', (err) => {
        console.error(`❌ DLNA playback error: ${err.message}`);
        this.castingState.status = 'error';
      });

      return {
        success: true,
        device: device.name,
        castingState: this.castingState
      };
    } catch (error) {
      console.error(`Failed to cast to ${device.name}:`, error.message);
      throw error;
    }
  }

  async pause() {
    if (!this.currentCast) {
      throw new Error('No active cast');
    }
    this.currentCast.pause();
    this.castingState.status = 'paused';
  }

  async play() {
    if (!this.currentCast) {
      throw new Error('No active cast');
    }
    this.currentCast.play();
    this.castingState.status = 'playing';
  }

  async stop() {
    if (!this.currentCast) {
      return;
    }
    this.currentCast.stop();
    this.castingState = {
      deviceId: null,
      deviceName: null,
      status: 'idle',
      position: 0,
      duration: 0
    };
    this.currentCast = null;
  }

  async seek(seconds) {
    if (!this.currentCast) {
      throw new Error('No active cast');
    }
    this.currentCast.seek(seconds);
    this.castingState.position = seconds;
  }

  getStatus() {
    return {
      ...this.castingState,
      hasActiveCast: this.currentCast !== null,
      devicesAvailable: this.devices.size
    };
  }

  destroy() {
    if (this.currentCast) {
      this.currentCast.stop();
    }
    if (this.scanner) {
      this.scanner.destroy();
    }
  }
}

// Export singleton instance
export const dlnaManager = new DLNAManager();
