export default {
  apps: [{
    name: 'torrent-streamer',
    script: 'server.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true,
    autorestart: true,
    restart_delay: 1000,
    max_restarts: 10,
    min_uptime: '10s',
    env: {
      NODE_ENV: 'production',
      PORT: 8881
    },
    env_development: {
      NODE_ENV: 'development',
      PORT: 8881
    }
  }]
};