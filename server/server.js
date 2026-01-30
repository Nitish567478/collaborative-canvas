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

server.listen(3000, () => {
  console.log("Server running at http://localhost:3000");
});
