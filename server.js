const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const PORT = process.env.PORT || 8000;
app.use(express.static(path.join(__dirname, "public")));

const players = new Map();
const leaderboard = new Map();
const ACTION_POINTS = { incense: 10, bow: 5, donate: 5, mallet: 1, bell: 1 };

io.on("connection", (socket) => {
  socket.on("joinTemple", (data = {}) => {
    const player = {
      id: socket.id,
      name: String(data.name || "Tâm An").trim().slice(0, 18) || "Tâm An",
      role: data.role === "nun" ? "nun" : "monk",
      x: Number(data.x) || (Math.random() * 8 - 4),
      z: Number(data.z) || (Math.random() * 5 + 2),
      action: "idle",
      message: ""
    };
    players.set(socket.id, player);
    if (!leaderboard.has(player.name)) leaderboard.set(player.name, 0);
    socket.emit("joined", { id: socket.id, players: [...players.values()], leaderboard: topScores() });
    socket.broadcast.emit("playerJoined", player);
    io.emit("presence", players.size);
  });

  socket.on("move", ({ x, z }) => {
    const p = players.get(socket.id); if (!p) return;
    p.x = Math.max(-7, Math.min(7, Number(x) || 0));
    p.z = Math.max(1.5, Math.min(10, Number(z) || 2));
    io.emit("playerMoved", { id: socket.id, x: p.x, z: p.z });
  });

  socket.on("action", ({ action }) => {
    const p = players.get(socket.id); if (!p) return;
    const allowed = ["idle", "stand", "bow", "meditate", "incense", "mallet", "bell"];
    if (!allowed.includes(action)) return;
    p.action = action;
    const points = ACTION_POINTS[action] || 0;
    if (points) {
      leaderboard.set(p.name, (leaderboard.get(p.name) || 0) + points);
      io.emit("leaderboard", topScores());
    }
    io.emit("playerAction", { id: socket.id, action, name: p.name, points });
  });

  socket.on("chat", ({ text }) => {
    const p = players.get(socket.id); if (!p) return;
    const message = String(text || "").trim().slice(0, 160);
    if (!message) return;
    io.emit("chatMessage", { id: socket.id, name: p.name, text: message, at: Date.now() });
  });

  socket.on("donate", ({ amount }) => {
    const p = players.get(socket.id); if (!p) return;
    const value = Number(amount);
    if (![5000, 10000, 20000, 50000, 100000].includes(value)) return;
    leaderboard.set(p.name, (leaderboard.get(p.name) || 0) + ACTION_POINTS.donate);
    io.emit("donationNotice", { name: p.name, amount: value, points: ACTION_POINTS.donate });
    io.emit("leaderboard", topScores());
  });

  socket.on("disconnect", () => {
    const p = players.get(socket.id);
    players.delete(socket.id);
    if (p) io.emit("playerLeft", { id: socket.id, name: p.name });
    io.emit("presence", players.size);
  });
});

function topScores() {
  return [...leaderboard.entries()].map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score).slice(0, 10);
}
server.listen(PORT, () => console.log(`Chùa Online đang chạy tại http://localhost:${PORT}`));