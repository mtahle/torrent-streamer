#!/bin/bash
# Torrent Streamer PM2 Management Script

case "$1" in
  start)
    echo "Starting torrent-streamer with PM2..."
    pm2 start server.js --name "torrent-streamer" --max-memory-restart 1G
    pm2 save
    ;;
  stop)
    echo "Stopping torrent-streamer..."
    pm2 stop torrent-streamer
    ;;
  restart)
    echo "Restarting torrent-streamer..."
    pm2 restart torrent-streamer
    ;;
  status)
    pm2 status torrent-streamer
    ;;
  logs)
    pm2 logs torrent-streamer --lines 50
    ;;
  monitor)
    pm2 monit
    ;;
  info)
    pm2 info torrent-streamer
    ;;
  delete)
    echo "Deleting torrent-streamer from PM2..."
    pm2 delete torrent-streamer
    pm2 save
    ;;
  *)
    echo "Usage: $0 {start|stop|restart|status|logs|monitor|info|delete}"
    echo ""
    echo "Commands:"
    echo "  start   - Start the torrent streamer with PM2"
    echo "  stop    - Stop the application"
    echo "  restart - Restart the application"
    echo "  status  - Show PM2 status"
    echo "  logs    - Show application logs"
    echo "  monitor - Open PM2 monitoring interface"
    echo "  info    - Show detailed process information"
    echo "  delete  - Remove from PM2"
    echo ""
    echo "App URL: http://localhost:8881"
    exit 1
    ;;
esac