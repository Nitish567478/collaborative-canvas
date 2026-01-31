const socket = io();
window.allStrokes = [];

/* ===== ROOM ACTIONS ===== */
function joinRoom(roomId, userName) {
  window.allStrokes = [];
  redraw(window.allStrokes);
  socket.emit("JOIN_ROOM", { roomId, userName });
}

function leaveRoom(roomId) {
  socket.emit("LEAVE_ROOM", roomId);
}

/* ===== STROKES ===== */

function sendStroke(stroke) {
  socket.emit("STROKE_COMMIT", stroke);
}

/* ===== SOCKET EVENTS ===== */

socket.on("INIT_STATE", data => {
  window.allStrokes = data.strokes || [];
  redraw(window.allStrokes);

  document.getElementById("usersOnline").innerText =
    `Users: ${data.users}`;
});

socket.on("USER_LIST", count => {
  document.getElementById("usersOnline").innerText =
    `Users: ${count}`;
});

socket.on("STROKE_COMMIT", stroke => {
  window.allStrokes.push(stroke);
  redraw(window.allStrokes);
});

socket.on("UNDO", strokeId => {
  window.allStrokes = window.allStrokes.filter(s => s.id !== strokeId);
  redraw(window.allStrokes);
});

socket.on("REDO", stroke => {
  window.allStrokes.push(stroke);
  redraw(window.allStrokes);
});

 
