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

const rectBtn = document.getElementById("shape-rect");
const squareBtn = document.getElementById("shape-square");
const circleBtn = document.getElementById("shape-circle");
const triangleBtn = document.getElementById("shape-triangle");
const lineBtn = document.getElementById("shape-line");
const textBtn = document.getElementById("shape-text");
const imageBtn = document.getElementById("shape-image");

// ===== GLOBAL STATE =====
window.currentRoom = null;
window.currentUserName = null;
window.currentColor = "#000000";
window.strokeWidth = 5;
window.isEraser = false;
window.currentTool = "brush";

// ===== HELPERS =====
function clearActiveTools() {
  [
    brushBtn,
    eraserBtn,
    rectBtn,
    squareBtn,
    circleBtn,
    triangleBtn,
    lineBtn,
    textBtn,
    imageBtn
  ].forEach(btn => btn && btn.classList.remove("active"));
}

/* ===== AUTO REJOIN ON RELOAD ===== */
window.addEventListener("load", () => {
  const savedName = sessionStorage.getItem("userName");
  const savedRoom = sessionStorage.getItem("roomId");

  if (savedName && savedRoom) {
    userNameInput.value = savedName;
    roomIdInput.value = savedRoom;

    window.currentUserName = savedName;
    window.currentRoom = savedRoom;

    joinRoom(savedRoom, savedName);
  }
});

// ===== JOIN ROOM =====
joinRoomBtn.onclick = () => {
  const name = userNameInput.value.trim();
  const roomId = roomIdInput.value.trim();

  if (!name || !roomId) {
    alert("Please enter BOTH your Name and Room ID.");
    return;
  }

  sessionStorage.setItem("userName", name);
  sessionStorage.setItem("roomId", roomId);

  window.currentUserName = name;
  window.currentRoom = roomId;

  joinRoom(roomId, name);
};

// ===== LEAVE ROOM =====
leaveRoomBtn.onclick = () => {
  if (!window.currentRoom) {
    alert("You are not in any room.");
    return;
  }

  socket.emit("LEAVE_ROOM", window.currentRoom);

  // CLEAR SESSION 
  sessionStorage.removeItem("userName");
  sessionStorage.removeItem("roomId");

  window.currentRoom = null;
  window.currentUserName = null;

  location.reload();
};

// ===== TOOL CONTROLS =====
colorPicker.onchange = e => window.currentColor = e.target.value;
strokeWidthSlider.oninput = e => window.strokeWidth = Number(e.target.value);

brushBtn.onclick = () => {
  clearActiveTools();
  window.currentTool = "brush";
  window.isEraser = false;
  brushBtn.classList.add("active");
};

eraserBtn.onclick = () => {
  clearActiveTools();
  window.currentTool = "eraser";
  window.isEraser = true;
  eraserBtn.classList.add("active");
};

// ===== SHAPES =====
rectBtn.onclick = () => { clearActiveTools(); window.currentTool = "rect"; rectBtn.classList.add("active"); };
squareBtn.onclick = () => { clearActiveTools(); window.currentTool = "rect"; squareBtn.classList.add("active"); };
circleBtn.onclick = () => { clearActiveTools(); window.currentTool = "circle"; circleBtn.classList.add("active"); };
triangleBtn.onclick = () => { clearActiveTools(); window.currentTool = "triangle"; triangleBtn.classList.add("active"); };
lineBtn.onclick = () => { clearActiveTools(); window.currentTool = "line"; lineBtn.classList.add("active"); };
textBtn.onclick = () => { clearActiveTools(); window.currentTool = "text"; textBtn.classList.add("active"); };
imageBtn.onclick = () => { clearActiveTools(); window.currentTool = "image"; imageBtn.onclick = () => {
  clearActiveTools();
  window.currentTool = "image";
  imageBtn.classList.add("active");
  imageInput.click();
};
 };

// ===== UNDO / REDO =====
undoBtn.onclick = () => window.currentRoom && socket.emit("UNDO");
redoBtn.onclick = () => window.currentRoom && socket.emit("REDO");
