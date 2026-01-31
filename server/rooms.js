const StateManager = require("./state-manager");

module.exports = function (io) {
  const rooms = {};
  const getRoomList = () => Object.keys(rooms);
  return {
    join(socket, { roomId, userName }) {
      if (!rooms[roomId]) {
        rooms[roomId] = new StateManager();
      }

      const room = rooms[roomId];
      socket.join(roomId);

      room.addUser(socket.id, userName);

      socket.emit("INIT_STATE", {
        strokes: room.getStrokes(),
        users: room.getUserCount()
      });

      io.emit("ROOM_LIST", getRoomList());
      io.to(roomId).emit("USER_LIST", room.getUserCount());

      /* ===== STROKES ===== */
      const onStroke = stroke => {
        room.addStroke(stroke);
        io.to(roomId).emit("STROKE_COMMIT", stroke);
      };

      const onUndo = () => {
        const s = room.undo();
        if (s) io.to(roomId).emit("UNDO", s.id);
      };

      const onRedo = () => {
        const s = room.redo();
        if (s) io.to(roomId).emit("REDO", s);
      };

      socket.on("STROKE_COMMIT", onStroke);
      socket.on("UNDO", onUndo);
      socket.on("REDO", onRedo);

      /* ===== LEAVE / DISCONNECT ===== */
      const cleanup = () => {
        socket.removeListener("STROKE_COMMIT", onStroke);
        socket.removeListener("UNDO", onUndo);
        socket.removeListener("REDO", onRedo);

        room.removeUser(socket.id);

        if (room.getUserCount() === 0) {
          delete rooms[roomId];
        }

        io.emit("ROOM_LIST", getRoomList());
        io.to(roomId).emit("USER_LIST", room.getUserCount());
      };

      socket.on("LEAVE_ROOM", () => {
        socket.leave(roomId);
        cleanup();
      });

      socket.on("disconnect", cleanup);
    }
  };
};
