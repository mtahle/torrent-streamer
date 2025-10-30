import express from "express";
import WebTorrent from "webtorrent";
import mime from "mime";
import rangeParser from "range-parser";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// serve the simple UI
app.use(express.static(path.join(__dirname, "public")));
// serve Metronic assets
app.use('/assets', express.static(path.join(__dirname, "public/assets")));

const client = new WebTorrent();
let active = {
  torrent: null,
  file: null,
  fileIndex: null
};

// Start streaming a magnet/torrent
app.post("/start", async (req, res) => {
  const { magnet } = req.body || {};
  if (!magnet) return res.status(400).json({ error: "magnet required" });

  // stop previous torrent if any
  if (active.torrent) {
    try { active.torrent.destroy(); } catch {}
    active = { torrent: null, file: null, fileIndex: null };
  }

  client.add(magnet, { path: "./data" }, (torrent) => {
    // choose largest video file by default
    const pick = (files) =>
      files
        .filter(f => /\.(mp4|mkv|mov|avi|webm|m4v)$/i.test(f.name))
        .sort((a, b) => b.length - a.length)[0] || files[0];

    const file = pick(torrent.files);
    active = { torrent, file, fileIndex: torrent.files.indexOf(file) };

    // nudge priority on chosen file
    try { file.select(); } catch {}

    res.json({
      ok: true,
      infoHash: torrent.infoHash,
      name: file ? file.name : torrent.name,
      size: file ? file.length : null,
      stream_url: "/stream",
      files_url: "/files"
    });
  });
});

// Stop and cleanup
app.post("/stop", (_req, res) => {
  if (!active.torrent) return res.json({ stopped: true });
  active.torrent.destroy(() => {
    active = { torrent: null, file: null, fileIndex: null };
    res.json({ stopped: true });
  });
});

// List files in the current torrent (for selection)
app.get("/files", (_req, res) => {
  if (!active.torrent) return res.json({ files: [] });
  const files = active.torrent.files.map((f, idx) => ({
    index: idx,
    name: f.name,
    size: f.length
  }));
  res.json({
    files,
    selectedIndex: active.fileIndex
  });
});

// Select a specific file by index
app.post("/select", (req, res) => {
  const { index } = req.body || {};
  if (!active.torrent) return res.status(400).json({ error: "no active torrent" });
  if (index == null || isNaN(index) || index < 0 || index >= active.torrent.files.length) {
    return res.status(400).json({ error: "invalid index" });
  }
  // deselect all, select chosen
  active.torrent.files.forEach(f => { try { f.deselect(); } catch {} });
  const file = active.torrent.files[index];
  try { file.select(); } catch {}
  active.file = file;
  active.fileIndex = index;
  res.json({ ok: true, name: file.name, size: file.length, stream_url: "/stream" });
});

// Status endpoint
app.get("/status", (_req, res) => {
  if (!active.torrent) return res.json({ running: false });
  const t = active.torrent;
  res.json({
    running: true,
    name: active.file?.name,
    infoHash: t.infoHash,
    progress: Number((t.progress * 100).toFixed(2)),
    downloadSpeed: t.downloadSpeed,
    uploadSpeed: t.uploadSpeed,
    peers: t.numPeers,
    selectedIndex: active.fileIndex
  });
});

// Stream endpoint (supports HTTP range for VLC / players)
app.get("/stream", (req, res) => {
  if (!active.file) return res.status(404).end("No active file");

  const file = active.file;
  const mimeType = mime.getType(file.name) || "application/octet-stream";
  const total = file.length;

  // Handle client disconnection
  req.on("close", () => {
    console.log("Client disconnected from stream");
  });

  res.on("error", (err) => {
    console.log("Stream error:", err.message);
  });

  // Parse Range header for partial content
  const parsed = req.headers.range ? rangeParser(total, req.headers.range) : -1;
  const range = Array.isArray(parsed) ? parsed[0] : null;

  if (range) {
    const { start, end } = range;
    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${total}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": mimeType,
      "Cache-Control": "no-store"
    });
    
    const stream = file.createReadStream({ start, end });
    stream.on("error", (err) => {
      console.log("File stream error:", err.message);
      if (!res.headersSent) {
        res.status(500).end("Stream error");
      }
    });
    
    stream.pipe(res);
  } else {
    res.writeHead(200, {
      "Content-Length": total,
      "Content-Type": mimeType,
      "Accept-Ranges": "bytes",
      "Cache-Control": "no-store"
    });
    
    const stream = file.createReadStream();
    stream.on("error", (err) => {
      console.log("File stream error:", err.message);
      if (!res.headersSent) {
        res.status(500).end("Stream error");
      }
    });
    
    stream.pipe(res);
  }
});

// Basic health check
app.get("/healthz", (_req, res) => res.json({ ok: true }));

// Graceful shutdown
const shutdown = () => {
  console.log("\nShutting down…");
  if (active.torrent) {
    try { active.torrent.destroy(); } catch {}
  }
  client.destroy(() => process.exit(0));
};
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

const PORT = 8881;
app.listen(PORT, "0.0.0.0", () =>
  console.log(`Streamer on http://0.0.0.0:${PORT}`)
);
