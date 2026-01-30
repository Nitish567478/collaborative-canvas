// ===== DOM ELEMENTS =====
const joinRoomBtn = document.getElementById("joinRoom");
const leaveRoomBtn = document.getElementById("leaveRoom");

const userNameInput = document.getElementById("userName");
const roomIdInput = document.getElementById("roomId");

const colorPicker = document.getElementById("colorPicker");
const strokeWidthSlider = document.getElementById("strokeWidth");

const brushBtn = document.getElementById("brush");
const eraserBtn = document.getElementById("eraser");

const undoBtn = document.getElementById("undo");
const redoBtn = document.getElementById("redo");

// ===== GLOBAL STATE =====
window.currentRoom = null;
window.currentUserName = null;
window.currentColor = "#000000";
window.strokeWidth = 5;
window.isEraser = false;

// ===== JOIN ROOM =====
joinRoomBtn.onclick = () => {
  const name = userNameInput.value.trim();
  const roomId = roomIdInput.value.trim();

  if (!name || !roomId) {
    alert("Please enter BOTH your Name and Room ID.");
    return;
  }

  window.currentUserName = name;
  window.currentRoom = roomId;

  joinRoom(roomId, name);
  alert(`Joined room "${roomId}" as ${name}`);
};

// ===== LEAVE ROOM =====
leaveRoomBtn.onclick = () => {
  if (!window.currentRoom) {
    alert("You are not in any room.");
    return;
  }

  socket.emit("LEAVE_ROOM", window.currentRoom);
  location.reload(); // full reset
};

// ===== TOOL CONTROLS =====
colorPicker.onchange = e => {
  window.currentColor = e.target.value;
};

strokeWidthSlider.oninput = e => {
  window.strokeWidth = Number(e.target.value);
};

brushBtn.onclick = () => {
  window.isEraser = false;
  brushBtn.classList.add("active");
  eraserBtn.classList.remove("active");
};

eraserBtn.onclick = () => {
  window.isEraser = true;
  eraserBtn.classList.add("active");
  brushBtn.classList.remove("active");
};

// ===== UNDO / REDO =====
undoBtn.onclick = () => {
  if (!window.currentRoom) {
    alert("Join a room first.");
    return;
  }
  socket.emit("UNDO");
};

redoBtn.onclick = () => {
  if (!window.currentRoom) {
    alert("Join a room first.");
    return;
  }
  socket.emit("REDO");
};
