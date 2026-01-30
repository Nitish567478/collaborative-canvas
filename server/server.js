const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const createRooms = require("./rooms");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("client"));

const rooms = createRooms(io);

io.on("connection", socket => {
  socket.on("JOIN_ROOM", data => rooms.join(socket, data));
});

const PORT = process.env.PORT || 3000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
