// Torrent Streamer - Metronic Integration
"use strict";

// Application class
class TorrentStreamer {
    constructor() {
        this.API = "";
        this.updateTimer = null;
    }

    // Initialize the application
    init() {
        this.bindEvents();
        this.startUpdates();
    }

    // Bind UI events
    bindEvents() {
        const self = this;
        
        // Start button
        document.getElementById('start-btn').onclick = function() {
            self.startTorrent();
        };

        // Stop button
        document.getElementById('stop-btn').onclick = function() {
            self.stopTorrent();
        };

        // File select button
        document.getElementById('select-file-btn').onclick = function() {
            self.selectFile();
        };

        // Enter key in input
        document.getElementById('magnet-input').onkeypress = function(e) {
            if (e.key === 'Enter') {
                self.startTorrent();
            }
        };
    }

    // Start torrent
    async startTorrent() {
        const input = document.getElementById('magnet-input');
        const magnet = input.value.trim();
        
        if (!magnet) {
            alert('Please paste a magnet link');
            return;
        }

        try {
            const response = await fetch(this.API + '/start', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ magnet })
            });

            if (!response.ok) {
                throw new Error('Start failed');
            }

            input.value = '';
            this.showSuccess('Torrent started!');

        } catch (error) {
            alert('Failed to start torrent');
            console.error(error);
        }
    }

    // Stop torrent
    async stopTorrent() {
        try {
            await fetch(this.API + '/stop', { method: 'POST' });
            this.showSuccess('Torrent stopped');
            this.resetUI();
        } catch (error) {
            console.error('Stop failed:', error);
        }
    }

    // Select file
    async selectFile() {
        const select = document.getElementById('file-select');
        const index = parseInt(select.value);
        
        if (isNaN(index)) {
            alert('Please select a file');
            return;
        }

        try {
            const response = await fetch(this.API + '/select', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({ index })
            });

            if (!response.ok) {
                throw new Error('Select failed');
            }

            this.showSuccess('File selected');

        } catch (error) {
            alert('Failed to select file');
            console.error(error);
        }
    }

    // Update status
    async updateStatus() {
        try {
            const response = await fetch(this.API + '/status');
            const status = await response.json();
            
            console.log('Status update:', status); // Debug log
            
            this.updateStats(status);
            this.updateProgress(status);
            this.updateStreamArea(status.running);
            
            if (status.running) {
                this.updateFiles();
            }

        } catch (error) {
            console.error('Status update failed:', error);
        }
    }

    // Update statistics
    updateStats(status) {
        // Active torrents
        document.getElementById('active-torrents').textContent = status.running ? '1' : '0';
        
        // Speeds
        const dlSpeed = status.running ? ((status.downloadSpeed || 0) / 1024 / 1024).toFixed(2) : '0';
        const upSpeed = status.running ? ((status.uploadSpeed || 0) / 1024 / 1024).toFixed(2) : '0';
        
        document.getElementById('download-speed').textContent = dlSpeed + ' MB/s';
        document.getElementById('upload-speed').textContent = upSpeed + ' MB/s';
        document.getElementById('peer-count').textContent = status.peers || '0';
        
        // Status text and badge
        const statusText = document.getElementById('status-text');
        const statusBadge = document.getElementById('status-badge');
        
        if (status.running) {
            statusText.textContent = `${status.name || 'Unknown'} - ${status.progress}% complete`;
            statusBadge.textContent = 'Streaming';
            statusBadge.className = 'badge badge-light-success';
        } else {
            statusText.textContent = 'No active torrents';
            statusBadge.textContent = 'Idle';
            statusBadge.className = 'badge badge-light-primary';
        }
    }

    // Update progress bar
    updateProgress(status) {
        const container = document.getElementById('progress-container');
        const bar = document.getElementById('progress-bar');
        const text = document.getElementById('progress-text');
        
        if (status.running && typeof status.progress === 'number') {
            container.style.display = 'block';
            bar.style.width = status.progress + '%';
            text.textContent = status.progress.toFixed(1) + '%';
        } else {
            container.style.display = 'none';
        }
    }

    // Update stream area
    updateStreamArea(isRunning) {
        console.log('updateStreamArea called with isRunning:', isRunning); // Debug log
        
        const area = document.getElementById('stream-area');
        const controls = document.getElementById('stream-controls');
        const link = document.getElementById('stream-link');
        
        console.log('Elements found:', area !== null, controls !== null, link !== null); // Debug log
        
        if (isRunning) {
            console.log('Setting stream to ready state'); // Debug log
            area.innerHTML = `
                <div style="font-size: 4rem; margin-bottom: 20px;">▶️</div>
                <div style="color: #10b981; margin-bottom: 10px; font-weight: bold;">Stream Ready!</div>
                <div style="color: #666; font-size: 0.9rem;">Click below to watch</div>
            `;
            controls.style.display = 'block';
            link.href = this.API + '/stream';
        } else {
            console.log('Setting stream to idle state'); // Debug log
            area.innerHTML = `
                <div style="font-size: 4rem; margin-bottom: 20px;">🎥</div>
                <div style="color: #666; margin-bottom: 10px;">No stream available</div>
                <div style="color: #999; font-size: 0.9rem;">Start a torrent to begin streaming</div>
            `;
            controls.style.display = 'none';
        }
    }

    // Update file list
    async updateFiles() {
        try {
            const response = await fetch(this.API + '/files');
            const data = await response.json();
            
            const card = document.getElementById('file-selection-card');
            const select = document.getElementById('file-select');
            
            if (data.files && data.files.length > 0) {
                // Filter for media/video files only
                const mediaFiles = data.files.filter(f => this.isMediaFile(f.name));
                
                if (mediaFiles.length > 1) {
                    select.innerHTML = mediaFiles.map(f =>
                        `<option value="${f.index}" ${f.index === data.selectedIndex ? 'selected' : ''}>
                            ${f.index}: ${f.name} (${this.formatBytes(f.size)})
                        </option>`
                    ).join('');
                    card.style.display = 'block';
                } else if (mediaFiles.length === 1) {
                    // Show single media file for reference
                    const f = mediaFiles[0];
                    select.innerHTML = `<option value="${f.index}" selected>
                        ${f.index}: ${f.name} (${this.formatBytes(f.size)}) - Auto-selected
                    </option>`;
                    card.style.display = 'block';
                } else {
                    // No media files found
                    select.innerHTML = '<option>No video files found</option>';
                    card.style.display = 'none';
                }
            } else {
                card.style.display = 'none';
            }

        } catch (error) {
            console.error('Files update failed:', error);
        }
    }

    // Reset UI to initial state
    resetUI() {
        // Reset stats
        document.getElementById('active-torrents').textContent = '0';
        document.getElementById('download-speed').textContent = '0 MB/s';
        document.getElementById('upload-speed').textContent = '0 MB/s';
        document.getElementById('peer-count').textContent = '0';
        
        // Reset progress
        document.getElementById('progress-container').style.display = 'none';
        
        // Reset file selection
        document.getElementById('file-selection-card').style.display = 'none';
        
        // Reset stream area
        this.updateStreamArea(false);
    }

    // Start periodic updates
    startUpdates() {
        this.updateStatus(); // Update immediately
        this.updateTimer = setInterval(() => {
            this.updateStatus();
        }, 1000);
    }

    // Stop periodic updates
    stopUpdates() {
        if (this.updateTimer) {
            clearInterval(this.updateTimer);
            this.updateTimer = null;
        }
    }

    // Show success message
    showSuccess(message) {
        console.log('Success:', message);
    }

    // Check if file is a media/video file
    isMediaFile(filename) {
        const mediaExtensions = [
            '.mp4', '.mkv', '.avi', '.mov', '.wmv', '.flv', '.webm', 
            '.m4v', '.mpg', '.mpeg', '.3gp', '.ts', '.m2ts', '.mts',
            '.divx', '.xvid', '.rmvb', '.rm', '.asf', '.ogv', '.mxf'
        ];
        
        const lowerName = filename.toLowerCase();
        return mediaExtensions.some(ext => lowerName.endsWith(ext));
    }

    // Format bytes
    formatBytes(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing TorrentStreamer');
    const app = new TorrentStreamer();
    app.init();
    
    // Store globally for debugging
    window.torrentApp = app;
    
    console.log('TorrentStreamer initialized');
});
