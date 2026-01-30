const socket = io();
let strokes = [];

function joinRoom(roomId, userName) {
  strokes = [];
  redraw(strokes); 
  socket.emit("JOIN_ROOM", { roomId, userName });
}

function leaveRoom(roomId) {
  socket.emit("LEAVE_ROOM", roomId);
}

function sendStroke(stroke) {
  socket.emit("STROKE_COMMIT", stroke);
}

socket.on("INIT_STATE", data => {
  strokes = data.strokes;
  redraw(strokes);
  document.getElementById("usersOnline").innerText = `Users: ${data.users}`;
});

socket.on("USER_LIST", count => {
  document.getElementById("usersOnline").innerText = `Users: ${count}`;
});

socket.on("ROOM_LIST", rooms => {
  const list = document.getElementById("roomList");
  list.innerHTML = `<option value="">-- Available Rooms --</option>`;
  rooms.forEach(r => {
    const opt = document.createElement("option");
    opt.value = r;
    opt.textContent = r;
    list.appendChild(opt);
  });
});

socket.on("STROKE_COMMIT", stroke => {
  strokes.push(stroke);
  redraw(strokes);
});

socket.on("UNDO", id => {
  strokes = strokes.filter(s => s.id !== id);
  redraw(strokes);
});

socket.on("REDO", stroke => {
  strokes.push(stroke);
  redraw(strokes);
});
