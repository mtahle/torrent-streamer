import Bonjour from 'bonjour';
import AirPlay from 'airplay-protocol';

class AirPlayManager {
  constructor() {
    this.bonjour = null;
    this.browser = null;
    this.devices = new Map(); // deviceId -> {name, host, port, client}
    this.activeDevice = null;
    this.castingState = {
      deviceId: null,
      deviceName: null,
      status: 'idle', // idle, loading, playing, paused, stopped
      duration: 0,
      position: 0
    };
  }

  async init() {
    console.log('🍎 Initializing AirPlay manager...');
    this.bonjour = Bonjour();
    
    // Browse for AirPlay devices
    this.browser = this.bonjour.find({ type: 'airplay' });
    
    this.browser.on('up', (service) => {
      const deviceId = `${service.name}-${service.host}`;
      console.log(`🍎 AirPlay device discovered: ${service.name} at ${service.host}:${service.port}`);
      
      this.devices.set(deviceId, {
        id: deviceId,
        name: service.name,
        host: service.host,
        port: service.port || 7000,
        txt: service.txt,
        client: null
      });
    });
    
    this.browser.on('down', (service) => {
      const deviceId = `${service.name}-${service.host}`;
      console.log(`🍎 AirPlay device lost: ${service.name}`);
      this.devices.delete(deviceId);
    });

    return this;
  }

  getDevices() {
    return Array.from(this.devices.values()).map(device => ({
      id: device.id,
      name: device.name,
      host: device.host,
      port: device.port
    }));
  }

  async cast(deviceId, streamUrl, metadata = {}) {
    const device = this.devices.get(deviceId);
    if (!device) {
      throw new Error(`Device ${deviceId} not found`);
    }

    try {
      console.log(`🍎 Casting to ${device.name}: ${streamUrl}`);

      // Create AirPlay client if not exists
      if (!device.client) {
        device.client = new AirPlay(device.host, device.port);
      }

      const client = device.client;

      // Play the stream
      await client.play(streamUrl, {
        'Content-Type': metadata.contentType || 'video/mp4',
        'X-Apple-Purpose': 'slideshow'
      });

      this.activeDevice = deviceId;
      this.castingState = {
        deviceId,
        deviceName: device.name,
        status: 'playing',
        duration: metadata.duration || 0,
        position: 0
      };

      console.log(`✅ Successfully cast to ${device.name}`);

      return {
        success: true,
        device: device.name,
        status: 'playing'
      };
    } catch (error) {
      console.error(`Failed to cast to ${device.name}:`, error.message);
      throw error;
    }
  }

  async control(action, params = {}) {
    if (!this.activeDevice) {
      throw new Error('No active casting session');
    }

    const device = this.devices.get(this.activeDevice);
    if (!device || !device.client) {
      throw new Error('Device client not available');
    }

    const client = device.client;

    try {
      switch (action) {
        case 'play':
          await client.play();
          this.castingState.status = 'playing';
          console.log(`▶️  Playback resumed on ${device.name}`);
          break;

        case 'pause':
          await client.pause();
          this.castingState.status = 'paused';
          console.log(`⏸️  Playback paused on ${device.name}`);
          break;

        case 'stop':
          await client.stop();
          this.castingState.status = 'stopped';
          this.activeDevice = null;
          console.log(`⏹️  Playback stopped on ${device.name}`);
          break;

        case 'seek':
          if (params.position !== undefined) {
            await client.scrub(params.position);
            this.castingState.position = params.position;
            console.log(`⏩ Seeked to ${params.position}s on ${device.name}`);
          }
          break;

        case 'volume':
          if (params.level !== undefined) {
            await client.volume(params.level);
            console.log(`🔊 Volume set to ${params.level} on ${device.name}`);
          }
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      return {
        success: true,
        action,
        status: this.castingState.status
      };
    } catch (error) {
      console.error(`Failed to ${action} on ${device.name}:`, error.message);
      throw error;
    }
  }

  async getPlaybackInfo() {
    if (!this.activeDevice) {
      return { active: false };
    }

    const device = this.devices.get(this.activeDevice);
    if (!device || !device.client) {
      return { active: false };
    }

    try {
      const info = await device.client.playbackInfo();
      
      this.castingState.position = info.position || this.castingState.position;
      this.castingState.duration = info.duration || this.castingState.duration;

      return {
        active: true,
        device: device.name,
        ...this.castingState,
        ...info
      };
    } catch (error) {
      console.error('Failed to get playback info:', error.message);
      return {
        active: true,
        device: device.name,
        ...this.castingState
      };
    }
  }

  getStatus() {
    return {
      activeDevice: this.activeDevice,
      devicesCount: this.devices.size,
      ...this.castingState
    };
  }

  destroy() {
    console.log('🍎 Shutting down AirPlay manager...');
    
    // Stop all active sessions
    if (this.activeDevice) {
      const device = this.devices.get(this.activeDevice);
      if (device && device.client) {
        try {
          device.client.stop();
        } catch {}
      }
    }

    // Stop browsing
    if (this.browser) {
      this.browser.stop();
    }

    // Destroy bonjour
    if (this.bonjour) {
      this.bonjour.destroy();
    }

    this.devices.clear();
    this.activeDevice = null;
  }
}

const airplayManager = new AirPlayManager();
export { airplayManager, AirPlayManager };
