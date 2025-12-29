# Torrent Streamer

Lightweight torrent streaming server built with Node.js and WebTorrent. Start playback while the torrent downloads (HTTP range supported).

## Features

- Web UI served from `public/`
- REST API for start/stop/select/status
- Picks the largest video file by default; supports multi-file selection
- Streams over `GET /stream` (works with VLC and most players)

## Quick start

Prereqs: Node.js 18+ and npm.

```bash
git clone https://github.com/mtahle/torrent-streamer.git
cd torrent-streamer
npm install
npm start
```

Open `http://localhost:8881`.

## Usage

### Web UI

- Open `/` in a browser, paste a magnet link, press Start.
- Copy the stream URL into a player (VLC: “Open Network Stream…”).

Note: `docs/ui-variants/` contains older HTML experiments and is not served by `server.js`.

### API

Start a torrent (replaces any currently-running torrent):

```bash
curl -X POST http://localhost:8881/start \
  -H "Content-Type: application/json" \
  -d '{"magnet":"magnet:?xt=urn:btih:..."}'
```

List files and select a specific file (useful for bundles):

```bash
curl http://localhost:8881/files
curl -X POST http://localhost:8881/select -H "Content-Type: application/json" -d '{"index":0}'
```

Stream the selected file:

- `http://localhost:8881/stream`

## API reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/start` | Start torrent from magnet link (auto-selects a file) |
| `POST` | `/stop` | Stop current torrent |
| `POST` | `/select` | Select file by index |
| `GET` | `/status` | Progress, speeds, peers, selected index |
| `GET` | `/files` | Torrent file list |
| `GET` | `/stream` | Stream selected file (supports Range) |
| `GET` | `/healthz` | Health check |

## Configuration

- `PORT` (default `8881`)
- `HOST` (default `0.0.0.0`)
- Downloads are stored under `./data/` (gitignored)

## Deployment (PM2)

```bash
npm install -g pm2
./pm2-control.sh start
./pm2-control.sh logs
```

## Project layout

`server.js` (API + streaming), `public/` (UI), `docs/ui-variants/` (not served), `ecosystem.config.js` + `pm2-control.sh` (PM2).

## Contributing / changes

- Contributing guide: `CONTRIBUTING.md`
- Release notes: `CHANGELOG.md`

## Legal

You are responsible for complying with local laws and the terms of the content you download/stream.

## License

MIT — see `LICENSE`.
